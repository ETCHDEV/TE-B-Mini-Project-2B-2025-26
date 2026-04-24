import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { useToast } from '@/hooks/use-toast';

export type ViolationType = 'tab_switch' | 'body_movement' | 'camera_hidden';

export interface Violation {
  type: ViolationType;
  timestamp: string;
}

interface ProctoringContextType {
  isProctoringActive: boolean;
  hasPermissions: boolean;
  warningCount: number;
  violations: Violation[];
  videoRef: React.RefObject<HTMLVideoElement>;
  startProctoring: () => Promise<boolean>;
  stopProctoring: () => void;
  requestPermissions: () => Promise<boolean>;
  isModelLoading: boolean;
}

const ProctoringContext = createContext<ProctoringContextType | undefined>(undefined);

export const MAX_WARNINGS = 3;

export function ProctoringProvider({ children, onMaxWarningsReached }: { children: ReactNode, onMaxWarningsReached?: () => void }) {
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const { toast } = useToast();
  
  const lastViolationTime = useRef<{ [key: string]: number }>({});

  const addViolation = (type: ViolationType) => {
    if (!isProctoringActive) return;
    
    // Cooldown to prevent double counting (e.g. blur + visibilitychange)
    const now = Date.now();
    if (lastViolationTime.current[type] && now - lastViolationTime.current[type] < 1000) {
      return;
    }
    lastViolationTime.current[type] = now;
    
    setViolations(prev => {
      const updated = [...prev, { type, timestamp: new Date().toISOString() }];
      return updated;
    });
    
    setWarningCount(prev => {
      const newCount = prev + 1;
      
      // Notify user of warning
      let title = "Warning!";
      let desc = "";
      
      if (type === 'tab_switch') {
        desc = "You switched tabs or left the assessment window.";
      } else if (type === 'body_movement') {
        desc = "Significant movement or looking away detected.";
      } else if (type === 'camera_hidden') {
        desc = "No face detected in the camera frame.";
      }

      toast({
        title: `${title} (${newCount}/${MAX_WARNINGS})`,
        description: desc,
        variant: "destructive",
      });
      
      // Auto-fail or terminate if max is reached
      if (newCount >= MAX_WARNINGS) {
        if (onMaxWarningsReached) {
          onMaxWarningsReached();
        }
      }
      
      return newCount;
    });
  };

  // 1. Request Camera and Mic permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
      
      setHasPermissions(true);
      return true;
    } catch (err) {
      console.error("Permission denied or device missing:", err);
      setHasPermissions(false);
      return false;
    }
  };

  // 2. Load the MoveNet model for body tracking
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      await tf.ready();
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet, 
        detectorConfig
      );
    } catch (err) {
      console.error("Failed to load MoveNet model:", err);
    } finally {
      setIsModelLoading(false);
    }
  };

  // 3. Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isProctoringActive && document.visibilityState === 'hidden') {
        addViolation('tab_switch');
      }
    };
    
    const handleWindowBlur = () => {
      if (isProctoringActive) {
        // Debounce or slightly delay to avoid accidental triggers during micro-flickers
        // though usually blur is a definitive switch
        addViolation('tab_switch');
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isProctoringActive]);

  // 4. Vision processing loop (Pose Detection)
  useEffect(() => {
    let animationFrameId: number;
    let lastProcessedTime = 0;
    
    const analyzeFrame = async (timestamp: number) => {
      // Process 1 frame roughly every 1.5 seconds to save CPU
      if (timestamp - lastProcessedTime < 1500) {
        animationFrameId = requestAnimationFrame(analyzeFrame);
        return;
      }
      
      if (isProctoringActive && detectorRef.current && videoRef.current && videoRef.current.readyState === 4) {
        try {
          const poses = await detectorRef.current.estimatePoses(videoRef.current);
          lastProcessedTime = timestamp;
          
          if (poses.length === 0) {
            // No person detected
            addViolation('camera_hidden');
          } else {
            const pose = poses[0];
            const keypoints = pose.keypoints;
            
            // Check if nose and eyes are present (looking at camera)
            const nose = keypoints.find(k => k.name === 'nose');
            const leftEye = keypoints.find(k => k.name === 'left_eye');
            const rightEye = keypoints.find(k => k.name === 'right_eye');
            
            if (!nose || nose.score! < 0.3 || !leftEye || leftEye.score! < 0.3 || !rightEye || rightEye.score! < 0.3) {
              // Face is significantly turned away
               addViolation('body_movement');
            }
          }
        } catch (e) {
          console.error("Error analyzing frame:", e);
        }
      }
      
      animationFrameId = requestAnimationFrame(analyzeFrame);
    };
    
    if (isProctoringActive) {
      animationFrameId = requestAnimationFrame(analyzeFrame);
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isProctoringActive]);

  const startProctoring = async (): Promise<boolean> => {
    // Ensure we have permissions first
    if (!hasPermissions) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }
    
    setWarningCount(0);
    setViolations([]);
    
    if (!detectorRef.current) {
      await loadModel();
    }
    
    setIsProctoringActive(true);
    return true;
  };

  const stopProctoring = () => {
    setIsProctoringActive(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setHasPermissions(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProctoring();
    };
  }, []);

  return (
    <ProctoringContext.Provider value={{
      isProctoringActive,
      hasPermissions,
      warningCount,
      violations,
      videoRef,
      startProctoring,
      stopProctoring,
      requestPermissions,
      isModelLoading
    }}>
      {children}
    </ProctoringContext.Provider>
  );
}

export function useProctoring() {
  const context = useContext(ProctoringContext);
  if (context === undefined) {
    throw new Error('useProctoring must be used within a ProctoringProvider');
  }
  return context;
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProctoring } from './ProctoringProvider';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { Shield, Camera, Mic, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export function ProctoringSetup({ onSetupComplete }: { onSetupComplete: () => void }) {
  const { startProctoring, hasPermissions, isModelLoading } = useProctoring();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      const success = await startProctoring();
      if (success) {
        onSetupComplete();
      } else {
        setError('Camera or Microphone access was denied. These are required for the assessment.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while starting proctoring.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4">
      <CyberCard variant="glow" className="w-full relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-primary/5 pattern-dots opacity-50" />
        
        <div className="relative z-10 p-4 md:p-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/50 flex flex-col items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
          >
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>

          <h2 className="font-display text-3xl font-bold mb-2">Proctored Assessment</h2>
          <p className="text-muted-foreground mb-8">
            This assessment is strictly proctored to ensure academic integrity. You must enable your camera and microphone to proceed.
          </p>

          <div className="w-full space-y-4 mb-8 text-left">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Proctoring Rules
            </h3>
            
            <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                 <Camera className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div>
                    <p className="font-medium text-sm">Face Visibility Required</p>
                    <p className="text-xs text-muted-foreground">You must remain clearly visible in the camera frame at all times. Significant body movement or looking away is flagged.</p>
                 </div>
              </div>
              
              <div className="flex items-start gap-3">
                 <Mic className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div>
                    <p className="font-medium text-sm">Quiet Environment</p>
                    <p className="text-xs text-muted-foreground">Microphone must be active to ensure you are not communicating with others.</p>
                 </div>
              </div>
              
              <div className="flex items-start gap-3 justify-center w-full">
                <div className="w-full h-px bg-border my-1" />
              </div>

              <div className="flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                 <div>
                    <p className="font-medium text-sm text-destructive">No Tab Switching</p>
                    <p className="text-xs text-muted-foreground">Leaving this window or switching tabs will trigger a violation warning.</p>
                 </div>
              </div>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-3">
                <Shield className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-destructive/90 leading-relaxed">
                  3 WARNINGS = AUTOMATIC FAILURE.<br/> Any attempt to bypass the proctoring system will result in immediate termination of the exam.
                </p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/20 border border-destructive/50 text-destructive text-sm px-4 py-3 rounded-lg w-full mb-6"
            >
              {error}
            </motion.div>
          )}

          <CyberButton
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            onClick={handleStart}
            disabled={isRequesting || isModelLoading}
            glowing
          >
            {isRequesting || isModelLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isModelLoading ? 'Loading AI Model...' : 'Requesting Access...'}
              </>
            ) : hasPermissions ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Assessment
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Enable Camera & Mic
              </>
            )}
          </CyberButton>
        </div>
      </CyberCard>
    </div>
  );
}

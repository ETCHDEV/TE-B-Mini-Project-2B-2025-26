import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProctoring, MAX_WARNINGS } from './ProctoringProvider';
import { AlertTriangle } from 'lucide-react';

export function WarningOverlay() {
  const { violations, warningCount } = useProctoring();
  const [showWarning, setShowWarning] = useState(false);
  const [latestViolation, setLatestViolation] = useState<string>('');

  useEffect(() => {
    if (violations.length > 0) {
      const last = violations[violations.length - 1];
      let msg = "Stay focused on your assessment.";
      if (last.type === 'tab_switch') msg = "Tab switching is strictly prohibited!";
      if (last.type === 'body_movement') msg = "Please keep your face visible in the camera frame.";
      if (last.type === 'camera_hidden') msg = "Camera feed blocked or no face detected.";
      
      setLatestViolation(msg);
      setShowWarning(true);
      
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3500); // Hide after 3.5s
      
      return () => clearTimeout(timer);
    }
  }, [violations]);

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center bg-destructive/20 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="bg-destructive text-destructive-foreground px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-md text-center border overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-black/10 animate-pulse pointer-events-none" />
            
            <AlertTriangle className="w-16 h-16 mb-4 animate-bounce" />
            <h2 className="text-2xl font-black font-display tracking-tight mb-2 uppercase">Proctoring Warning</h2>
            <p className="text-lg font-medium opacity-90 mb-4">{latestViolation}</p>
            
            <div className="px-4 py-2 bg-black/20 rounded-lg font-mono font-bold tracking-widest text-xl border border-white/20">
              WARNING {warningCount} / {MAX_WARNINGS}
            </div>
            
            {warningCount >= MAX_WARNINGS && (
              <p className="mt-4 text-sm font-bold uppercase bg-black text-destructive px-3 py-1 rounded">
                Assessment Terminated
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

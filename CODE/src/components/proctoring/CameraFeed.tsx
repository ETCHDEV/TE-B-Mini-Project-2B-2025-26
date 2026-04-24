import React from 'react';
import { motion } from 'framer-motion';
import { useProctoring } from './ProctoringProvider';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

export function CameraFeed() {
  const { videoRef, isProctoringActive, isModelLoading } = useProctoring();

  if (!isProctoringActive) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 left-6 z-40 w-48 rounded-xl overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20 bg-background/80 backdrop-blur"
    >
      <div className="relative aspect-video bg-muted flex items-center justify-center">
        {isModelLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
             <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
             <span className="text-[10px] font-mono text-primary font-medium">Loading AI...</span>
          </div>
        )}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }} // Mirror the local video
        />
        {!videoRef && (
           <CameraOff className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <div className="px-3 py-1.5 bg-background/90 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-[10px] font-mono font-medium tracking-wider text-muted-foreground">PROCTORING</span>
        </div>
        <Camera className="w-3 h-3 text-primary" />
      </div>
    </motion.div>
  );
}

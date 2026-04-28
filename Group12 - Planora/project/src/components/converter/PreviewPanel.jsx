import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2, Share2, Loader2 } from 'lucide-react';

export default function PreviewPanel({ result, isProcessing }) {
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState('preview');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="history" disabled>History</TabsTrigger>
          </TabsList>
        </Tabs>

        {result && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-hidden bg-black/20">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs text-primary">AI</span>
                </div>
              </div>
              <p className="mt-6 font-medium">Generating 3D Visualization...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take up to 30 seconds</p>
              
              {/* Processing animation background */}
              <div className="absolute inset-0 -z-10 animate-pulse-glow">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div 
                className="relative transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={result}
                  alt="3D Visualization Result"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Maximize2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Generated Image Preview</h3>
              <p className="text-muted-foreground max-w-sm">
                Upload a floor plan and configure your settings to see your AI-generated 3D visualization
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      {result && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Download HD
          </Button>
        </div>
      )}
    </div>
  );
}
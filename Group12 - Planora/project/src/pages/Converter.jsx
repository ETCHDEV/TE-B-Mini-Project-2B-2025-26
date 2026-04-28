import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Loader2 } from 'lucide-react';
import UploadZone from '../components/converter/UploadZone';
import ParameterPanel from '../components/converter/ParameterPanel';
import PreviewPanel from '../components/converter/PreviewPanel';
import { base44 } from '@/api/base44Client';

export default function Converter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    style: 'photorealistic',
    viewAngle: 'birds-eye',
    lighting: 'natural',
    quality: 'high',
    requirements: '',
  });

  const handleGenerate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Upload the file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Generate the 3D visualization
      const prompt = `Transform this 2D floor plan into a stunning 3D architectural visualization. 
Style: ${settings.style}
View Angle: ${settings.viewAngle}
Lighting: ${settings.lighting}
Quality: ${settings.quality}
${settings.requirements ? `Additional Requirements: ${settings.requirements}` : ''}

Create a highly detailed, photorealistic 3D rendering showing the floor plan from the specified angle with proper lighting, materials, and architectural details. Include furniture, textures, and realistic shadows.`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: [file_url],
      });

      setResult(response.url);
    } catch (error) {
      console.error('Error generating 3D visualization:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header Section */}
      <section className="py-12 lg:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              AI Floor Plan to <span className="text-gradient">3D</span> Conversion Tool
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your floor plan to create a stunning 3D visualization with customizable styles and viewing angles
            </p>
          </motion.div>
        </div>
      </section>

      {/* Converter Interface */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Upload & Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl border border-border/50 p-6 lg:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold">Convert Floor Plan to 3D</h2>
                <span className="font-mono text-xs text-muted-foreground">v2.0</span>
              </div>

              <div className="space-y-8">
                <UploadZone
                  file={file}
                  setFile={setFile}
                  preview={preview}
                  setPreview={setPreview}
                />

                <div className="border-t border-border pt-6">
                  <ParameterPanel settings={settings} setSettings={setSettings} />
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Model</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs">Basic</Button>
                        <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground">Pro</Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!file || isProcessing}
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating 3D...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Generate 3D Visualization (1 Credit)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-border/50 overflow-hidden min-h-[600px]"
            >
              <PreviewPanel result={result} isProcessing={isProcessing} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
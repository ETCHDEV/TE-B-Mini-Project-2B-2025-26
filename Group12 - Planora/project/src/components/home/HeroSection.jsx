import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap, Shield } from 'lucide-react';

export default function HeroSection() {
  const [mouseX, setMouseX] = useState(50);

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered 3D Generation</span>
            </div>

            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Floor Plan to{' '}
              <span className="text-gradient">3D</span>
              <br />
              Converter
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Transform your 2D floor plans into stunning 3D visualizations instantly. 
              Our advanced AI converts flat architectural drawings into immersive 3D models 
              with photorealistic rendering.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-base font-semibold glow-primary">
                <Link to="/converter">
                  Convert to 3D Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-border hover:bg-muted/50">
                <Link to="/gallery">
                  <Play className="w-5 h-5 mr-2" />
                  View Gallery
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Professional Quality</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden glass border border-border/50 shadow-2xl">
              {/* Mock Interface Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs font-mono text-muted-foreground">FloorPlan3D — Studio</span>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative aspect-[16/10]">
                <img
                  src="https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/73424180a_generated_0ef6f535.png"
                  alt="3D Floor Plan Visualization"
                  className="w-full h-full object-cover"
                />
                
                {/* Scan Line Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-80 animate-scan" />
                </div>

                {/* Floating Stats */}
                <div className="absolute top-4 right-4 glass rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-primary">Processing: 2.3s</span>
                  </div>
                </div>

                {/* Coordinate Labels */}
                <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground/60">
                  X: 0.42 | Y: 1.09 | Z: 0.00
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 border border-primary/30 rounded-lg rotate-12" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 border border-primary/20 rounded-lg -rotate-12" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
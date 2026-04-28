import { motion } from 'framer-motion';
import { Upload, Settings, Download, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Floor Plan',
    description: 'Upload your 2D floor plan image in JPG, PNG, PDF, or SVG format. Our AI supports hand-drawn sketches, CAD drawings, and digital layouts.',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Customize Parameters',
    description: 'Select your preferred rendering style, viewing angle, lighting type, and material quality to customize your 3D visualization.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Download 3D Result',
    description: 'Get your professional 3D visualization in high resolution, ready for presentations, marketing, or client reviews.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-card/30">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-4 block">
            // PROCESS
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            How to Convert Floor Plan to{' '}
            <span className="text-gradient">3D</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to transform your 2D floor plans into stunning 3D visualizations
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-border via-primary/50 to-border z-0">
                  <ArrowRight className="absolute right-0 -top-2 w-4 h-4 text-primary" />
                </div>
              )}

              <div className="relative glass rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors group">
                {/* Step Number */}
                <div className="absolute -top-4 -left-2 font-heading text-7xl font-bold text-primary/10 select-none">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-2xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
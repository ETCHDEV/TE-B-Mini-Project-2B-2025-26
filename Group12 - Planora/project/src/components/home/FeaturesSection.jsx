import { motion } from 'framer-motion';
import { Brain, Zap, Eye, Palette, Sliders, Download } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Advanced 3D AI Engine',
    description: 'Our proprietary AI technology analyzes 2D floor plans and intelligently reconstructs them into detailed 3D models using deep learning algorithms.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/f27834206_generated_3121fbe4.png',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Generation',
    description: 'Transform your floor plans into stunning 3D visualizations in under 30 seconds with GPU-accelerated cloud infrastructure.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/5f676bafc_generated_b703ae11.png',
  },
  {
    icon: Eye,
    title: 'Multiple Viewing Perspectives',
    description: 'Experience your space from every angle with bird\'s eye views, walk-through perspectives, and custom viewpoints.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/225894f3f_generated_a501f38c.png',
  },
  {
    icon: Palette,
    title: 'Diverse Rendering Styles',
    description: 'Choose from over 20 professional rendering styles including photorealistic, blueprint, minimalist, and artistic interpretations.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/5fa2929a4_generated_8cfe014f.png',
  },
  {
    icon: Sliders,
    title: 'Customizable Parameters',
    description: 'Fine-tune lighting conditions, material textures, furniture placement, and environmental settings for perfect results.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/a6723d25b_generated_3b119ce1.png',
  },
  {
    icon: Download,
    title: 'Professional Export Options',
    description: 'Export in multiple high-resolution formats including PNG, JPG, and interactive 3D models for any presentation need.',
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/7e73360a5_generated_2a0fde9e.png',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-4 block">
            // CAPABILITIES
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Powerful Floor Plan to{' '}
            <span className="text-gradient">3D Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover what makes our 3D conversion technology the most powerful tool 
            for architectural visualization
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    Feature {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Image */}
              <div className={`relative ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="relative rounded-2xl overflow-hidden glass border border-border/50">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
                {/* Decorative corner */}
                <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-primary/20 rounded-lg -z-10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
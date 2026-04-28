import { motion } from 'framer-motion';
import { Target, Timer, Palette, RotateCcw } from 'lucide-react';

const stats = [
  {
    icon: Target,
    value: '99.5%',
    label: 'Conversion Accuracy',
    title: '3D Conversion Accuracy',
    description: 'Our AI achieves industry-leading precision in converting 2D floor plans to 3D models with accurate spatial relationships and proportions.',
  },
  {
    icon: Timer,
    value: '< 30s',
    label: 'Generation Time',
    title: 'Ultra-Fast Processing',
    description: 'Powered by cutting-edge GPU clusters and optimized algorithms, delivering professional 3D visualizations in record time.',
  },
  {
    icon: Palette,
    value: '25+',
    label: 'Style Options',
    title: 'Rendering Styles',
    description: 'Choose from an extensive library of professional rendering styles, from photorealistic to architectural blueprints.',
  },
  {
    icon: RotateCcw,
    value: '360°',
    label: 'View Coverage',
    title: 'Viewing Angles',
    description: 'Generate multiple perspective views including aerial, walk-through, and custom angles to showcase your design.',
  },
];

export default function StatsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-4 block">
            // PERFORMANCE
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose{' '}
            <span className="text-gradient">FloorPlan3D</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the most advanced 3D conversion technology for architectural visualization
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="glass rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-primary/30 transition-all h-full">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>

                {/* Value */}
                <div className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-sm font-medium text-muted-foreground mb-4">
                  {stat.label}
                </div>

                {/* Title */}
                <h3 className="font-heading text-lg font-semibold mb-2">
                  {stat.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
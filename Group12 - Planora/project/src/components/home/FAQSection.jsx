import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: 'How does Floor Plan to 3D conversion work?',
    answer: 'Our AI analyzes your 2D floor plan image using advanced computer vision and architectural understanding. It identifies walls, rooms, doors, and windows, then reconstructs them into a detailed 3D model with accurate proportions and spatial relationships. The entire process is automated and takes less than 30 seconds.',
  },
  {
    question: 'What file formats are supported for upload?',
    answer: 'We support a wide range of formats including JPG, PNG, PDF, and SVG. Our AI can process hand-drawn sketches, CAD drawings, scanned blueprints, and digital floor plan layouts. Files up to 20MB are supported.',
  },
  {
    question: 'Can I customize the 3D visualization style?',
    answer: 'Yes! We offer over 25 professional rendering styles including photorealistic, architectural blueprint, modern minimalist, and artistic interpretations. You can also customize lighting conditions, material textures, and viewing angles.',
  },
  {
    question: 'What viewing angles are available?',
    answer: 'Our platform offers comprehensive viewing options including bird\'s eye views, walk-through perspectives, room-specific angles, corner views, and fully customizable viewpoints. You can generate 360° coverage of your floor plan.',
  },
  {
    question: 'How accurate are the 3D conversions?',
    answer: 'Our AI achieves 99.5% accuracy in spatial relationships and proportions. We use deep learning algorithms trained on millions of architectural designs to ensure accurate wall heights, room dimensions, and realistic 3D representations.',
  },
  {
    question: 'Can I use the 3D models for presentations?',
    answer: 'Absolutely! Export your 3D visualizations in high-resolution PNG, JPG, or interactive 3D model formats. They\'re perfect for client presentations, marketing materials, real estate listings, and architectural documentation.',
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-card/30">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-4 block">
            // FAQ
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Answers to your questions about Floor Plan to 3D conversion
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass rounded-xl border border-border/50 px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="py-5 text-left font-heading font-semibold text-lg hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
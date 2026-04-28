import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowRight, Eye, Download, Heart, X } from 'lucide-react';

const galleryItems = [
  {
    id: 1,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/8e1233d5e_generated_f81d3f26.png',
    title: 'Modern Penthouse',
    style: 'Photorealistic',
    category: 'Residential',
  },
  {
    id: 2,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/37d8f0a80_generated_cd8f10e7.png',
    title: 'Scandinavian Bedroom',
    style: 'Minimalist',
    category: 'Residential',
  },
  {
    id: 3,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/bfa03de9a_generated_2a78dbd3.png',
    title: 'Luxury Kitchen',
    style: 'Photorealistic',
    category: 'Residential',
  },
  {
    id: 4,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/f27834206_generated_3121fbe4.png',
    title: 'Open Living Space',
    style: 'Modern',
    category: 'Residential',
  },
  {
    id: 5,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/a6723d25b_generated_3b119ce1.png',
    title: 'Contemporary Living',
    style: 'Warm Tones',
    category: 'Residential',
  },
  {
    id: 6,
    image: 'https://media.base44.com/images/public/69ccdfd7c0e374f045804fce/7e73360a5_generated_2a0fde9e.png',
    title: 'Exterior View',
    style: 'Golden Hour',
    category: 'Exterior',
  },
];

const categories = ['All', 'Residential', 'Commercial', 'Exterior'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-primary mb-4 block">
              // GALLERY
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              3D Visualization <span className="text-gradient">Gallery</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore stunning 3D floor plan conversions created with our AI technology
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category)}
                className={activeCategory === category 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border-border hover:bg-muted/50'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative rounded-2xl overflow-hidden glass border border-border/50">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge className="mb-2 bg-primary/20 text-primary border-0">
                        {item.style}
                      </Badge>
                      <h3 className="font-heading text-xl font-bold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/60">{item.category}</p>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10">
              <Link to="/converter">
                Create Your Own
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-card border-border overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </VisuallyHidden>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-end justify-between">
                  <div>
                    <Badge className="mb-2 bg-primary/20 text-primary border-0">
                      {selectedImage.style}
                    </Badge>
                    <h3 className="font-heading text-2xl font-bold text-white">
                      {selectedImage.title}
                    </h3>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
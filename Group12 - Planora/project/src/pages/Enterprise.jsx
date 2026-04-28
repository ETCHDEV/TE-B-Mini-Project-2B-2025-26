import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Shield, Server, Clock, Code, BarChart3, 
  Building2, Users, Globe, ArrowRight, CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast API',
    description: 'Process floor plans in under 10 seconds with our optimized GPU infrastructure.',
  },
  {
    icon: Server,
    title: 'Infinite Throughput',
    description: 'Auto-scaling architecture handles millions of requests without bottlenecks.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with end-to-end encryption and data privacy controls.',
  },
  {
    icon: Code,
    title: 'Developer-First API',
    description: 'RESTful API with comprehensive docs, SDKs, and webhook support.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time usage metrics, cost tracking, and performance insights.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: '24/7 priority support with dedicated account management.',
  },
];

const stats = [
  { value: '10s', label: 'Average Processing Time' },
  { value: '99.9%', label: 'API Uptime SLA' },
  { value: '50M+', label: 'API Calls Monthly' },
  { value: '500+', label: 'Enterprise Clients' },
];

// Simulated live data feed
const generateDataPacket = () => ({
  id: Math.random().toString(36).substr(2, 9),
  status: Math.random() > 0.1 ? 'success' : 'processing',
  time: (Math.random() * 8 + 2).toFixed(1),
  type: ['residential', 'commercial', 'industrial'][Math.floor(Math.random() * 3)],
});

export default function Enterprise() {
  const [dataFeed, setDataFeed] = useState([]);

  useEffect(() => {
    // Initialize with some data
    setDataFeed(Array.from({ length: 8 }, generateDataPacket));

    // Simulate live feed
    const interval = setInterval(() => {
      setDataFeed(prev => [generateDataPacket(), ...prev.slice(0, 7)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Building2 className="w-3 h-3 mr-1" />
                Enterprise API
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Scale Your <span className="text-gradient">3D Visualization</span> Pipeline
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Integrate our AI-powered floor plan to 3D conversion directly into your 
                applications with enterprise-grade reliability and performance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8">
                  Request Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8">
                  View API Docs
                </Button>
              </div>
            </motion.div>

            {/* Live Data Feed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-border/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                  Live API Feed
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-xs text-green-500">LIVE</span>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-hidden">
                {dataFeed.map((packet, i) => (
                  <motion.div
                    key={packet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1 - i * 0.1, x: 0 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 font-mono text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      packet.status === 'success' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                    }`} />
                    <span className="text-muted-foreground">{packet.id}</span>
                    <span className="text-foreground capitalize">{packet.type}</span>
                    <span className="ml-auto text-primary">{packet.time}s</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Speed Comparison */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Speed <span className="text-gradient">Comparison</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI processes in seconds what takes humans hours
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {/* AI Speed */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">FloorPlan3D AI</span>
                <span className="font-mono text-primary">~10 seconds</span>
              </div>
              <div className="h-8 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '2%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                >
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              </div>
            </div>

            {/* Manual */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Manual 3D Modeling</span>
                <span className="font-mono text-muted-foreground">~48 hours</span>
              </div>
              <div className="h-8 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-muted-foreground/30 rounded-full flex items-center justify-end pr-2"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Enterprise <span className="text-gradient">Features</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h2>
            <p className="text-muted-foreground">
              Let's discuss how FloorPlan3D can power your business
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8 border border-border/50 space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input placeholder="Your name" className="bg-muted/50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input type="email" placeholder="you@company.com" className="bg-muted/50" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Input placeholder="Company name" className="bg-muted/50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea 
                placeholder="Tell us about your project and requirements..." 
                className="bg-muted/50 min-h-[120px]" 
              />
            </div>
            <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Request
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
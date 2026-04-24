import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out our 3D conversion',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 5,
    features: [
      '5 free 3D conversions',
      'Standard quality renders',
      '3 rendering styles',
      'Basic viewing angles',
      'PNG export',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For designers and architects',
    monthlyPrice: 29,
    yearlyPrice: 290,
    credits: 100,
    features: [
      '100 credits/month',
      'High quality renders',
      'All 25+ rendering styles',
      'All viewing perspectives',
      'PNG, JPG, HD export',
      'Priority processing',
      'Email support',
      'Batch processing',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For teams and businesses',
    monthlyPrice: 99,
    yearlyPrice: 990,
    credits: 'Unlimited',
    features: [
      'Unlimited conversions',
      'Ultra HD quality',
      'Custom rendering styles',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

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
              // PRICING
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Start free and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
                <Badge className="ml-2 bg-primary/20 text-primary border-0 text-xs">
                  Save 20%
                </Badge>
              </span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative glass rounded-2xl border ${
                  plan.popular ? 'border-primary' : 'border-border/50'
                } p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <Zap className="w-6 h-6 text-primary" />}
                    {index === 1 && <Sparkles className="w-6 h-6 text-primary" />}
                    {index === 2 && <Building2 className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-heading font-bold">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {typeof plan.credits === 'number' ? `${plan.credits} credits` : plan.credits}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-12 ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Link to={plan.name === 'Enterprise' ? '/enterprise' : '/converter'}>
                    {plan.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground">
              Have questions?{' '}
              <Link to="/#faq" className="text-primary hover:underline">
                Check our FAQ
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
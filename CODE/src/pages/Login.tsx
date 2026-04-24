import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CyberButton } from '@/components/ui/CyberButton';
import { CyberCard } from '@/components/ui/CyberCard';
import { motion } from 'framer-motion';
import { Brain, Terminal, Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CursorGlow from '@/components/CursorGlow';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_DOMAIN = 'apsit.edu.in';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (e: string) => {
    if (!e.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return `Only @${ALLOWED_DOMAIN} email addresses are allowed.`;
    }
    return '';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const domainError = validateEmail(email.trim());
    if (domainError) { setError(domainError); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : authError.message);
      setLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
    // Navigation handled by App.tsx ProtectedRoute / auth state change
    navigate('/student-home');
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden grid-pattern">
      <CursorGlow color="primary" size={250} />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-primary"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-glow mb-3">
            PlacementPal
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Skill Gap Intelligence Platform · APSIT Campus
          </p>
        </motion.div>

        {/* Login Card */}
        <CyberCard variant="glow" className="w-full max-w-md" delay={0.2}>
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-primary">// AUTHENTICATE</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                APSIT Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={`you@${ALLOWED_DOMAIN}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="pl-10 bg-muted border-border focus:border-primary font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="pl-10 bg-muted border-border focus:border-primary font-mono"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <CyberButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              glowing={!loading}
            >
              <Zap className="w-5 h-5 mr-2" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </CyberButton>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70 justify-center">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Restricted to @{ALLOWED_DOMAIN} accounts only
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default Login;

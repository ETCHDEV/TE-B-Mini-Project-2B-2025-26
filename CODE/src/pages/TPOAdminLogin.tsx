import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CyberButton } from '@/components/ui/CyberButton';
import { CyberCard } from '@/components/ui/CyberCard';
import { motion } from 'framer-motion';
import { Shield, Zap, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CursorGlow from '@/components/CursorGlow';
import { useToast } from '@/hooks/use-toast';

const TPOAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Invalid email or password. Please try again.'
          : authError.message);
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && email === 'muazshaikh7861@gmail.com') {
        console.log('TPO admin user logged in:', user.id, user.email);
        
        // Check if user has TPO role, if not assign it
        try {
          const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', { _user_id: user.id });
          console.log('Current role from database:', roleData, 'Error:', roleError);
          
          if (roleData !== 'tpo') {
            console.log('Assigning TPO role to user...');
            // Assign TPO role using direct insert
            const { error: insertError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: user.id,
                role: 'tpo'
              }, {
                onConflict: 'user_id'
              });
            
            if (insertError) {
              console.error('Role assignment error:', insertError);
              toast({
                title: "Role Assignment Warning",
                description: "Could not assign TPO role, but you can continue.",
                variant: "destructive"
              });
            } else {
              console.log('TPO role assigned successfully');
              toast({
                title: "Role Assigned",
                description: "TPO admin role has been assigned.",
              });
            }
          } else {
            console.log('User already has TPO role');
          }
        } catch (error) {
          console.error('Role check failed:', error);
          toast({
            title: "Warning",
            description: "Could not verify role, but continuing...",
            variant: "destructive"
          });
        }
      }

      toast({ 
        title: 'Welcome TPO Admin!', 
        description: 'Successfully logged in to admin panel.' 
      });
      
      // Force reload the page to trigger auth state change with correct role
      setTimeout(() => {
        window.location.href = '/tpo-dashboard';
      }, 1000);
      
      setLoading(false);
    } catch (error) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden grid-pattern">
      <CursorGlow color="accent" size={250} />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-4"
        >
          <Link to="/role-selection">
            <CyberButton variant="ghost" size="sm" className="min-w-[100px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Role Selection
            </CyberButton>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center glow-accent">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-bold text-glow-accent">
              TPO Admin Portal
            </h1>
          </div>
          <p className="text-muted-foreground">
            Secure access for Training & Placement Officers
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <CyberCard variant="glow" className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="bg-muted/50 border-border focus:border-accent"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-muted/50 border-border focus:border-accent"
                  disabled={loading}
                />
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </motion.div>
              )}

              {/* Login Button */}
              <CyberButton
                type="submit"
                variant="accent"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Access Admin Panel
                  </>
                )}
              </CyberButton>

            </form>
          </CyberCard>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            <span>Secure admin access • Authorized personnel only</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TPOAdminLogin;

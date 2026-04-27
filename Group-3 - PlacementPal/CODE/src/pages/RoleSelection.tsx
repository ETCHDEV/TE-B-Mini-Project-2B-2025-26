import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { Brain, Users, Shield, ArrowRight, GraduationCap } from 'lucide-react';
import CursorGlow from '@/components/CursorGlow';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'user' | 'tpo' | null>(null);

  const handleRoleSelect = (role: 'user' | 'tpo') => {
    setSelectedRole(role);
    setTimeout(() => {
      if (role === 'user') {
        navigate('/login');
      } else if (role === 'tpo') {
        navigate('/tpo-admin-login');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden grid-pattern">
      <CursorGlow color="primary" size={300} />

      {/* Background Effects */}
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
          className="text-center mb-12"
        >
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center glow-primary">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold text-glow">
              PlacementPal
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Choose your role to continue
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Student/User Role */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleRoleSelect('user')}
            className="cursor-pointer"
          >
            <CyberCard 
              variant={selectedRole === 'user' ? 'glow' : 'default'}
              className="p-8 h-full hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'user' 
                    ? 'bg-primary/20 border-2 border-primary' 
                    : 'bg-muted/50 border-2 border-border'
                }`}>
                  <GraduationCap className={`w-8 h-8 transition-colors duration-300 ${
                    selectedRole === 'user' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                
                <h2 className="font-display text-2xl font-bold">Student</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access assessments, learning paths, resume analysis, and track your placement journey
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Take assessments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Build resume</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Track progress</span>
                  </div>
                </div>

                <CyberButton 
                  variant={selectedRole === 'user' ? 'primary' : 'secondary'}
                  className="w-full mt-4"
                >
                  {selectedRole === 'user' ? 'Selected' : 'Choose Student'}
                </CyberButton>
              </div>
            </CyberCard>
          </motion.div>

          {/* TPO Admin Role */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleRoleSelect('tpo')}
            className="cursor-pointer"
          >
            <CyberCard 
              variant={selectedRole === 'tpo' ? 'glow' : 'default'}
              className="p-8 h-full hover:border-accent/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedRole === 'tpo' 
                    ? 'bg-accent/20 border-2 border-accent' 
                    : 'bg-muted/50 border-2 border-border'
                }`}>
                  <Shield className={`w-8 h-8 transition-colors duration-300 ${
                    selectedRole === 'tpo' ? 'text-accent' : 'text-muted-foreground'
                  }`} />
                </div>
                
                <h2 className="font-display text-2xl font-bold">TPO Admin</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Manage students, upload placement data, send emails, and oversee the placement system
                </p>
                
                <div className="space-y-2 text-left w-full">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Manage students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Upload Excel data</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Send bulk emails</span>
                  </div>
                </div>

                <CyberButton 
                  variant={selectedRole === 'tpo' ? 'accent' : 'secondary'}
                  className="w-full mt-4"
                >
                  {selectedRole === 'tpo' ? 'Selected' : 'Choose TPO Admin'}
                </CyberButton>
              </div>
            </CyberCard>
          </motion.div>
        </div>

        {/* Loading Animation */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center gap-3 justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">
                Redirecting to {selectedRole === 'user' ? 'Student' : 'TPO Admin'} portal...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;

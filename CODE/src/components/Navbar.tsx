import { useAuth } from '@/lib/authContext';
import { CyberButton } from './ui/CyberButton';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Home, ClipboardCheck, LayoutDashboard, Shield, Brain, MessageSquare, FileText, GraduationCap, Users, Database, User } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, role, username, logout, user, fullName, avatarUrl, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('Navbar - Current role:', role, 'Username:', username, 'IsLoggedIn:', isLoggedIn, 'User email:', user?.email);
  
  // Fallback: Check if user is TPO admin via email
  const isTPOAdmin = role === 'tpo' || user?.email === 'muazshaikh7861@gmail.com';
  const effectiveRole = isTPOAdmin ? 'tpo' : role;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = isLoggedIn && effectiveRole === 'student' ? [
    { path: '/student-home', label: 'Home', icon: Home },
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/tracks', label: 'Assessment', icon: ClipboardCheck },
    { path: '/learning-path', label: 'Learn', icon: GraduationCap },
    { path: '/student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', label: 'Profile', icon: User },
  ] : isLoggedIn && effectiveRole === 'tpo' ? [
    { path: '/tpo-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tpo-users', label: 'Users', icon: Users },
    { path: '/tpo-placement-panel', label: 'Placement Panel', icon: Database },
    { path: '/tpo-chat', label: 'Messages', icon: MessageSquare },
  ] : [];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? (effectiveRole === 'tpo' ? '/tpo-dashboard' : '/student-home') : '/'} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center glow-primary">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-glow">
              PlacementPal
            </span>
          </Link>

          {/* Navigation Links */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Info & Logout */}
          {isLoggedIn && (
            <div className="flex items-center gap-4">
              <Link 
                to={effectiveRole === 'student' ? '/profile' : '#'} 
                className={`flex items-center gap-2 text-sm transition-opacity ${effectiveRole === 'student' ? 'hover:opacity-80' : 'cursor-default'}`}
              >
                <div className="w-8 h-8 rounded-full bg-muted border border-primary/50 flex items-center justify-center overflow-hidden">
                  {effectiveRole === 'tpo' ? (
                    <Shield className="w-4 h-4 text-primary" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-foreground font-medium">{fullName || username}</span>
                  <span className="text-xs text-muted-foreground uppercase">{effectiveRole}</span>
                </div>
              </Link>
              <CyberButton variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </CyberButton>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

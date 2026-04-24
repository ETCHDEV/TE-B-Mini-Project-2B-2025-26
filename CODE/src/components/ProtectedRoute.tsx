import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { UserRole } from '@/lib/authContext';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { adminService } from '@/services/adminService';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
    <motion.div
      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-16 h-16 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-primary"
    >
      <Brain className="w-8 h-8 text-primary" />
    </motion.div>
    <div className="mt-4 text-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AccessDenied = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center mx-auto mb-6">
        <Brain className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground mb-4">
        Access Denied
      </h1>
      <p className="text-muted-foreground mb-6">
        {message}
      </p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isLoggedIn, role, loading, user } = useAuth();

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    console.log('ProtectedRoute: User not logged in, redirecting to role selection');
    return <Navigate to="/role-selection" replace />;
  }

  // For TPO admin, always allow access regardless of role state
  const isTPOAdmin = user?.email === 'muazshaikh7861@gmail.com';
  
  if (isTPOAdmin) {
    console.log('ProtectedRoute: TPO admin access granted');
    return <>{children}</>;
  }

  // Check if required role is specified and user has the correct role
  if (requiredRole && role !== requiredRole) {
    console.log('ProtectedRoute: Role mismatch', { required: requiredRole, current: role });
    
    // Show access denied instead of redirecting to prevent infinite loops
    return (
      <AccessDenied 
        message={`You need ${requiredRole} access to view this page. Current role: ${role || 'none'}`} 
      />
    );
  }

  // Allow access
  console.log('ProtectedRoute: Access granted', { role, requiredRole });
  return <>{children}</>;
};

export default ProtectedRoute;

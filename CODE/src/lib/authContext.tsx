import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StudentResult, TrackType } from './mockData';

export type UserRole = 'student' | 'tpo' | null;

export interface AIPrediction {
  level: 'Beginner' | 'Intermediate' | 'Ready';
  confidence: number;
  skillGaps: Array<{
    skill: string;
    gapType: string;
    priority: string;
  }>;
  topicClassification?: {
    strong: string[];
    weak: string[];
    unknown: string[];
  };
  recommendations: string[];
  weeklyPlan?: Array<{ 
    week: number; 
    title: string;
    focus: string; 
    tasks: string[]; 
    resourceHint: string;
    topics?: string[];
  }>;
  overallAdvice?: string;
  estimatedReadinessWeeks: number;
}

export interface EnhancedStudentResult extends StudentResult {
  aiPrediction?: AIPrediction;
  questionResponses?: Array<{
    questionId: string;
    topic: string;
    isCorrect: boolean;
    difficulty: string;
  }>;
}

export interface StudentProfile {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  department: string | null;
  year: number | null;
  full_name?: string;
  bio?: string;
  target_role?: string;
  linkedin_url?: string;
  github_url?: string;
  avatar_url?: string;
  is_registered: boolean;
  created_at?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  username: string;
  user: User | null;
  session: Session | null;
  studentResult: EnhancedStudentResult | null;
  profile: StudentProfile | null;
  fullName: string;
  avatarUrl: string | null;
  loading: boolean;
  login: (username: string, role: UserRole) => void; 
  logout: () => Promise<void>;
  setStudentResult: (result: EnhancedStudentResult) => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [studentResult, setStudentResultState] = useState<EnhancedStudentResult | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const fetchRole = async (userId: string, userEmail?: string): Promise<UserRole> => {
    // Special case for TPO admin - check multiple ways
    if (userEmail === 'muazshaikh7861@gmail.com') {
      console.log('TPO admin detected via email:', userEmail);
      return 'tpo';
    }
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: userId });
      
      if (error) {
        console.error('Role fetch error:', error);
        // If this is the TPO admin email, return tpo role as fallback
        if (userEmail === 'muazshaikh7861@gmail.com') {
          return 'tpo';
        }
        return 'student';
      }
      
      if (!data) {
        console.log('No role data found for user:', userEmail);
        // If this is the TPO admin email, return tpo role as fallback
        if (userEmail === 'muazshaikh7861@gmail.com') {
          return 'tpo';
        }
        return 'student';
      }
      
      return data as UserRole;
    } catch (error) {
      console.error('Exception in fetchRole:', error);
      // If this is the TPO admin email, return tpo role as fallback
      if (userEmail === 'muazshaikh7861@gmail.com') {
        return 'tpo';
      }
      return 'student';
    }
  };
  
  const refreshProfile = async () => {
    if (!user) return;
    const authUsername = user.email?.split('@')[0] ?? '';
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('username', authUsername)
      .maybeSingle();
      
    if (student) {
      setProfile(student as unknown as StudentProfile);
      setFullName((student as any).full_name || '');
      setAvatarUrl((student as any).avatar_url || null);
    }
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    if (updates.full_name !== undefined) {
      setFullName(updates.full_name);
    }
    if (updates.avatar_url !== undefined) {
      setAvatarUrl(updates.avatar_url);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer role fetch to avoid Supabase deadlock
          setTimeout(async () => {
            const r = await fetchRole(currentSession.user.id, currentSession.user.email || undefined);
            console.log('Role fetched for user:', currentSession.user.email, 'Role:', r);
            setRole(r);
            setLoading(false);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && role === 'student') {
      refreshProfile();
    }
  }, [user, role]);

  const logout = async () => {
    await supabase.auth.signOut();
    setStudentResultState(null);
  };

  // Legacy login kept for non-breaking compatibility with older pages
  const login = (username: string, r: UserRole) => {
    setRole(r);
  };

  const username = user?.email?.split('@')[0] ?? '';
  const isLoggedIn = !!user && !!session;

  const setStudentResult = (result: EnhancedStudentResult) => {
    setStudentResultState(result);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      role,
      username,
      user,
      session,
      studentResult,
      profile,
      fullName,
      avatarUrl,
      loading,
      login,
      logout,
      setStudentResult,
      refreshProfile,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useState, useEffect, useRef } from 'react';
import { useAuth, StudentProfile } from '@/lib/authContext';
import { supabase } from '@/integrations/supabase/client';
import { CyberCard } from '@/components/ui/CyberCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, MapPin, 
  Calendar, Shield, Edit3, Save, X, Camera, Target, 
  TrendingUp, CheckCircle2, Award, Briefcase, Linkedin, Github, ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CursorGlow from '@/components/CursorGlow';
import { useToast } from '@/hooks/use-toast';

interface CareerStats {
  totalAssessments: number;
  averageScore: number;
  topTrack: string;
  masteredWeeks: number;
}

const Profile = () => {
  const { user, username: authUsername, refreshProfile, profile: globalProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!globalProfile);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(globalProfile);
  const [stats, setStats] = useState<CareerStats>({
    totalAssessments: 0,
    averageScore: 0,
    topTrack: 'None',
    masteredWeeks: 0
  });

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    department: '',
    year: '',
    target_role: '',
    linkedin_url: '',
    github_url: ''
  });

  // Sync global profile to local state and form
  useEffect(() => {
    if (globalProfile) {
      setProfile(globalProfile);
      setFormData({
        full_name: globalProfile.full_name || '',
        bio: globalProfile.bio || '',
        phone: globalProfile.phone || '',
        department: globalProfile.department || '',
        year: globalProfile.year?.toString() || '',
        target_role: globalProfile.target_role || '',
        linkedin_url: globalProfile.linkedin_url || '',
        github_url: globalProfile.github_url || ''
      });
      setLoading(false);
    }
  }, [globalProfile]);

  // Fetch missing stats and latest profile if needed
  const fetchStats = async () => {
    if (!user) return;
    try {
      const { data: assessments } = await supabase
        .from('assessment_results')
        .select('track, correct_answers, total_questions, ai_prediction')
        .eq('student_username', authUsername);

      if (assessments && assessments.length > 0) {
        const total = assessments.length;
        const avg = Math.round(
          assessments.reduce((acc, curr) => acc + (curr.correct_answers / curr.total_questions) * 100, 0) / total
        );
        
        let masteredCount = 0;
        assessments.forEach(a => {
          const prediction = a.ai_prediction as any;
          if (prediction?.completedWeeks) {
            masteredCount += prediction.completedWeeks.length;
          }
        });

        const trackCounts: Record<string, number> = {};
        assessments.forEach(a => {
          trackCounts[a.track || 'Unknown'] = (trackCounts[a.track || 'Unknown'] || 0) + 1;
        });
        const top = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0][0];

        setStats({
          totalAssessments: total,
          averageScore: avg,
          topTrack: top,
          masteredWeeks: masteredCount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Only refresh profile if we don't have it yet to prevent flicker
    if (!globalProfile) {
      refreshProfile();
    }
  }, [user, globalProfile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          department: formData.department,
          year: formData.year ? parseInt(formData.year) : null,
          bio: formData.bio,
          target_role: formData.target_role,
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', profile.id);

      if (error) throw error;
      
      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        department: formData.department,
        year: formData.year ? parseInt(formData.year) : null,
        bio: formData.bio,
        target_role: formData.target_role,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url
      };

      updateProfile(updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      setIsEditing(false);
      toast({
        title: 'Success!',
        description: 'Profile updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user || !profile) return;

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('students')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      updateProfile({ avatar_url: publicUrl });
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been changed successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload profile picture. Please ensure the 'avatars' bucket is created.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading && !globalProfile) {
    return (
      <div className="min-h-screen grid-pattern flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono animate-pulse">LOADING_PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative grid-pattern">
      <CursorGlow color="primary" size={250} />
      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          
          {/* === HERO SECTION === */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <CyberCard variant="glow" className="overflow-hidden">
              <div className="h-48 bg-slate-900 relative overflow-hidden">
                <img 
                  src="/banners/profile_banner.png" 
                  alt="Placement Pal Banner" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row gap-6 items-end -mt-12 relative z-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-muted border-4 border-background overflow-hidden shadow-2xl relative flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${authUsername}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover opacity-80" 
                        />
                      )}
                      
                      {/* Hover Overlay for Upload - Only in Edit Mode */}
                      {isEditing && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-6 h-6 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Change Photo</span>
                        </button>
                      )}
                      
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                      {isEditing ? (
                        <input 
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          placeholder="Your Display Name"
                          className="bg-muted/50 border border-border rounded px-3 py-1 text-2xl font-bold font-display focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold font-display">{profile?.full_name || authUsername}</h1>
                      )}
                      <div className="px-2 py-0.5 rounded-md bg-success/10 border border-success/30 text-success text-[10px] uppercase font-bold tracking-widest">
                        {profile?.is_registered ? 'Verified Student' : 'Student'}
                      </div>
                    </div>
                    <p className="text-muted-foreground font-medium mb-3">
                      {isEditing ? (
                        <input 
                          value={formData.target_role}
                          onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                          placeholder="What is your target role? (e.g. Frontend Developer)"
                          className="bg-muted/50 border border-border rounded px-3 py-1 text-sm w-full max-w-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        profile?.target_role || 'Aspiring Tech Professional'
                      )}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile?.email}</span>
                      {profile?.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {profile.phone}</span>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isEditing ? (
                      <CyberButton variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                      </CyberButton>
                    ) : (
                      <>
                        <CyberButton variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </CyberButton>
                        <CyberButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                          <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} /> 
                          {saving ? 'Saving...' : 'Save Changes'}
                        </CyberButton>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/40">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" /> About Me
                  </h3>
                  {isEditing ? (
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself, your goals, and your passion..."
                      rows={3}
                      className="w-full bg-muted/30 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed italic">
                      {profile?.bio || 'No bio yet. Click edit to add one! Write about your tech journey and aspirations.'}
                    </p>
                  )}
                </div>
              </div>
            </CyberCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* === LEFT COLUMN: Details & Socials === */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CyberCard className="p-6">
                  <h3 className="font-display font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" /> Academic Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Department</label>
                      {isEditing ? (
                        <input 
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm"
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile?.department || 'Not Specified'}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Year of Study</label>
                      {isEditing ? (
                        <select 
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium">{profile?.year ? `${profile.year}${profile.year === 1 ? 'st' : profile.year === 2 ? 'nd' : profile.year === 3 ? 'rd' : 'th'} Year` : 'Not Specified'}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Member Since</label>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CyberCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CyberCard className="p-6">
                  <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> Social Presence
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-3">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">LinkedIn URL</label>
                            <input 
                              value={formData.linkedin_url}
                              onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GitHub URL</label>
                            <input 
                              value={formData.github_url}
                              onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                              placeholder="https://github.com/yourusername"
                              className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <button 
                            disabled={!profile?.linkedin_url}
                            onClick={() => profile?.linkedin_url && window.open(profile.linkedin_url, '_blank')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 transition-all text-sm group ${profile?.linkedin_url ? 'hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/5' : 'opacity-50 cursor-not-allowed'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                              <span className={`${profile?.linkedin_url ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/40'}`}>LinkedIn Reference</span>
                            </div>
                            {profile?.linkedin_url && <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />}
                          </button>
                          <button 
                            disabled={!profile?.github_url}
                            onClick={() => profile?.github_url && window.open(profile.github_url, '_blank')}
                            className={`w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 transition-all text-sm group ${profile?.github_url ? 'hover:border-primary/50 hover:bg-primary/5' : 'opacity-50 cursor-not-allowed'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Github className="w-4 h-4" />
                              <span className={`${profile?.github_url ? 'text-muted-foreground group-hover:text-foreground' : 'text-muted-foreground/40'}`}>GitHub Portfolio</span>
                            </div>
                            {profile?.github_url && <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </CyberCard>
              </motion.div>
            </div>

            {/* === CENTER/RIGHT COLUMN: Career Stats & Insights === */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: Target, label: 'Assessments', value: stats.totalAssessments, color: 'text-primary' },
                  { icon: TrendingUp, label: 'Avg. Score', value: `${stats.averageScore}%`, color: 'text-accent' },
                  { icon: Award, label: 'Mastery', value: `${stats.masteredWeeks} Weeks`, color: 'text-success' },
                  { icon: Briefcase, label: 'Top Domain', value: stats.topTrack, color: 'text-secondary', isMarquee: true },
                ].map((stat, i) => (
                  <CyberCard key={i} className="p-4 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-sm font-mono text-muted-foreground">{stat.label}</p>
                    <div className="overflow-hidden whitespace-nowrap mask-fade">
                      <p className={`text-xl font-display font-bold ${stat.isMarquee ? "animate-marquee hover-pause inline-block" : ""}`}>
                        {stat.value}
                        {stat.isMarquee && <span className="mx-4">{stat.value}</span>}
                        {stat.isMarquee && <span className="mx-4">{stat.value}</span>}
                      </p>
                    </div>
                  </CyberCard>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <CyberCard className="p-8 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-display text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Career Momentum
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">AI-analyzed progress across technical tracks</p>
                    </div>
                    <Award className="w-8 h-8 text-primary/30" />
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">Technical Mastered</span>
                          <span className="text-primary font-bold">{stats.averageScore}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-accent" 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.averageScore}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Your average score across all domain assessments. Target &gt;85% for Tier-1 company readiness.
                        </p>
                      </div>

                      <div className="flex items-center gap-6 p-4 rounded-2xl bg-background/50 border border-border/50">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Focus Track</h4>
                          <div className="overflow-hidden whitespace-nowrap mask-fade">
                            <p className="text-lg font-display font-bold text-primary animate-marquee hover-pause inline-block">
                              {stats.topTrack}
                              <span className="mx-4">{stats.topTrack}</span>
                              <span className="mx-4">{stats.topTrack}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        <h4 className="text-sm font-bold">Unlocking Potential</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Based on your **{stats.totalAssessments} assessments**, you've mastered **{stats.masteredWeeks} curriculum weeks**. 
                        Your strongest area is **{stats.topTrack}**. Keep building consistence to improve your AI confidence score!
                      </p>
                    </div>
                  </div>
                </CyberCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

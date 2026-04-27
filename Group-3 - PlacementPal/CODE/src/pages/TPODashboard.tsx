import React, { useState, useEffect } from 'react';
import { CyberCard } from '@/components/ui/CyberCard.tsx';
import { motion } from 'framer-motion';
import { 
  Users, Brain, Shield, TrendingUp, AlertTriangle, 
  BarChart3, PieChart, Target, BookOpen, Code, Database, Server
} from 'lucide-react';
import { assessmentService, AllStats, AssessmentAttempt } from '@/services/assessmentService';
import Navbar from '@/components/Navbar.tsx';
import CursorGlow from '@/components/CursorGlow.tsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const TPODashboard = () => {
  const [stats, setStats] = useState<AllStats | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allStats, recent] = await Promise.all([
          assessmentService.getAllStats(),
          assessmentService.getRecentAssessments(10)
        ]);
        setStats(allStats);
        setRecentAssessments(recent);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }
  
  const levelData = [
    { name: 'Beginner', prog: stats.programming.beginner_count, dsml: stats.datascience.beginner_count, db: stats.database.beginner_count, backend: stats.backend.beginner_count },
    { name: 'Intermediate', prog: stats.programming.intermediate_count, dsml: stats.datascience.intermediate_count, db: stats.database.intermediate_count, backend: stats.backend.intermediate_count },
    { name: 'Ready', prog: stats.programming.ready_count, dsml: stats.datascience.ready_count, db: stats.database.ready_count, backend: stats.backend.ready_count },
  ];

  const trackDistribution = [
    { name: 'Programming & DSA', value: stats.programming.total_students, color: 'hsl(180, 100%, 50%)' },
    { name: 'Data Science & ML', value: stats.datascience.total_students, color: 'hsl(35, 100%, 55%)' },
    { name: 'Database & SQL', value: stats.database.total_students, color: 'hsl(145, 80%, 45%)' },
    { name: 'Backend / Web Dev', value: stats.backend.total_students, color: 'hsl(330, 100%, 60%)' },
  ];

  const levelColors = {
    Beginner: 'hsl(180, 100%, 50%)',
    Intermediate: 'hsl(35, 100%, 55%)',
    Ready: 'hsl(145, 80%, 45%)',
  };

  const getTrackStyle = (track: string) => {
    switch (track) {
      case 'Programming & DSA': return { bg: 'bg-primary/20 text-primary border-primary/30', icon: Code };
      case 'Data Science & ML': return { bg: 'bg-accent/20 text-accent border-accent/30', icon: Brain };
      case 'Database Management & SQL': return { bg: 'bg-secondary/20 text-secondary border-secondary/30', icon: Database };
      case 'Backend / Web Dev': return { bg: 'bg-tertiary/20 text-tertiary border-tertiary/30', icon: Server };
      default: return { bg: 'bg-primary/20 text-primary border-primary/30', icon: Code };
    }
  };

  return (
    <div className="min-h-screen relative grid-pattern">
      <CursorGlow color="accent" size={250} />
      <Navbar />
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-40 left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              TPO <span className="text-glow">Analytics Dashboard</span>
            </h1>
          </div>
          <p className="text-muted-foreground">Batch-wide skill assessment insights and gap analysis</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <CyberCard delay={0.1} className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-primary/20 border-primary/50 border">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display font-bold text-3xl">{stats.totalStudents}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CyberCard>

          <CyberCard delay={0.15} className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-primary/20 border-primary/50 border">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display font-bold text-3xl">{stats.programming.total}</p>
            <p className="text-sm text-muted-foreground">Programming & DSA</p>
          </CyberCard>

          <CyberCard delay={0.2} className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-accent/20 border-accent/50 border">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <p className="font-display font-bold text-3xl">{stats.datascience.total}</p>
            <p className="text-sm text-muted-foreground">Data Science & ML</p>
          </CyberCard>

          <CyberCard delay={0.22} className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-secondary/20 border-secondary/50 border">
              <Database className="w-6 h-6 text-secondary" />
            </div>
            <p className="font-display font-bold text-3xl">{stats.database.total}</p>
            <p className="text-sm text-muted-foreground">Database & SQL</p>
          </CyberCard>

          <CyberCard delay={0.25} className="text-center">
            <div className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center bg-success/20 border-success/50 border">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <p className="font-display font-bold text-3xl">
              {Math.round((stats.programming.levelCounts.Ready + stats.datascience.levelCounts.Ready + stats.database.levelCounts.Ready + stats.backend.levelCounts.Ready) / stats.totalStudents * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">Placement Ready</p>
          </CyberCard>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Level Distribution Bar Chart */}
          <CyberCard variant="glow" delay={0.3}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Level Distribution by Track</h2>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 18%)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(220, 15%, 55%)" 
                    tick={{ fill: 'hsl(220, 15%, 55%)', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(220, 15%, 55%)" 
                    tick={{ fill: 'hsl(220, 15%, 55%)', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 25%, 10%)', 
                      border: '1px solid hsl(180, 100%, 50%)',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani'
                    }}
                    labelStyle={{ color: 'hsl(180, 100%, 95%)' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontFamily: 'Rajdhani' }}
                  />
                  <Bar dataKey="prog" name="Programming & DSA" fill="hsl(180, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dsml" name="Data Science & ML" fill="hsl(35, 100%, 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="db" name="Database & SQL" fill="hsl(145, 80%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="backend" name="Backend / Web Dev" fill="hsl(330, 100%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CyberCard>

          {/* Track Distribution Pie Chart */}
          <CyberCard variant="accent" delay={0.35}>
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-bold">Track Distribution</h2>
            </div>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={trackDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {trackDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 25%, 10%)', 
                      border: '1px solid hsl(35, 100%, 55%)',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {trackDistribution.map((track) => (
                <div key={track.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
                  <span className="text-sm text-muted-foreground">{track.name}</span>
                </div>
              ))}
            </div>
          </CyberCard>
        </div>

        {/* Top Skill Gaps */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <CyberCard delay={0.4}>
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="font-display text-xl font-bold">Top Skill Gaps (Batch-wide)</h2>
            </div>
            <div className="space-y-4">
              {stats.topGaps.map((gap, index) => (
                <motion.div
                  key={gap.gap}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{gap.gap}</span>
                    <span className="font-mono text-sm text-muted-foreground">{gap.count} students ({gap.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gap.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-destructive to-accent rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CyberCard>

          {/* Level Breakdown */}
          <CyberCard delay={0.45}>
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Readiness Breakdown</h2>
            </div>
            <div className="space-y-6">
              {(['Beginner', 'Intermediate', 'Ready'] as const).map((level) => {
                const count = stats.programming.levelCounts[level] + stats.datascience.levelCounts[level] + stats.database.levelCounts[level] + stats.backend.levelCounts[level];
                const percentage = Math.round((count / stats.totalStudents) * 100);
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: levelColors[level] }} 
                        />
                        <span className="font-medium">{level}</span>
                      </div>
                      <span className="font-mono text-sm">{count} students ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: levelColors[level] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CyberCard>
        </div>

        {/* Student List */}
        <CyberCard delay={0.5}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Recent Assessments</h2>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              Showing {recentAssessments.length} assessments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground uppercase">Student</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground uppercase">Track</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground uppercase">Score</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground uppercase">Level</th>
                  <th className="text-left py-3 px-4 font-mono text-sm text-muted-foreground uppercase">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.slice(0, 10).map((assessment, index) => {
                  const trackStyle = getTrackStyle(assessment.track);
                  const TrackIcon = trackStyle.icon;
                  return (
                    <motion.tr
                      key={assessment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{assessment.user_email}</p>
                          <p className="text-xs text-muted-foreground">{assessment.user_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${trackStyle.bg}`}>
                          <TrackIcon className="w-3 h-3" />
                          {assessment.track}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{assessment.correct_answers}/{assessment.total_questions}</td>
                      <td className="py-3 px-4">
                        <span 
                          className="font-medium"
                          style={{ color: levelColors[assessment.level] }}
                        >
                          {assessment.level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {assessment.gaps && assessment.gaps.length > 0 ? assessment.gaps.map((gap) => (
                            <span 
                              key={gap} 
                              className="px-2 py-0.5 text-xs rounded bg-destructive/20 text-destructive border border-destructive/30"
                            >
                              {gap}
                            </span>
                          )) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CyberCard>
      </div>
    </div>
  );
};

export default TPODashboard;

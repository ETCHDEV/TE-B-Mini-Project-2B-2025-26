import { supabase } from '../integrations/supabase/client.ts';
import { errorHandler } from '../lib/errorHandler.ts';

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  user_email: string;
  track: string;
  correct_answers: number;
  total_questions: number;
  gaps: string[];
  level: 'Beginner' | 'Intermediate' | 'Ready';
  completed_at: string;
}

export interface AssessmentStats {
  track: string;
  total_students: number;
  total: number;
  beginner_count: number;
  intermediate_count: number;
  ready_count: number;
  beginner_percentage: number;
  intermediate_percentage: number;
  ready_percentage: number;
  levelCounts: {
    Beginner: number;
    Intermediate: number;
    Ready: number;
  };
}

export interface AllStats {
  totalStudents: number;
  programming: AssessmentStats;
  datascience: AssessmentStats;
  database: AssessmentStats;
  backend: AssessmentStats;
  topGaps: Array<{ gap: string; count: number; percentage: number }>;
}

class AssessmentService {
  async getAssessmentStats(): Promise<AssessmentStats[]> {
    try {
      console.log('Fetching assessment stats...');

      const { data, error } = await supabase.rpc('get_assessment_stats') as { data: any[] | null; error: any };

      if (error) {
        console.error('Assessment stats fetch failed:', error);
        throw error;
      }

      // Map raw RPC rows to AssessmentStats (add computed levelCounts)
      const mapped: AssessmentStats[] = (Array.isArray(data) ? data : []).map((row: any) => ({
        track: row.track,
        total_students: Number(row.total_students),
        total: Number(row.total),
        beginner_count: Number(row.beginner_count),
        intermediate_count: Number(row.intermediate_count),
        ready_count: Number(row.ready_count),
        beginner_percentage: Number(row.beginner_percentage),
        intermediate_percentage: Number(row.intermediate_percentage),
        ready_percentage: Number(row.ready_percentage),
        levelCounts: {
          Beginner: Number(row.beginner_count),
          Intermediate: Number(row.intermediate_count),
          Ready: Number(row.ready_count),
        },
      }));

      console.log('Assessment stats fetched successfully:', mapped.length);
      return mapped;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error as any, 'AssessmentService.getAssessmentStats');
      throw error;
    }
  }

  async getRecentAssessments(limit: number = 10): Promise<AssessmentAttempt[]> {
    try {
      console.log('Fetching recent assessments...');

      const { data, error } = await supabase.rpc('get_recent_assessments', { limit_count: limit }) as { data: any[] | null; error: any };

      if (error) {
        console.error('Recent assessments fetch failed:', error);
        throw error;
      }

      // Normalise RPC rows to AssessmentAttempt
      const mapped: AssessmentAttempt[] = (Array.isArray(data) ? data : []).map((row: any) => ({
        id: row.id,
        user_id: '',            // RPC does not expose user UUID for privacy
        user_email: row.user_email,
        track: row.track,
        correct_answers: Number(row.correct_answers),
        total_questions: Number(row.total_questions),
        gaps: Array.isArray(row.gaps) ? row.gaps as string[] : [],
        level: row.level as 'Beginner' | 'Intermediate' | 'Ready',
        completed_at: row.completed_at,
      }));

      console.log('Recent assessments fetched successfully:', mapped.length);
      return mapped;
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error, 'AssessmentService.getRecentAssessments');
      throw error;
    }
  }

  async getAllStats(): Promise<AllStats> {
    try {
      console.log('Fetching all assessment stats...');

      const stats = await this.getAssessmentStats();
      const recentAssessments = await this.getRecentAssessments();

      // Find stats for each track
      const programming = stats.find(s => s.track === 'Programming & DSA') || {
        track: 'Programming & DSA',
        total_students: 0,
        total: 0,
        beginner_count: 0,
        intermediate_count: 0,
        ready_count: 0,
        beginner_percentage: 0,
        intermediate_percentage: 0,
        ready_percentage: 0,
        levelCounts: {
          Beginner: 0,
          Intermediate: 0,
          Ready: 0
        }
      };

      const datascience = stats.find(s => s.track === 'Data Science & ML') || {
        track: 'Data Science & ML',
        total_students: 0,
        total: 0,
        beginner_count: 0,
        intermediate_count: 0,
        ready_count: 0,
        beginner_percentage: 0,
        intermediate_percentage: 0,
        ready_percentage: 0,
        levelCounts: {
          Beginner: 0,
          Intermediate: 0,
          Ready: 0
        }
      };

      const database = stats.find(s => s.track === 'Database Management & SQL') || {
        track: 'Database Management & SQL',
        total_students: 0,
        total: 0,
        beginner_count: 0,
        intermediate_count: 0,
        ready_count: 0,
        beginner_percentage: 0,
        intermediate_percentage: 0,
        ready_percentage: 0,
        levelCounts: {
          Beginner: 0,
          Intermediate: 0,
          Ready: 0
        }
      };

      const backend = stats.find(s => s.track === 'Backend / Web Dev') || {
        track: 'Backend / Web Dev',
        total_students: 0,
        total: 0,
        beginner_count: 0,
        intermediate_count: 0,
        ready_count: 0,
        beginner_percentage: 0,
        intermediate_percentage: 0,
        ready_percentage: 0,
        levelCounts: {
          Beginner: 0,
          Intermediate: 0,
          Ready: 0
        }
      };

      // Calculate top gaps from recent assessments
      const allGaps = recentAssessments.flatMap(a => a.gaps || []);
      const gapCounts: Record<string, number> = {};
      allGaps.forEach(gap => {
        gapCounts[gap] = (gapCounts[gap] || 0) + 1;
      });

      const topGaps = Object.entries(gapCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([gap, count]) => ({
          gap,
          count,
          percentage: Math.round((count / recentAssessments.length) * 100)
        }));

      const totalStudents = stats.reduce((sum, s) => sum + s.total_students, 0);

      console.log('All stats calculated successfully');

      return {
        totalStudents,
        programming,
        datascience,
        database,
        backend,
        topGaps
      };
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error, 'AssessmentService.getAllStats');
      throw error;
    }
  }

  async createAssessmentAttempt(attempt: {
    user_id: string;
    user_email: string;
    track: string;
    correct_answers: number;
    total_questions: number;
    gaps: string[];
    level: 'Beginner' | 'Intermediate' | 'Ready';
  }): Promise<AssessmentAttempt> {
    try {
      console.log('Creating assessment attempt...');

      // Transform the attempt to match the database schema
      const dbAttempt = {
        student_id: attempt.user_id,
        student_username: attempt.user_email,
        track: attempt.track,
        correct_answers: attempt.correct_answers,
        total_questions: attempt.total_questions,
        gaps: attempt.gaps,
        level: attempt.level
      };

      const { data, error } = await supabase
        .from('assessment_results')
        .insert(dbAttempt)
        .select()
        .single();

      if (error) {
        console.error('Assessment attempt creation failed:', error);
        throw error;
      }

      if (data) {
        // Transform the data to match the expected interface
        const transformedData: AssessmentAttempt = {
          id: data.id,
          user_id: data.student_id || '',
          user_email: data.student_username,
          track: data.track,
          correct_answers: data.correct_answers,
          total_questions: data.total_questions,
          gaps: Array.isArray(data.gaps) ? (data.gaps as string[]) : [],
          level: data.level as 'Beginner' | 'Intermediate' | 'Ready',
          completed_at: data.created_at
        };

        console.log('Assessment attempt created successfully');
        return transformedData;
      }

      throw new Error('Failed to create assessment attempt');
    } catch (error: unknown) {
      errorHandler.handleSupabaseError(error, 'AssessmentService.createAssessmentAttempt');
      throw error;
    }
  }
}

export const assessmentService = new AssessmentService();

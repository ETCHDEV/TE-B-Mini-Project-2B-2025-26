import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Brain, CheckCircle, Clock, ExternalLink,
  GraduationCap, Lightbulb, Loader2, RefreshCw, Sparkles,
  Target, Zap, Code, Database, Server,
  ChevronDown, Lock, PlayCircle, FileText, AlertTriangle,
  TrendingUp, Star, X, ArrowLeft, ArrowRight, Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CyberButton } from '@/components/ui/CyberButton';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface CourseRecommendation {
  course: {
    id: string;
    title: string;
    platform: string;
    skill_covered: string;
    track: string;
    difficulty_level: string;
    is_free: boolean;
    rating: number | null;
    duration_hours: number | null;
    url: string;
    instructor: string | null;
    description: string | null;
    is_curated: boolean;
  };
  addressesGap: string;
  reason: string;
  priority: number;
}

interface SkillGap { skill: string; gapType: string; priority: string; }

interface AssessmentData {
  id: string;
  track: string;
  level: string;
  gaps: string[];
  ai_prediction: any;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}

type PanelView =
  | { type: 'welcome' }
  | { type: 'topic'; week: number; topic: string }
  | { type: 'assessment'; week: number }
  | { type: 'quiz'; week: number; topics: string[]; isWeekly: boolean };

// ─── Configuration ───────────────────────────────────────────────────────────

const TRACK_CONFIG: Record<string, { icon: React.ElementType; color: string; borderColor: string; bgColor: string }> = {
  'Programming & DSA': { icon: Code, color: 'text-primary', borderColor: 'border-primary/30', bgColor: 'bg-primary/10' },
  'Data Science & ML': { icon: Brain, color: 'text-accent', borderColor: 'border-accent/30', bgColor: 'bg-accent/10' },
  'Database Management & SQL': { icon: Database, color: 'text-secondary', borderColor: 'border-secondary/30', bgColor: 'bg-secondary/10' },
  'Backend / Web Dev': { icon: Server, color: 'text-tertiary', borderColor: 'border-tertiary/30', bgColor: 'bg-tertiary/10' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const TopicItem = ({
  label, isActive, isLocked, isCompleted, onClick,
}: {
  label: string; isActive: boolean; isLocked: boolean; isCompleted: boolean; onClick: () => void;
}) => (
  <button
    onClick={!isLocked ? onClick : undefined}
    disabled={isLocked}
    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 group ${isLocked
        ? 'opacity-40 cursor-not-allowed text-muted-foreground'
        : isActive
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompleted ? 'bg-success' : isActive ? 'bg-primary' : 'bg-border'
      }`} />
    <span className="flex-1 truncate">{label}</span>
    {isCompleted && <CheckCircle className="w-3 h-3 text-success shrink-0" />}
  </button>
);

const AssessmentItem = ({
  weekNum, isActive, isLocked, onClick,
}: {
  weekNum: number; isActive: boolean; isLocked: boolean; onClick: () => void;
}) => (
  <button
    onClick={!isLocked ? onClick : undefined}
    disabled={isLocked}
    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 ${isLocked
        ? 'opacity-40 cursor-not-allowed text-muted-foreground'
        : isActive
          ? 'bg-accent/10 text-accent border border-accent/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
  >
    <Zap className="w-3 h-3 shrink-0" />
    <span className="flex-1">Week {weekNum} Assessment</span>
  </button>
);

const WeekAccordion = ({
  step, isExpanded, isLocked, isCompleted, completedWeekNums,
  activePanelView, onToggle, onTopicClick, onAssessmentClick,
}: {
  step: any; isExpanded: boolean; isLocked: boolean; isCompleted: boolean;
  completedWeekNums: number[];
  activePanelView: PanelView;
  onToggle: () => void;
  onTopicClick: (topic: string) => void;
  onAssessmentClick: () => void;
}) => {
  const activeWeek = activePanelView.type !== 'welcome' ? (activePanelView as any).week : null;
  const isActiveWeek = activeWeek === step.week;

  return (
    <div className={`rounded-lg border transition-all duration-200 ${isLocked
        ? 'border-border/40 bg-card/20'
        : isActiveWeek
          ? 'border-primary/40 bg-primary/5'
          : 'border-border bg-card hover:border-primary/20'
      }`}>
      <button
        onClick={!isLocked ? onToggle : undefined}
        disabled={isLocked}
        className={`w-full flex items-center justify-between px-4 py-3 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 font-mono ${isLocked ? 'bg-muted text-muted-foreground' : isCompleted ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
            }`}>
            {isLocked ? <Lock className="w-3 h-3" /> : isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : step.week}
          </div>
          <div className="text-left">
            <p className={`text-xs font-semibold leading-tight font-display ${isLocked ? 'text-muted-foreground' : 'text-foreground'
              }`}>
              Week {step.week}
            </p>
            <p className={`text-[10px] leading-tight mt-0.5 font-mono ${isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'
              }`}>
              {step.title}
            </p>
          </div>
        </div>
        {!isLocked && (
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1">
              {(step.topics || []).map((topic: string) => {
                const isTopicActive = activePanelView.type === 'topic'
                  && (activePanelView as any).week === step.week
                  && (activePanelView as any).topic === topic;
                return (
                  <TopicItem
                    key={topic}
                    label={topic}
                    isActive={isTopicActive}
                    isLocked={false}
                    isCompleted={false}
                    onClick={() => onTopicClick(topic)}
                  />
                );
              })}
              <AssessmentItem
                weekNum={step.week}
                isActive={activePanelView.type === 'assessment' && (activePanelView as any).week === step.week}
                isLocked={false}
                onClick={onAssessmentClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Content Panel Components ─────────────────────────────────────────────────

const WelcomePanel = () => (
  <div className="h-full flex items-center justify-center p-8 bg-white">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-lg"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-sm">
        <GraduationCap className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
        Your Personalized Roadmap
      </h2>
      <p className="text-slate-600 text-lg md:text-xl mb-6 font-medium">
        Building your future, step by step.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        Select a week from the sidebar to begin
      </div>
    </motion.div>
  </div>
);

const TopicPanel = ({
  topic, week, weekStep, discoveryResources, recommendations, allCourses, completedCourses, onToggleCourse, onStartQuiz, track,
}: {
  topic: string; week: number; weekStep: any; discoveryResources: Record<string, any[]>;
  recommendations: CourseRecommendation[]; allCourses: any[]; completedCourses: Set<string>;
  onToggleCourse: (id: string, gap: string) => void;
  onStartQuiz: () => void; track: string;
}) => {
  console.log(`TopicPanel [${topic}]: allCourses length:`, allCourses?.length);
  
  // Use ALL curated courses for this topic, not just the recommended ones
  const curatedVideos = (allCourses || [])
    .filter(c => {
      const isCurated = c.is_curated === true;
      const isYouTube = c.platform === 'YouTube';
      // Match track if track is provided, otherwise just match topic
      const isCorrectTrack = !track || c.track === track || c.track === 'Data Science & ML';
      
      const skillMatch = (c.skill_covered?.toLowerCase() || '').includes(topic.toLowerCase());
      const titleMatch = (c.title?.toLowerCase() || '').includes(topic.toLowerCase());
      
      return isCurated && isYouTube && isCorrectTrack && (skillMatch || titleMatch);
    })
    .map(c => ({ course: c, addressesGap: topic, reason: 'Curated', priority: 1 }))
    .slice(0, 3);

  const aiLinks: any[] = discoveryResources[topic] || [];

  // Categorize AI Links
  const practiceLinks = aiLinks.filter(res => 
    res.type === 'practice' || 
    (res.url?.toLowerCase() || '').includes('leetcode') || 
    (res.url?.toLowerCase() || '').includes('hackerrank') ||
    (res.platform?.toLowerCase() || '').includes('leetcode')
  ).slice(0, 3);

  const articleLinks = aiLinks.filter(res => 
    res.type === 'article' && 
    !practiceLinks.some(p => p.url === res.url)
  ).slice(0, 3);

  const aiVideoLinks = aiLinks.filter(res => 
    res.type === 'video' || 
    (res.platform?.toLowerCase() || '').includes('youtube') || 
    (res.url?.toLowerCase() || '').includes('youtube')
  ).slice(0, 3);

  return (
    <motion.div
      key={`${week}-${topic}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="h-full overflow-y-auto p-8 bg-white"
    >
      {/* Topic Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
          <span className="text-xs font-mono text-slate-500">WEEK_{week}</span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-mono text-slate-500">{weekStep?.title || 'Learning Module'}</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">{topic}</h2>
        <p className="text-slate-600 text-sm">{weekStep?.goal || 'Master this topic to progress to the next week.'}</p>
      </div>

      <div className="space-y-10">
        {/* SECTION 1: Recommended (Curated Videos) */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-primary" />
            Recommended
          </h3>
          {curatedVideos.length === 0 && aiVideoLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg">
              <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
              <p className="text-xs text-slate-500">Finding resources...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(curatedVideos.length > 0 ? curatedVideos : aiVideoLinks.map(v => ({ course: { id: v.url, title: v.title, url: v.url, platform: v.platform || 'YouTube', difficulty_level: 'Mixed' }, addressesGap: topic }))).map(rec => {
                const isDone = completedCourses.has(rec.course.id);
                return (
                  <div key={rec.course.id} className={`p-4 rounded-xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-primary/40 shadow-sm'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{rec.course.title}</p>
                      {isDone && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">{rec.course.platform}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{rec.course.difficulty_level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <a href={rec.course.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        <PlayCircle className="w-3.5 h-3.5" /> Start
                      </a>
                      <button
                        onClick={() => onToggleCourse(rec.course.id, rec.addressesGap)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${isDone ? 'border-emerald-300 text-emerald-600 bg-emerald-100/50' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white'
                          }`}
                      >
                        {isDone ? 'Finished' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: LeetCode Problems for Practice */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Code className="w-4 h-4 text-accent" />
            Coding Practice Problems
          </h3>
          {practiceLinks.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-2">Dynamically finding practice problems...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {practiceLinks.map((res, i) => {
                const isDone = completedCourses.has(res.url);
                return (
                  <div key={i} className={`p-4 rounded-xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-accent/40 shadow-sm'} group`}>
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono font-medium text-accent bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10">{res.platform || 'Practice'}</span>
                         <span className="text-[10px] text-slate-500 font-medium">Practice</span>
                       </div>
                       {isDone && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-3 group-hover:text-accent transition-colors">{res.title}</p>
                    <div className="flex items-center justify-between">
                      <a href={res.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Solve Problem
                      </a>
                      <button
                        onClick={() => onToggleCourse(res.url, topic)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${isDone ? 'border-emerald-300 text-emerald-600 bg-emerald-100/50' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white'}`}
                      >
                        {isDone ? 'Finished' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: Articles to Read */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-tertiary" />
            Articles to Read
          </h3>
          {articleLinks.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-2">Discovering relevant articles...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {articleLinks.map((res, i) => {
                const isDone = completedCourses.has(res.url);
                return (
                  <div key={i} className={`p-4 rounded-xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-tertiary/40 shadow-sm'} group`}>
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-mono font-medium text-tertiary bg-tertiary/5 px-2 py-0.5 rounded-full border border-tertiary/10">{res.platform || 'Article'}</span>
                         <span className="text-[10px] text-slate-500 font-medium">Article</span>
                       </div>
                       {isDone && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1 mb-3 group-hover:text-tertiary transition-colors">{res.title}</p>
                    <div className="flex items-center justify-between">
                      <a href={res.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-tertiary hover:text-tertiary/80 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Read Article
                      </a>
                      <button
                        onClick={() => onToggleCourse(res.url, topic)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${isDone ? 'border-emerald-300 text-emerald-600 bg-emerald-100/50' : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white'}`}
                      >
                        {isDone ? 'Finished' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action */}
      <div className="pt-8 mt-12 border-t border-slate-100 flex justify-center">
        <CyberButton
          variant="primary"
          onClick={onStartQuiz}
          className="px-8 shadow-md shadow-primary/5"
        >
          <Zap className="w-4 h-4 mr-2" />
          TEST THIS TOPIC(optional)
        </CyberButton>
      </div>
    </motion.div>
  );
};

const AssessmentPanel = ({
  week, weekStep, track, onStartQuiz,
}: {
  week: number; weekStep: any; track: string; onStartQuiz: () => void;
}) => (
  <motion.div
    key={`assessment-${week}`}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
    className="h-full flex flex-col items-center justify-center p-8 text-center bg-white"
  >
    <div className="w-20 h-20 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center mb-6">
      <FileText className="w-10 h-10 text-accent" />
    </div>
    <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Week {week} Assessment</h2>
    <p className="text-slate-500 text-sm mb-2 max-w-sm">
      {weekStep?.goal || 'Test your knowledge from this week\'s topics.'}
    </p>
    <p className="text-xs text-slate-500 mb-8">
      Topics covered: {(weekStep?.topics || []).join(', ')}
    </p>
    <CyberButton
      variant="primary"
      onClick={onStartQuiz}
    >
      <Zap className="w-4 h-4 mr-2" />
      Start Week {week} Assessment
    </CyberButton>
  </motion.div>
);

// ─── Inline Quiz Component ───────────────────────────────────────────────────

const InlineQuiz = ({
  topics, week, isWeekly, track, onCancel, onComplete
}: {
  topics: string[]; week: number; isWeekly: boolean; track: string; onCancel: () => void; onComplete: (score: number) => void;
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:3001/assessment/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track, numQuestions: isWeekly ? 10 : 5, topics })
        });
        const data = await res.json();
        if (data.success) setQuestions(data.questions);
      } catch (err) {
        console.error("Quiz Fetch Error:", err);
      } finally {
        setIsLoading(true);
        // Small artificial delay for "AI Generation" feel
        setTimeout(() => setIsLoading(false), 1500);
      }
    };
    fetchQuestions();
  }, [topics, track]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const responses = questions.map((q, i) => ({
        questionNumber: i + 1,
        answer: answers[i] || ""
      }));

      const res = await fetch('http://localhost:3001/assessment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, questions, responses })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        onComplete(data.correctCount);
      }
    } catch (err) {
      console.error("Quiz Submit Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-bold font-display text-slate-800">Generating Quiz Questions</h3>
        <p className="text-slate-500 text-sm mt-2 font-mono">Customizing questions for: {topics.join(', ')}</p>
      </div>
    );
  }

  if (results) {
    const scorePercent = Math.round((results.correctCount / questions.length) * 100);
    const isPassed = scorePercent >= 70;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-8">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 ${
            isPassed ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-amber-50 border-amber-500 text-amber-600'
          }`}>
            {isPassed ? <CheckCircle className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{isPassed ? 'Topic Mastered!' : 'Keep Practicing!'}</h2>
          <p className="text-slate-500 text-sm mt-1">Score: {results.correctCount} / {questions.length} ({scorePercent}%)</p>
        </div>

        <div className="space-y-4 mb-8">
          {results.results.map((res: any, i: number) => {
            const q = questions[i];
            const userAns = answers[i];
            const isMcq = q.type === 'mcq';
            
            return (
              <div key={i} className={`p-4 rounded-lg border ${res.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center justify-between mb-2">
                   <p className={`text-[10px] font-bold font-mono uppercase tracking-wider ${res.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                    Question {i + 1}: {res.isCorrect ? 'Correct' : 'Incorrect'}
                  </p>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${res.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-slate-900 mb-3">{q.question}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="p-2 rounded bg-white/60 border border-slate-200/50">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Your Answer</p>
                    <p className={`text-xs ${res.isCorrect ? 'text-emerald-700' : 'text-red-700'} font-medium`}>
                      {isMcq ? (q.options[userAns] || 'No Answer') : (userAns || 'No Answer')}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-white/60 border border-slate-200/50">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Correct Answer</p>
                    <p className="text-xs text-emerald-700 font-medium">
                      {isMcq ? q.options[res.correctAnswer] : res.correctAnswer}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 italic bg-white/80 p-3 rounded-lg border border-slate-200/50 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <p><span className="font-bold text-slate-700 not-italic">Explanation:</span> {res.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <CyberButton variant="primary" onClick={onCancel}>
            Back to Learning Resources
          </CyberButton>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50/50">
      <div className="flex-shrink-0 px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Topic Quiz: {topics[0]}</h3>
          <p className="text-[10px] text-slate-500 font-mono">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs">
                Q{currentIdx + 1}
               </div>
               <div className="space-y-4 flex-1">
                 <h4 className="text-lg font-medium text-slate-900 leading-relaxed">{q.question}</h4>
                 {q.code && (
                   <div className="bg-[#1e1e1e] rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                     <pre><code>{q.code}</code></pre>
                   </div>
                 )}
               </div>
            </div>

            <div className="grid gap-3 pl-12">
              {q.type === 'mcq' ? (
                q.options.map((option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      answers[currentIdx] === i 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
                         answers[currentIdx] === i ? 'bg-primary text-white border-primary' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Answer:</p>
                  <textarea
                    value={answers[currentIdx] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                    placeholder="Type your explanation or answer here..."
                    className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-inner text-slate-800"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-shrink-0 px-8 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(prev => prev - 1)}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Previous
        </button>
        
        {currentIdx === questions.length - 1 ? (
          <CyberButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || answers[currentIdx] === undefined}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Quiz
          </CyberButton>
        ) : (
          <CyberButton
            variant="primary"
            onClick={() => setCurrentIdx(prev => prev + 1)}
            disabled={answers[currentIdx] === undefined}
          >
            Next Question
            <ArrowRight className="w-4 h-4 ml-2" />
          </CyberButton>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LearningPath = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [allAssessments, setAllAssessments] = useState<AssessmentData[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(location.state?.domain ?? null);

  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [studyTips, setStudyTips] = useState<string[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [savedDomains, setSavedDomains] = useState<Set<string>>(new Set());
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);

  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // New sidebar/panel UI state
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [panelView, setPanelView] = useState<PanelView>({ type: 'welcome' });

  const skillGaps: SkillGap[] =
    assessmentData?.ai_prediction?.skillGaps ||
    (assessmentData?.gaps || []).map((g: string) => ({ skill: g, gapType: 'Conceptual', priority: 'High' }));

  const weeklyPlan: any[] = assessmentData?.ai_prediction?.weeklyPlan || [];
  const discoveryResources: Record<string, any[]> = assessmentData?.ai_prediction?.discoveryResources || {};

  // ── Data loading (unchanged backend logic) ────────────────────────────────

  useEffect(() => {
    if (!isLoggedIn) { navigate('/'); return; }
    loadAllDomains();
  }, [username, isLoggedIn]);

  const loadAllDomains = async () => {
    setIsLoadingDomains(true);
    try {
      const [assessmentRes, pathRes, courseRes] = await Promise.all([
        supabase.from('assessment_results').select('*').eq('student_username', username).order('created_at', { ascending: false }),
        supabase.from('learning_paths').select('course_id, skill_gap').eq('student_username', username).not('course_id', 'is', null),
        supabase.from('courses').select('id, track'),
      ]);

      if (assessmentRes.error) throw assessmentRes.error;

      const seen = new Set<string>();
      const deduped: AssessmentData[] = [];
      for (const row of (assessmentRes.data || [])) {
        if (!seen.has(row.track)) {
          seen.add(row.track);
          deduped.push({ ...row, gaps: Array.isArray(row.gaps) ? (row.gaps as unknown as string[]) : [] });
        }
      }
      setAllAssessments(deduped);

      const courseTrackMap = new Map((courseRes.data || []).map(c => [c.id, c.track]));
      const saved = new Set<string>();
      for (const p of (pathRes.data || [])) {
        const track = courseTrackMap.get(p.course_id ?? '');
        if (track) saved.add(track);
      }
      setSavedDomains(saved);

      const target = location.state?.domain || (deduped[0]?.track ?? null);
      setActiveDomain(target);

      if (target) {
        const current = deduped.find(a => a.track === target);
        if (current) {
          setAssessmentData(current);
          setCompletedWeeks(current.ai_prediction?.completedWeeks || []);
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load assessments', variant: 'destructive' });
    } finally {
      setIsLoadingDomains(false);
    }
  };

  useEffect(() => {
    if (!activeDomain || allAssessments.length === 0) return;
    const assessment = allAssessments.find(a => a.track === activeDomain);
    if (!assessment) return;

    setAssessmentData(assessment);
    setRecommendations([]);
    setStudyTips([]);
    setCompletedWeeks(assessment.ai_prediction?.completedWeeks || []);
    setPanelView({ type: 'welcome' });
    setExpandedWeeks(new Set([1]));
    loadLearningPath(assessment);

    // Only generate if weeklyPlan or discoveryResources are genuinely missing
    const hasPlan = Array.isArray(assessment.ai_prediction?.weeklyPlan) && assessment.ai_prediction.weeklyPlan.length > 0;
    const hasResources = assessment.ai_prediction?.discoveryResources && Object.keys(assessment.ai_prediction.discoveryResources).length > 0;

    if (!hasPlan || !hasResources) {
      generateMissingRoadmap(assessment);
    }
  }, [activeDomain, allAssessments]);

  const generateMissingRoadmap = async (assessment: AssessmentData) => {
    setIsGeneratingRoadmap(true);
    try {
      // 1. Fetch real Resume Score from DB for the RF model
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('overall_score')
        .eq('student_username', username)
        .maybeSingle();

      const resumeScore = resumeData?.overall_score ?? null;

      // 2. Predict Readiness level (using RF model on backend)
      console.log('🚀 [Frontend] Calling /assessment/predict...');
      const res = await fetch('http://localhost:3001/assessment/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: assessment.track,
          correctAnswers: assessment.correct_answers,
          totalQuestions: assessment.total_questions,
          gaps: assessment.gaps,
          correctTopics: [], 
          resumeScore, // Use the real score from DB
        }),
      });
      if (!res.ok) {
        console.error('❌ [Frontend] Prediction failed:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      if (!data.success || !data.prediction) {
        console.error('❌ [Frontend] Invalid prediction response:', data);
        return;
      }

      console.log('✅ [Frontend] Received prediction from backend');
      console.log('   - weeklyPlan items:', data.prediction.weeklyPlan?.length || 0);
      console.log('   - discoveryResources topics:', Object.keys(data.prediction.discoveryResources || {}).length);
      Object.entries(data.prediction.discoveryResources || {}).forEach(([topic, resources]: any) => {
        console.log(`     - ${topic}: ${resources?.length || 0} resources`);
      });

      const updatedPrediction = { ...(assessment.ai_prediction || {}), ...data.prediction };
      console.log('💾 [Frontend] Saving to Supabase...');
      setAssessmentData(prev => prev ? { ...prev, ai_prediction: updatedPrediction } : prev);
      setAllAssessments(prev => prev.map(a => a.id === assessment.id ? { ...a, ai_prediction: updatedPrediction } : a));

      const { error } = await supabase.from('assessment_results').update({ ai_prediction: updatedPrediction }).eq('id', assessment.id);
      if (error) {
        console.error('❌ [Frontend] Failed to save to DB:', error);
      } else {
        console.log('✅ [Frontend] Successfully saved to Supabase');
      }
    } catch (err) {
      console.error('❌ Roadmap generation error:', err);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const loadLearningPath = async (assessment: AssessmentData, forceRegenerate = false) => {
    try {
      const [completedRes, savedPathsRes, allCoursesRes] = await Promise.all([
        supabase.from('learning_paths').select('course_id, is_completed').eq('student_username', username).eq('is_completed', true),
        supabase.from('learning_paths').select('course_id, skill_gap').eq('student_username', username).not('course_id', 'is', null),
        supabase.from('courses').select('*'),
      ]);

      if (completedRes.data) {
        setCompletedCourses(new Set(completedRes.data.map(p => p.course_id).filter(Boolean) as string[]));
      }

      const courseMap = new Map((allCoursesRes.data || []).map(c => [c.id, c]));
      setAllCourses(allCoursesRes.data || []);
      const savedForDomain = (savedPathsRes.data || []).filter(p => {
        const course = courseMap.get(p.course_id ?? '');
        return course?.track === assessment.track;
      });

      if (!forceRegenerate && savedForDomain.length > 0) {
        const recs: CourseRecommendation[] = savedForDomain
          .map((p, i) => {
            const course = courseMap.get(p.course_id ?? '');
            if (!course) return null;
            return { course, addressesGap: p.skill_gap || 'General', reason: '', priority: i + 1 } as CourseRecommendation;
          })
          .filter(Boolean) as CourseRecommendation[];
        setRecommendations(recs);

        const { data: tipsRow } = await supabase.from('learning_path_tips').select('tips').eq('student_username', username).eq('track', assessment.track).maybeSingle();
        setStudyTips(Array.isArray(tipsRow?.tips) ? (tipsRow!.tips as string[]) : []);
        return;
      }

      setIsGenerating(true);

      if (forceRegenerate && savedForDomain.length > 0) {
        const oldCourseIds = savedForDomain.map(p => p.course_id).filter(Boolean) as string[];
        await Promise.all([
          supabase.from('learning_paths').delete().eq('student_username', username).in('course_id', oldCourseIds),
          supabase.from('learning_path_tips').delete().eq('student_username', username).eq('track', assessment.track),
        ]);
      }

      await generateRecommendations(assessment, allCoursesRes.data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load learning path', variant: 'destructive' });
      setIsGenerating(false);
    }
  };

  const generateRecommendations = async (assessment: AssessmentData, courses: any[]) => {
    setIsGenerating(true);
    console.log('📚 [generateRecommendations] Starting with fast local matching (skipping expensive Supabase function)...');
    try {
      const gaps = assessment.ai_prediction?.skillGaps ||
        (assessment.gaps || []).map((g: string) => ({ skill: g, gapType: 'Conceptual', priority: 'High' }));

      // OPTIMIZED: Use fast local matching instead of expensive Supabase TF-IDF function
      // This avoids worker limit issues and is just as effective for matching skill gaps to courses
      const recs: CourseRecommendation[] = courses
        .filter(c => gaps.some((g: any) => 
          c.skill_covered?.toLowerCase().includes(g.skill?.toLowerCase()) || 
          c.title?.toLowerCase().includes(g.skill?.toLowerCase())
        ))
        .slice(0, 8)
        .map((c, i) => ({ 
          course: c, 
          addressesGap: gaps[0]?.skill || 'General', 
          reason: 'Matches your skill gaps', 
          priority: i + 1 
        }));

      const tips: string[] = gaps.slice(0, 3).map((gap: any, index: number) => {
        const tipList = [
          `Focus on strengthening ${gap.skill} fundamentals through practice problems`,
          `Join study groups or forums for ${gap.skill} discussions`,
          `Work on real-world projects involving ${gap.skill}`,
          `Review ${gap.skill} concepts regularly and test your understanding`
        ];
        return tipList[index % tipList.length];
      });

      setRecommendations(recs);
      setStudyTips(tips);
      console.log(`✅ [generateRecommendations] Generated ${recs.length} recommendations using fast local matching`);

      if (recs.length > 0) {
        const inserts = recs.map((r, i) => ({ 
          student_username: username, 
          course_id: r.course.id, 
          skill_gap: r.addressesGap || 'General', 
          priority: i + 1, 
          is_completed: false 
        }));
        await Promise.all([
          supabase.from('learning_paths').insert(inserts),
          supabase.from('learning_path_tips').upsert(
            { student_username: username, track: assessment.track, tips }, 
            { onConflict: 'student_username,track' }
          ),
        ]);
        setSavedDomains(prev => new Set([...prev, assessment.track]));
        console.log(`💾 [generateRecommendations] Saved ${recs.length} courses to learning_paths`);
      }
    } catch (err: any) {
      console.error('❌ [generateRecommendations] Error:', err.message);
      // Ultra-safe fallback for edge cases
      const gaps = assessment.gaps || [];
      const fallback = courses
        .filter(c => gaps.some((g: string) => 
          c.skill_covered?.toLowerCase().includes(g.toLowerCase()) || 
          c.title?.toLowerCase().includes(g.toLowerCase())
        ))
        .slice(0, 8)
        .map((c, i) => ({ 
          course: c, 
          addressesGap: gaps[0] || 'General', 
          reason: 'Recommended based on your gaps', 
          priority: i + 1 
        }));
      setRecommendations(fallback);
      console.log(`⚠️ [generateRecommendations] Using fallback with ${fallback.length} courses`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCourseComplete = async (courseId: string, gap: string) => {
    const isCompleted = completedCourses.has(courseId);
    const updated = new Set(completedCourses);
    if (isCompleted) {
      updated.delete(courseId);
      await supabase.from('learning_paths').delete().eq('student_username', username).eq('course_id', courseId);
    } else {
      updated.add(courseId);
      await supabase.from('learning_paths').insert({ student_username: username, course_id: courseId, skill_gap: gap, is_completed: true, completed_at: new Date().toISOString() });
    }
    setCompletedCourses(updated);
  };

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const progressPercent = recommendations.length > 0
    ? Math.round((recommendations.filter(r => completedCourses.has(r.course.id)).length / recommendations.length) * 100)
    : 0;

  // ── Loading & Empty States ────────────────────────────────────────────────

  if (isLoadingDomains) {
    return (
      <div className="min-h-screen relative bg-background grid-pattern">
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 mx-auto mb-4">
              <Brain className="w-12 h-12 text-primary" />
            </motion.div>
            <p className="text-muted-foreground text-sm font-mono tracking-wider uppercase">Initializing_System...</p>
          </div>
        </div>
      </div>
    );
  }

  if (allAssessments.length === 0) {
    return (
      <div className="min-h-screen relative bg-background grid-pattern">
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-sm px-6">
            <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground text-sm mb-8">
              Complete a domain assessment to unlock your personalized learning path.
            </p>
            <CyberButton variant="primary" onClick={() => navigate('/tracks')}>
              <Zap className="w-4 h-4 mr-2" /> Take Assessment
            </CyberButton>
          </div>
        </div>
      </div>
    );
  }

  const trackCfg = TRACK_CONFIG[activeDomain ?? ''] ?? TRACK_CONFIG['Programming & DSA'];
  const TrackIcon = trackCfg.icon;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background grid-pattern">
      {/* Subtle ambient blobs — same as home page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-40 left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl" animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 7, repeat: Infinity }} />
      </div>
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden pt-16">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-card/80 backdrop-blur-xl overflow-hidden relative z-10">

          {/* Domain Selector Header */}
          <div className="p-4 border-b border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-2">Active Domain</p>
            <div className="flex flex-wrap gap-1.5">
              {allAssessments.map(a => {
                const c = TRACK_CONFIG[a.track] ?? TRACK_CONFIG['Programming & DSA'];
                const Icon = c.icon;
                const isActive = activeDomain === a.track;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveDomain(a.track)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${isActive
                        ? `${c.bgColor} ${c.color} ${c.borderColor} border`
                        : 'text-muted-foreground hover:text-foreground bg-muted border border-border hover:border-primary/30'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{a.track.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track Info */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrackIcon className={`w-4 h-4 ${trackCfg.color}`} />
              <span className={`text-sm font-semibold font-display ${trackCfg.color}`}>{activeDomain}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{progressPercent}%</span>
            </div>
          </div>

          {/* Week Accordion List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isGeneratingRoadmap ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mb-3" />
                <p className="text-xs text-muted-foreground font-mono">Generating your roadmap...</p>
              </div>
            ) : weeklyPlan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="w-6 h-6 text-accent/60 mb-3" />
                <p className="text-xs text-muted-foreground">No roadmap data available yet.</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Complete an assessment first.</p>
              </div>
            ) : (
              weeklyPlan.map((step: any) => {
                const isLocked = step.week > 1 && !completedWeeks.includes(step.week - 1);
                const isCompleted = completedWeeks.includes(step.week);
                return (
                  <WeekAccordion
                    key={step.week}
                    step={step}
                    isExpanded={expandedWeeks.has(step.week)}
                    isLocked={isLocked}
                    isCompleted={isCompleted}
                    completedWeekNums={completedWeeks}
                    activePanelView={panelView}
                    onToggle={() => toggleWeek(step.week)}
                    onTopicClick={(topic) => setPanelView({ type: 'topic', week: step.week, topic })}
                    onAssessmentClick={() => setPanelView({ type: 'assessment', week: step.week })}
                  />
                );
              })
            )}

            {/* Final Assessment */}
            {weeklyPlan.length > 0 && (() => {
              const allWeekNums = weeklyPlan.map((s: any) => s.week);
              const allWeeksDone = allWeekNums.every((w: number) => completedWeeks.includes(w));
              const remaining = allWeekNums.filter((w: number) => !completedWeeks.includes(w)).length;
              return (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={allWeeksDone ? () => navigate('/assessment', { state: { track: activeDomain } }) : undefined}
                    disabled={!allWeeksDone}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${allWeeksDone
                        ? 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer'
                        : 'border-border bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {allWeeksDone ? <GraduationCap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <div className="text-left">
                      <p className="font-display">Final Assessment</p>
                      {!allWeeksDone && (
                        <p className="text-[10px] text-muted-foreground/60 font-mono font-normal">{remaining} week{remaining > 1 ? 's' : ''} remaining</p>
                      )}
                    </div>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Regenerate Footer */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => assessmentData && loadLearningPath(assessmentData, true)}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate Path
            </button>
          </div>
        </aside>

        {/* ── RIGHT CONTENT PANEL ──────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden flex flex-col relative z-10 bg-white">

          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {panelView.type === 'welcome' && (
                <span className="text-sm text-slate-500 font-mono">Select Topic To Begin</span>
              )}
              {panelView.type === 'topic' && (
                <>
                  <span className="text-xs text-slate-400 font-mono">WEEK_{(panelView as any).week}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-sm font-semibold text-slate-900">{(panelView as any).topic}</span>
                </>
              )}
              {panelView.type === 'assessment' && (
                <>
                  <span className="text-xs text-slate-400 font-mono">WEEK_{(panelView as any).week}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-sm font-semibold text-accent">Assessment</span>
                </>
              )}
              {panelView.type === 'quiz' && (
                <>
                  <span className="text-xs text-slate-400 font-mono">WEEK_{(panelView as any).week}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-sm font-semibold text-primary">Practice Quiz</span>
                </>
              )}
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading courses...</span>
              </div>
            )}
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {panelView.type === 'welcome' && (
                <motion.div key="welcome" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <WelcomePanel />
                </motion.div>
              )}

              {panelView.type === 'topic' && (() => {
                const { week, topic } = panelView as any;
                const weekStep = weeklyPlan.find((s: any) => s.week === week);
                return (
                  <TopicPanel
                    key={`topic-${week}-${topic}`}
                    topic={topic}
                    week={week}
                    weekStep={weekStep}
                    discoveryResources={discoveryResources}
                    recommendations={recommendations}
                    allCourses={allCourses}
                    completedCourses={completedCourses}
                    onToggleCourse={toggleCourseComplete}
                    onStartQuiz={() => setPanelView({ type: 'quiz', week, topics: [topic], isWeekly: false })}
                    track={activeDomain ?? ''}
                  />
                );
              })()}

              {panelView.type === 'assessment' && (() => {
                const { week } = panelView as any;
                const weekStep = weeklyPlan.find((s: any) => s.week === week);
                return (
                  <AssessmentPanel
                    key={`assessment-${week}`}
                    week={week}
                    weekStep={weekStep}
                    track={activeDomain ?? ''}
                    onStartQuiz={() => setPanelView({ type: 'quiz', week, topics: weekStep?.topics || [], isWeekly: true })}
                  />
                );
              })()}

              {panelView.type === 'quiz' && (() => {
                const { week, topics, isWeekly } = panelView as any;
                return (
                  <InlineQuiz
                    key={`quiz-${week}-${topics.join('-')}`}
                    week={week}
                    topics={topics}
                    isWeekly={isWeekly}
                    track={activeDomain ?? ''}
                    onCancel={() => setPanelView({ type: isWeekly ? 'assessment' : 'topic', week, topic: topics[0] } as any)}
                    onComplete={async (score) => {
                      const numQuestions = isWeekly ? 10 : 5;
                      const isPassed = (score / numQuestions) >= 0.7;

                      if (isWeekly && isPassed && assessmentData) {
                        const currentPrediction = assessmentData.ai_prediction || {};
                        const completed = Array.isArray(currentPrediction.completedWeeks) ? [...currentPrediction.completedWeeks] : [];
                        if (!completed.includes(week)) {
                          completed.push(week);
                          const updatedPrediction = { ...currentPrediction, completedWeeks: completed };

                          // Update local state
                          setCompletedWeeks(completed);
                          setAssessmentData({ ...assessmentData, ai_prediction: updatedPrediction });

                          // Update Supabase
                          await supabase.from('assessment_results')
                            .update({ ai_prediction: updatedPrediction })
                            .eq('id', assessmentData.id);

                          toast({
                            title: `Week ${week} Mastered! 🎓`,
                            description: "You've unlocked the next stage of your roadmap.",
                          });
                        }
                      }
                    }}
                  />
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Study Tips Strip */}
          {studyTips.length > 0 && panelView.type !== 'welcome' && (
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50/80 px-8 py-3 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight font-display">STUDY_TIP</span>
                </div>
                <p className="text-xs text-slate-700 font-medium italic line-clamp-1 truncate flex-1">{studyTips[0]}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningPath;

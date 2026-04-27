import { callEvaluationAPI, safeParse } from './llm.js';
import { getAllTopics } from './syllabus.js';
import { spawn } from 'child_process';
import { supabase } from '../supabase_client.js';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Simulated Random Forest - Ensemble of decision-weighted rules
 * Features: [Score, Resume, Gaps, MasteredTopics] -> Output: [Level]
 */
/**
 * Real XGBoost Model Prediction via Python Bridge
 */
async function predictLevelWithXGBoost(features) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../predict_with_xgboost.py');
    
    // Use spawn instead of exec for robust data transfer via stdin
    const py = spawn(`python3 "${scriptPath}"`, {
      timeout: 15000,
      env: process.env,
      shell: true
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => { stdout += data; });
    py.stderr.on('data', (data) => { stderr += data; });

    py.on('error', (err) => {
      console.error("❌ Failed to start ML Script:", err.message);
      return resolve(heuristicFallback(features));
    });

    py.on('close', (code, signal) => {
      if (code !== 0 || signal) {
        console.error(`❌ ML Prediction Failed (Code ${code}, Signal ${signal}):`, stderr);
        return resolve(heuristicFallback(features));
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          console.error("❌ ML Script Error:", result.error);
          return resolve(heuristicFallback(features));
        }
        resolve(result);
      } catch (parseError) {
        console.error("❌ Failed to parse ML output:", stdout);
        resolve(heuristicFallback(features));
      }
    });

    // Write features to stdin
    py.stdin.write(JSON.stringify(features));
    py.stdin.end();
  });
}

/**
 * Heuristic Fallback (Ensures zero downtime if ML script fails)
 */
function heuristicFallback(features) {
  const { assessment_score, resume_score, skill_gap_count } = features;
  
  // Weights matching our improvement.py logic
  const val = (assessment_score * 0.5) + (resume_score * 0.2) - (Math.min(skill_gap_count / 10.0, 1.0) * 0.3);
  
  let level = "Beginner";
  if (val > 0.65) level = "Ready";
  else if (val > 0.35) level = "Intermediate";

  return { 
    level, 
    confidence: 50.0, // Low confidence for fallback
    isFallback: true 
  };
}

export async function analyzeReadiness(track, correctAnswers, totalQuestions, gaps, resumeScore = 0, correctTopics = [], userId = null) {
  const assessmentScore = (correctAnswers / totalQuestions);
  const allSyllabusTopics = getAllTopics(track);
  const masteryRatio = correctTopics.length / (allSyllabusTopics.length || 1);

  // 1. Fetch real session metadata from Supabase to replace placeholders
  let prevAttempts = 0;
  let avgDifficultyValue = 2.0;

  try {
    const { data: pastLogs, error: logError } = await supabase
      .from('prediction_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('track', track);
    
    if (!logError && pastLogs) prevAttempts = pastLogs.length;

    // TODO: In a production system, we'd fetch actual average difficulty from the questions presented
    // For now, we'll use a slightly more dynamic default based on the track
    avgDifficultyValue = track.includes('Data Science') ? 2.5 : 2.0;
  } catch (err) {
    console.warn("Failed to fetch session metadata, using defaults.");
  }

  // 2. Dynamic Track Mapping (Scalable)
  const trackMapping = {
    'Programming & DSA': 0,
    'Data Science & ML': 1,
    'Database Management & SQL': 2,
    'Backend / Web Dev': 3,
    'Data Science': 1 // Legacy support
  };
  const trackId = trackMapping[track] ?? 0;

  // 3. Prediction using Real XGBoost Model (or Fallback)
  const features = {
    assessment_score: assessmentScore,
    mastery_ratio: masteryRatio,
    resume_score: resumeScore / 100, // Normalize to 0-1
    prev_attempts: prevAttempts,
    avg_difficulty: avgDifficultyValue,
    skill_gap_count: gaps.length,
    track_id: trackId
  };

  const mlResult = await predictLevelWithXGBoost(features);
  const level = mlResult.level;
  // Clamp confidence to 95% max (synthetic data can cause overconfidence)
  const confidence = Math.min(mlResult.confidence, 95.0);

  // 2. Log Prediction to Supabase if possible
  const levelToInt = { "Beginner": 0, "Intermediate": 1, "Ready": 2 };
  try {
    const { error } = await supabase.from('prediction_logs').insert({
      user_id: userId,
      track,
      // All training features (must match feature_order.json)
      assessment_score: features.assessment_score,
      mastery_ratio: features.mastery_ratio,
      resume_score: features.resume_score,
      prev_attempts: features.prev_attempts,
      avg_difficulty: features.avg_difficulty,
      skill_gap_count: features.skill_gap_count,
      track_id: features.track_id,
      // Prediction output
      prediction: levelToInt[level] ?? 0,  // Store as INT for retraining
      prediction_label: level,
      confidence: confidence
    });
    if (error) console.warn("Log failed:", error.message);
  } catch (dbErr) {
    console.warn("DB logging skip:", dbErr.message);
  }

  // Step 3: Smart AI Mentor Feedback (with Zod Validation)
  const mentorContext = mlResult.isFallback 
    ? "The AI mentor is currently using a heuristic backup model."
    : `The XGBoost ML model determined this level with **${confidence}% confidence**. 
       Key contributing factors: ${mlResult.top_factors?.map(f => `${f.feature} (Importance: ${f.importance.toFixed(1)})`).join(", ")}`;

  const resultSchema = z.object({
    confidence: z.number(),
    estimatedReadinessWeeks: z.number(),
    topicClassification: z.object({
      strong: z.array(z.string()),
      weak: z.array(z.string()),
      unknown: z.array(z.string())
    }),
    skillGaps: z.array(z.object({
      skill: z.string(),
      gapType: z.string(),
      priority: z.enum(["High", "Medium", "Low"])
    })),
    overallAnalysis: z.string()
  });

  const systemPrompt = `You are a high-level AI Career Mentor who explains ML-driven readiness results.
  Context: ${mentorContext}`;
  
  const userPrompt = `
Performance Data for ${track}:
- ML Predicted Level: ${level}
- Prediction Confidence: ${confidence}%
- Top Features: ${JSON.stringify(mlResult.top_factors)}
- Test Score: ${correctAnswers}/${totalQuestions} (${Math.round(assessmentScore * 100)}%)
- Resume Match: ${resumeScore}%
- Mastered Topics: ${correctTopics.join(", ")}
- Critical Skill Gaps: ${gaps.join(", ")}

Task: 
1. Explain why the student is at the "${level}" level based on the performance vs syllabus.
2. Reference the ML Top Features in your explanation to provide "Model Explainability".
3. Provide a clear path to reach the next level.
4. Classify ALL topics into ["strong", "weak", "unknown"].

Return ONLY this JSON schema:
${JSON.stringify(resultSchema.shape, null, 2)} `;

  const content = await callEvaluationAPI(systemPrompt, userPrompt, true);
  let result = safeParse(content);
  
  // Strict Validation Layer
  try {
    result = resultSchema.parse(result);
  } catch (zodErr) {
    console.error("❌ AI Response Validation Failed:", zodErr.message);
    // Fallback to basic structure if validation fails
    result = {
      ...result,
      topicClassification: result.topicClassification || { strong: [], weak: [], unknown: [] },
      skillGaps: result.skillGaps || []
    };
  }
  
  result.level = level; 
  result.mlConfidence = confidence;
  result.mlFactors = mlResult.top_factors || [];
  
  // Safety check: ensure all categorized topics are valid syllabus topics
  const classification = result.topicClassification || { strong: [], weak: [], unknown: [] };
  
  // Merge explicit gaps into weak if missed
  classification.weak = [...new Set([...(classification.weak || []), ...gaps])];
  classification.strong = [...new Set([...(classification.strong || []), ...correctTopics])];
  
  // Filter out any overlap (if LLM is confused)
  classification.unknown = allSyllabusTopics.filter(t => !classification.strong.includes(t) && !classification.weak.includes(t));

  result.topicClassification = classification;
  result.skillGaps = result.skillGaps || [];
  return result;
}

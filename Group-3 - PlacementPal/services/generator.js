import { callGroqAPI as callNvidiaAPI, safeParse } from './llm.js';
import { supabase } from '../supabase_client.js';
import { getAllTopics } from './syllabus.js';

/**
 * Generator Service - High-Performance Batch Question Generation
 */

export async function generateAssessment(track, context, numQuestions = 15, topics = []) {
  const isTargeted = topics && topics.length > 0;
  const allowedTopics = isTargeted ? topics : getAllTopics(track);
  
  console.log(`🚀 ${isTargeted ? 'Targeted' : 'Fresh'} Generation Attempt for ${track}. Questions: ${numQuestions}`);

  const systemPrompt = `You are an elite technical assessment architect.
Your task is to generate a diverse, challenging, and ZERO-REDUNDANCY set of questions for a student.

STRICT RULES ON VARIETY:
1. Every question MUST cover a different sub-topic or specific concept.
2. DO NOT repeat the same fact, logic, or complexity analysis.
3. If multiple topics are provided, distribute questions evenly across them.
4. For coding questions, provide clear problem statements and expected outputs.
5. Ensure a mix of conceptual and practical/output-based questions.

Return ONLY a JSON object with a "questions" array.`;

  const userPrompt = `
Domain: ${track}
Context Information: ${context}
Number of Questions: ${numQuestions}
Topics to cover: [${allowedTopics.join(", ")}]

Assessment Format:
${isTargeted ? 
`- 100% Multiple Choice Questions (Type: mcq)
- Each question must have 4 clear options (A, B, C, D).
- Total Questions MUST be exactly ${numQuestions}.` :
`- Exactly 9 Multiple Choice Questions (Type: mcq) with 4 options each.
- Exactly 6 Coding/Output Questions (Type: coding) where students provide the logic or result.
- Total Questions MUST be exactly ${numQuestions}.`}

Detailed Requirements:
1. Difficulty: Mix of Easy, Medium, and Hard across all types.
2. Explanation: Provide a detailed technical explanation for every question.
3. Topics: Map each question to a specific topic from the provided list.

JSON Schema for "questions" array elements:
{ 
  "question": "string", 
  "options": ["A","B","C","D"] | null, 
  "correctAnswer": number | "string", 
  "explanation": "string", 
  "type": "mcq" | "coding", 
  "topic": "string", 
  "difficulty": "Easy" | "Medium" | "Hard" 
}

Note: For "mcq", correctAnswer is the 0-3 index. For "coding", correctAnswer is the expected output/logic string.
STRICT: DO NOT REPEAT CONCEPTS.`;

  try {
    // 1. TRY FRESH GENERATION FIRST
    const content = await callNvidiaAPI(systemPrompt, userPrompt, true);
    const parsed = safeParse(content);
    
    let generatedQuestions = parsed.questions || [];
    
    if (generatedQuestions.length === 0) throw new Error("AI returned empty questions");

    // Add question numbers and normalize
    generatedQuestions = generatedQuestions.map((q, idx) => ({
      ...q,
      id: `q_${Date.now()}_${idx}`,
      questionNumber: idx + 1
    }));

    // Success Path: Update Cache & Relational Tables
    if (!isTargeted) {
      try {
        // 1. Update High-Performance JSON Cache
        await supabase
          .from('cached_assessments')
          .upsert({ track, questions: generatedQuestions }, { onConflict: 'track' });
        
        // 2. Populate Relational 'assessment_questions' for Analytics (to stop it being empty!)
        // Note: In a real production app, we would first look up/create the category.
        // For simplicity and proving dynamic persistence, we'll store them directly if categories match.
        const { data: trackData } = await supabase.from('assessment_tracks').select('id').eq('name', track).maybeSingle();
        
        if (trackData) {
          const { data: categories } = await supabase.from('assessment_categories').select('id, name').eq('track_id', trackData.id);
          
          if (categories && categories.length > 0) {
            const relationalInserts = generatedQuestions.map(q => {
              const matchedCat = categories.find(c => c.name.toLowerCase().includes(q.topic?.toLowerCase()));
              return {
                category_id: matchedCat?.id || categories[0].id,
                type: q.type === 'mcq' ? 'mcq' : 'coding',
                question: q.question,
                options: q.options || [],
                correct_answer: String(q.correctAnswer),
                explanation: q.explanation || '',
                difficulty: q.difficulty || 'Medium',
                points: 1
              };
            });
            
            // Background insert (don't block the UI)
            supabase.from('assessment_questions').insert(relationalInserts).then(() => {
              console.log(`📊 Relational DB: ${relationalInserts.length} questions persisted to assessment_questions.`);
            });
          }
        }
        
        console.log(`📦 Updated high-performance cache for ${track}`);
      } catch (err) {
        console.error("Database persistence failed:", err.message);
      }
    }

    return generatedQuestions;

  } catch (err) {
    console.warn(`⚠️ Fresh generation failed for ${track}. Error: ${err.message}. Checking cache...`);
    
    // 2. FALLBACK TO CACHE
    if (!isTargeted) {
      try {
        const { data: cached, error: cacheError } = await supabase
          .from('cached_assessments')
          .select('questions')
          .eq('track', track)
          .maybeSingle();

        if (cached && !cacheError) {
          console.log(`✅ Cache Fallback Hit for ${track}.`);
          return cached.questions;
        }
      } catch (cacheErr) {
        console.error("Cache fallback also failed:", cacheErr.message);
      }
    }

    console.error("Batch generation and cache both failed:", err);
    throw new Error("Assessment service temporarily unavailable. Please try again in a moment.");
  }
}

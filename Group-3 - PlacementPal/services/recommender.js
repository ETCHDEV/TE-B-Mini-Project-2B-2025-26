import { callNvidiaAPI, safeParse } from './llm.js';
import { getSyllabus } from './syllabus.js';

/**
 * Recommender Service - Generates Adaptive, Dynamic Learning Paths
 */
export async function getRecommendations(track, level, classification) {
  const syllabus = getSyllabus(track);
  
  const systemPrompt = "You are a career coach and technical mentor. Return ONLY JSON.";
  const userPrompt = `
Adaptive Learning Data for ${track}:
- Current Level: ${level}
- Strong Topics (Mastered): ${classification.strong?.join(", ") || "None"}
- Weak Topics (Gaps): ${classification.weak?.join(", ") || "None"}
- Unknown Topics (Future): ${classification.unknown?.join(", ") || "None"}

Full Syllabus (Source of Truth):
${JSON.stringify(syllabus, null, 2)}

Task: Create a DYNAMIC adaptive roadmap based ONLY on Weak and Unknown topics.
STRICT RULES:
1. Skip "Strong" topics entirely in the roadmap (mention them in advice only).
2. Dynamic Timeline: Do NOT force 4 weeks. If few gaps, use 1-2 weeks. If many, use 4-8 weeks.
3. Logical Flow: Address "Weak" topics first (immediate gaps), then "Unknown" topics.

Return ONLY this JSON schema:
{
  "recommendations": ["string", "string"],
  "weeklyPlan": [
    { 
      "week": number, 
      "title": "string",
      "focus": "string", 
      "tasks": ["string", "string"],
      "resourceHint": "string",
      "topics": ["string"]
    }
  ],
  "overallAdvice": "string"
}`;

  const content = await callNvidiaAPI(systemPrompt, userPrompt, true);
  return safeParse(content);
}

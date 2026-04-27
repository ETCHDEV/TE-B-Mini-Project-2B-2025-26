import { callEvaluationAPI, safeParse } from './llm.js';

/**
 * Evaluator Service - Unified verification engine
 */

export async function verifyResponses(responses, questions) {
  // 1. Initial Local Processing (MCQs + Exact Matches)
  const results = responses.map((response, i) => {
    const q = questions.find(question => question.questionNumber === response.questionNumber);
    if (!q) return { index: i, isCorrect: false, score: 0, status: 'error' };

    const userAns = String(response.answer || "").trim().toLowerCase();
    const correctAns = String(q.correctAnswer || "").trim().toLowerCase();

    // Fast path: MCQ or Exact Match
    if (q.type === 'mcq' || userAns === correctAns) {
      const isCorrect = userAns === correctAns;
      return {
        index: i,
        isCorrect,
        score: isCorrect ? 10 : 0,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        status: 'done'
      };
    }

    // Needs AI evaluation
    return { index: i, question: q, response, status: 'pending' };
  });

  // 2. Batch AI Evaluation for Pending (Coding/Short Answer)
  const pending = results.filter(r => r.status === 'pending');
  if (pending.length > 0) {
    try {
      const sysPrompt = "You are a coding evaluator. Score 0-10. Return ONLY JSON array of { \"index\": number, \"score\": number, \"feedback\": \"string\" }.";
      const userPrompt = `Evaluate these ${pending.length} student answers against expected outputs:
      ${pending.map(p => `
      Item Index: ${p.index}
      Question: ${p.question.question}
      Expected: ${p.question.correctAnswer}
      Student: ${p.response.answer}
      `).join('\n---\n')}
      
      Return a JSON array of scores.`;

      const content = await callEvaluationAPI(sysPrompt, userPrompt, true);
      const aiScores = safeParse(content);

      if (Array.isArray(aiScores)) {
        aiScores.forEach(s => {
          const item = results[s.index];
          if (item) {
            item.score = s.score || 0;
            item.isCorrect = item.score >= 7;
            item.explanation = s.feedback || item.question.explanation;
            item.correctAnswer = item.question.correctAnswer;
            item.status = 'done';
          }
        });
      }
    } catch (e) {
      console.error("Batch Eval Error:", e);
    }
  }

  // Final Cleanup
  const processedResults = results.map(r => ({
    index: r.index,
    isCorrect: r.isCorrect || false,
    score: r.score || 0,
    correctAnswer: r.correctAnswer || "",
    explanation: r.explanation || ""
  }));

  const correctCount = processedResults.filter(r => r.isCorrect).length;
  const gaps = processedResults.filter(r => !r.isCorrect).map(r => questions[r.index]?.topic).filter(Boolean);

  return {
    results: processedResults,
    correctCount,
    totalQuestions: questions.length,
    gaps: [...new Set(gaps)]
  };
}

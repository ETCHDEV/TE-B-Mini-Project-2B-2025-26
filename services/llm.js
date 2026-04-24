import dotenv from 'dotenv';
import pLimit from 'p-limit';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Global Concurrency Limit (Max 1 parallel API call for reliable sequential processing)
const limit = pLimit(1);

/**
 * Call Groq API with Retry & Concurrency Control
 */
export async function callGroqAPI(systemPrompt, userPrompt, jsonMode = false, retries = 3) {
  return limit(async () => {
    return callWithRetry(systemPrompt, userPrompt, jsonMode, retries);
  });
}

// Aliases for backward compatibility
export const callNvidiaAPI = callGroqAPI;
export const callEvaluationAPI = callGroqAPI;
export const callCohereAPI = callGroqAPI;

/**
 * Call local Ollama API for faster/cheaper evaluation (Now Fallback)
 */
export async function callOllamaAPI(systemPrompt, userPrompt, jsonMode = false) {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: userPrompt,
        system: systemPrompt || "You are a helpful assistant.",
        stream: false,
        format: jsonMode ? "json" : undefined,
        options: { temperature: 0.3, num_predict: 512 }
      })
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("❌ Ollama Call Failed:", error.message);
    throw error;
  }
}

async function callWithRetry(systemPrompt, userPrompt, jsonMode, retries, delay = 5000) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: userPrompt });

    const payload = {
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.5,
      max_tokens: 4096
    };

    if (jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429 && retries > 0) {
      const jitter = Math.random() * 2000;
      const totalDelay = delay + jitter;
      console.warn(`⚠️ Groq Rate limited (429). Retrying in ${(totalDelay / 1000).toFixed(1)}s... (${retries} left)`);
      await new Promise(res => setTimeout(res, totalDelay));
      return callWithRetry(systemPrompt, userPrompt, jsonMode, retries - 1, delay * 2);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq API returned empty content");
    return content;
  } catch (error) {
    if (retries > 0) {
      const jitter = Math.random() * 2000;
      const totalDelay = delay + jitter;
      console.warn(`⚠️ Groq API Error: ${error.message}. Retrying in ${(totalDelay / 1000).toFixed(1)}s...`);
      await new Promise(res => setTimeout(res, totalDelay));
      return callWithRetry(systemPrompt, userPrompt, jsonMode, retries - 1, delay * 2);
    }

    // FINAL FALLBACK TO OLLAMA
    console.warn("⚠️ Groq failed after retries. Falling back to Ollama...");
    try {
      return await callOllamaAPI(systemPrompt, userPrompt, jsonMode);
    } catch (ollamaErr) {
      console.error(`❌ Complete LLM Failure: ${ollamaErr.message}`);
      throw error;
    }
  }
}

/**
 * Robust JSON parser for LLM responses
 */
export function safeParse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      if (match) return JSON.parse(match[1].trim());

      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const lastBrace = text.lastIndexOf('}');
      const lastBracket = text.lastIndexOf(']');

      let start = -1;
      let end = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = lastBrace;
      } else if (firstBracket !== -1) {
        start = firstBracket;
        end = lastBracket;
      }

      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1));
      }
    } catch (innerE) {
      console.error("Failed to parse LLM JSON:", text);
      return {};
    }
  }
  return {};
}

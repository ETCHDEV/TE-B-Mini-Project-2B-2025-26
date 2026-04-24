import { callEvaluationAPI, safeParse } from './llm.js';
import { supabase } from '../supabase_client.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * ELITE RESOURCE FINDER (V3)
 * Production-ready recommendation engine with real APIs, caching, ranking, and diversity.
 */

const CACHE_TTL_HOT = 3 * 24 * 60 * 60 * 1000; // 3 days for hot topics
const CACHE_TTL_COLD = 7 * 24 * 60 * 60 * 1000; // 7 days for others
const API_TIMEOUT = 10000; // 10s parallel fetch timeout

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

const CURATED_RESOURCES = {
  "time complexity": [
    { title: "Big O Notation Explained", platform: "YouTube", url: "https://www.youtube.com/watch?v=v4cd1O4zkGw", type: "video", difficulty: "Beginner", duration: "10m" },
    { title: "Big O Analysis Guide", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/news/big-o-notation-explained-with-examples/", type: "article", difficulty: "Beginner" }
  ],
  "arrays": [
    { title: "Arrays & Dynamic Arrays", platform: "YouTube", url: "https://www.youtube.com/watch?v=9_p_H6vOayQ", type: "video", difficulty: "Beginner", duration: "15m" },
    { title: "MDN Array Reference", platform: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", type: "article", difficulty: "Intermediate" }
  ],
  "sorting": [
    { title: "Sorting Algorithms Guide", platform: "YouTube", url: "https://www.youtube.com/watch?v=kPRA0W1kECg", type: "video", difficulty: "Intermediate" }
  ],
  "greedy algorithms": [
    { title: "Greedy Algorithms for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=HzeK7g8cD0Y", type: "video", difficulty: "Beginner" }
  ]
};

/**
 * Normalizes topic names for consistent matching
 */
function normalizeTopic(topic) {
  return topic ? topic.toLowerCase().trim() : "";
}

/**
 * Main Entry Point: Finds resources with Cold-Start + Stale-While-Revalidate UX
 */
export async function findResources(topic, level = "Beginner") {
  const normTopic = normalizeTopic(topic);
  if (!normTopic) return [];

  // 1. COLD-START UX: Return curated contents immediately if available
  const curated = CURATED_RESOURCES[normTopic] || [];
  
  // 2. CHECK CACHE (Partitioned by topic + level)
  const cached = await getCache(normTopic, level);
  
  if (cached && !isStale(cached)) {
    return mergeAndPrioritize(curated, cached.resources);
  }

  // 3. ASYNC REFRESH (Background or Foreground if no cache)
  const refreshPromise = refreshDiscovery(normTopic, level);
  
  if (curated.length > 0 || (cached && cached.resources.length > 0)) {
    refreshPromise.catch(console.error); // Background update
    return mergeAndPrioritize(curated, cached?.resources || []);
  }

  // Hard miss: Wait for fresh results
  const freshResources = await refreshPromise;
  return mergeAndPrioritize(curated, freshResources);
}

/**
 * Orchestrates API Fetching + Ranking + Diversity
 */
async function refreshDiscovery(topic, level) {
  try {
    await supabase.rpc('increment_resource_search', { p_topic: topic, p_user_level: level });

    // Parallel API Fetch
    const results = await Promise.allSettled([
      fetchYouTube(topic, level),
      fetchGoogle(topic, level)
    ]);

    let allResources = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    console.log(`📊 [refreshDiscovery] For "${topic}": YouTube+Google returned ${allResources.length} resources`);

    // DIVERSITY FALLBACK: If we're missing types (Articles or Practices), use AI
    const types = new Set(allResources.map(r => r.type));
    console.log(`📊 [refreshDiscovery] Resource types found: ${Array.from(types).join(', ') || 'none'}`);
    
    if (!types.has('article') || !types.has('practice')) {
      console.log(`⚠️ [refreshDiscovery] Missing article or practice types. Calling AI fallback...`);
      const aiResults = await fetchAIRecommendations(topic, level);
      console.log(`📊 [refreshDiscovery] AI fallback returned ${aiResults.length} resources`);
      allResources = [...allResources, ...aiResults];
    }

    const processed = processResources(allResources, topic, level);
    console.log(`✅ [refreshDiscovery] Final processed resources for "${topic}": ${processed.length} items`);
    console.log(`   Resources:`, processed.map(r => ({ title: r.title, platform: r.platform, type: r.type })));
    
    if (processed.length > 0) {
      await saveCache(topic, level, processed);
      console.log(`💾 [refreshDiscovery] Saved ${processed.length} resources to cache for "${topic}"`);
    }

    return processed;
  } catch (err) {
    console.error("❌ Discovery Refresh Failed:", err);
    return [];
  }
}

/**
 * 🎥 YouTube API Provider
 */
async function fetchYouTube(topic, level) {
  if (!YOUTUBE_API_KEY) return [];
  const query = `${topic} ${level} complete tutorial education`;

  try {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 5,
        key: YOUTUBE_API_KEY
      },
      timeout: API_TIMEOUT
    });

    return (res.data.items || []).map(item => ({
      title: item.snippet.title,
      platform: "YouTube",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail_url: item.snippet.thumbnails.medium.url,
      type: "video",
      difficulty: level,
      views: 100000,
      rating: 4.8
    }));
  } catch (err) {
    console.warn("YouTube Fetch Failed (Switching to fallback):", err.message);
    return [];
  }
}

/**
 * 📖 Google Custom Search API Provider
 */
async function fetchGoogle(topic, level) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];
  const query = `${topic} ${level} official documentation guide -files -pdf`;

  try {
    const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: query
      },
      timeout: API_TIMEOUT
    });

    return (res.data.items || []).map(item => ({
      title: item.title,
      platform: "Article",
      url: item.link,
      type: "article",
      difficulty: level,
      rating: 4.5
    }));
  } catch (err) {
    console.warn("Google Fetch Failed (Switching to fallback):", err.message);
    return [];
  }
}

/**
 * 🧠 AI Fallback for Diversity (Practice/Articles)
 */
async function fetchAIRecommendations(topic, level) {
  try {
    const sysPrompt = "Return ONLY verified, high-authority practice and article links for the given topic. Return ONLY JSON object with 'resources' array.";
    const userPrompt = `Find 3 high-quality articles and 3 verified coding practice problems for: "${topic}" (${level}). 
    For practice problems: Prioritize LeetCode and HackerRank.
    For articles: Prioritize MDN Web Docs, freeCodeCamp, GeeksforGeeks, and Towards Data Science.
    STRICT: Ensure the URLs are valid and direct.
    JSON Schema: { "resources": [{ "title": string, "url": string, "platform": string, "type": "article" | "practice", "difficulty": string }] }`;

    console.log(`🤖 [AI Fallback] Fetching resources for topic: "${topic}" (${level})`);
    const content = await callEvaluationAPI(sysPrompt, userPrompt, true);
    console.log(`🤖 [AI Fallback] Raw response from LLM:`, content.substring(0, 200));
    
    const parsed = safeParse(content);
    console.log(`🤖 [AI Fallback] Parsed JSON:`, JSON.stringify(parsed, null, 2));
    
    const resources = parsed.resources || [];
    console.log(`✅ [AI Fallback] Found ${resources.length} resources for "${topic}":`, resources.map(r => ({ title: r.title, type: r.type, url: r.url })));
    
    return resources;
  } catch (err) {
    console.error("❌ AI Fallback Failed:", err.message);
    return [];
  }
}

/**
 * Processors: Filtering, Ranking, Diversity
 */
function processResources(resources, topic, level) {
  const unique = [];
  const seenUrls = new Set();

  for (const res of resources) {
    if (!res.url || !res.url.startsWith("http") || seenUrls.has(res.url)) continue;
    seenUrls.add(res.url);
    unique.push({
      ...res,
      score: calculateScore(res, topic, level)
    });
  }

  const ranked = unique.sort((a, b) => b.score - a.score);

  // Elite Diversity (≥1 of each type)
  const videos = ranked.filter(r => r.type === 'video').slice(0, 2);
  const articles = ranked.filter(r => r.type === 'article' || r.type === 'course').slice(0, 2);
  const practices = ranked.filter(r => r.type === 'practice' || (r.type === 'article' && (r.url.includes('leetcode') || r.url.includes('hackerrank')))).slice(0, 2);

  const finalResults = [];
  if (videos[0]) finalResults.push(videos[0]);
  if (articles[0]) finalResults.push(articles[0]);
  if (practices[0]) finalResults.push(practices[0]);

  const remaining = ranked.filter(r => !finalResults.includes(r));
  while (finalResults.length < 5 && remaining.length > 0) {
    finalResults.push(remaining.shift());
  }

  return finalResults.slice(0, 5);
}

function calculateScore(res, topic, level) {
  const relevance = res.title.toLowerCase().includes(topic) ? 1 : 0.5;
  const diffMatch = res.difficulty === level ? 1 : 0.6;
  const popularity = res.views > 1000000 ? 1 : 0.7; // Weighted slightly
  const rating = res.rating || 0.8;
  const durationScore = res.duration ? 0.9 : 0.7;

  // Elite V3 Formula
  return (relevance * 0.35) + (diffMatch * 0.25) + (rating * 0.2) + (popularity * 0.15) + (durationScore * 0.05);
}

/**
 * DB WRAPPERS
 */
async function getCache(topic, level) {
  const { data } = await supabase
    .from('resource_cache')
    .select('*')
    .eq('topic', topic)
    .eq('user_level', level)
    .not('resources', 'eq', '[]')
    .single();
  return data;
}

async function saveCache(topic, level, resources) {
  await supabase
    .from('resource_cache')
    .upsert({
      topic,
      user_level: level,
      resources,
      source: 'Mixed',
      last_updated: new Date()
    });
}

function isStale(cache) {
  const ttl = cache.click_count > 10 ? CACHE_TTL_HOT : CACHE_TTL_COLD;
  return (Date.now() - new Date(cache.last_updated).getTime()) > ttl;
}

function mergeAndPrioritize(curated, discovered) {
  const all = [...curated, ...discovered];
  const seen = new Set();
  return all.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  }).slice(0, 5);
}

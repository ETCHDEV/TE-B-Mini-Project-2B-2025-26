import { supabase } from '../supabase_client.js'; // Assuming we create this or use existing

/**
 * RAG Service - Retrieve context for LLM grounding
 * @param {string} track - The domain track
 */
export async function getTrackContext(track) {
  try {
    const { data: skills, error } = await supabase
      .from('domain_skills')
      .select('skill')
      .eq('domain', track);

    if (error) throw error;
    
    if (!skills || skills.length === 0) {
      return `Domain: ${track}. Focus on core concepts and practical applications.`;
    }

    const skillList = skills.map(s => `- ${s.skill}`).join('\n');
    return `Domain: ${track}\nKey Skills to assess:\n${skillList}`;
  } catch (error) {
    console.warn(`RAG Warning: Could not fetch skills for ${track}. Using fallback context.`);
    return `Domain: ${track}. Focus on fundamental principles and standard industry practices.`;
  }
}

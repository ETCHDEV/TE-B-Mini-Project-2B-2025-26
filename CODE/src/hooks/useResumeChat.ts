import { useState, useCallback } from 'react';
import { ResumeAnalysis } from '@/lib/resumeScoring';

// Extended type that includes domain-based analysis fields
type ResumeAnalysisLike = ResumeAnalysis & { [key: string]: unknown };
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = 'http://localhost:3001/chat';

interface UseResumeChatProps {
  resumeAnalysis: ResumeAnalysis | null;
  username: string;
}

export const useResumeChat = ({ resumeAnalysis, username }: UseResumeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializeChat = useCallback((analysis: ResumeAnalysis, fileName: string) => {
    const initialMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: `Hello ${username}! 👋 I've analyzed your resume "${fileName}". 

📊 **Your Resume Score: ${analysis.overallScore}%**

Here's a quick breakdown:
• Skill Match: ${analysis.skillMatchScore}%
• Project Quality: ${analysis.projectQualityScore}%
• Experience: ${analysis.experienceScore}%

${analysis.recommendations.length > 0 ? `\n💡 **Top Recommendation:** ${analysis.recommendations[0]}` : ''}

Feel free to ask me anything about your resume, skill gaps, or how to improve your profile!`
    };
    setMessages([initialMessage]);
  }, [username]);

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Create context string from analysis results
      let analysisContext = "";
      if (resumeAnalysis) {
        analysisContext = `Analysis for ${username} (File: ${resumeAnalysis.fileName || 'Resume'})
        - Overall Score: ${resumeAnalysis.overallScore}%
        - Top Recommendations: ${resumeAnalysis.recommendations.slice(0, 3).join(", ")}
        - Skills Found: ${(resumeAnalysis as any).matchedSkills?.slice(0, 10).join(", ") || 'None'}
        - MISSING SKILLS: ${(resumeAnalysis as any).missingSkills?.slice(0, 10).join(", ") || 'None'}`;
      }

      // Format history simply for the small model
      const historySummary = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history: historySummary,
          context: analysisContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat server');
      }

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not generate a response.';

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: reply
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, resumeAnalysis, username, isLoading, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
    clearChat
  };
};

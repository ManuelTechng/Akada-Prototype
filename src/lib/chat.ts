import { supabase } from './supabase';
import { generateResponse, getAssistantResponse } from './gemini';

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  context?: string;
  timestamp: string;
  created_at: string;
}

/**
 * Enhanced AI chat assistance for Nigerian students using Gemini
 * Provides context-aware responses about international education
 */
export const createChatAssistance = async (
  userId: string,
  message: string,
  context?: string
): Promise<string> => {
  try {
    console.log('Chat: Creating Gemini AI assistance for user', userId);
    
    // Use Gemini with context if provided
    let response: string;
    
    if (context) {
      // Parse context for structured data
      const userContext = parseUserContext(context);
      response = await getAssistantResponse(message, context, undefined, userContext);
    } else {
      response = await generateResponse(message);
    }
    
    if (!response) {
      throw new Error('No response received from Gemini AI service');
    }

    // Log chat to Supabase for analytics and improvement
    try {
      await logChatInteraction(userId, message, response, context);
    } catch (logError) {
      console.error('Chat: Failed to log interaction:', logError);
      // Don't fail the chat if logging fails
    }

    console.log('Chat: Gemini AI assistance created successfully');
    return response;
  } catch (error) {
    console.error('Chat: Error creating AI assistance:', error);
    
    // Provide helpful fallback responses
    if (message.toLowerCase().includes('visa')) {
      return `I apologize, but I'm having trouble right now. For visa information, I recommend checking the official embassy websites for your target country. You can also visit the NYSC website for guidance on studying abroad as a Nigerian student.

Here are some key visa tips:
• Start applications 3-6 months early
• Ensure all documents are certified and translated
• Show strong financial proof (bank statements, scholarship letters)
• Prepare for potential interview questions
• Keep copies of all submitted documents

Please try asking me again in a few minutes!`;
    }
    
    if (message.toLowerCase().includes('scholarship')) {
      return `I'm currently experiencing issues, but here are some reliable scholarship resources for Nigerian students:
      
• **Commonwealth Scholarships** - For UK universities
• **Chevening Scholarships** - UK government scholarships
• **Fulbright Program** - For US universities
• **DAAD Scholarships** - Germany study opportunities
• **Canadian Commonwealth Scholarship Program**
• **Mastercard Foundation Scholars Program** - Various countries

**Application Tips:**
• Start applications 8-12 months early
• Focus on your impact and leadership potential
• Get strong recommendation letters
• Write compelling personal statements
• Meet all eligibility requirements

Please try asking me again in a few minutes!`;
    }
    
    return `I apologize, but I'm having trouble processing your request right now. Please try again in a few minutes, or feel free to browse our program search to find universities that match your interests.`;
  }
};

/**
 * Parse user context from string format
 */
const parseUserContext = (context: string) => {
  const userContext: any = {};
  
  // Extract education level
  const educationMatch = context.match(/Education Level: ([^,\n]+)/i);
  if (educationMatch) {
    userContext.educationLevel = educationMatch[1].trim();
  }
  
  // Extract field of study
  const fieldMatch = context.match(/studying ([^,\n]+)|Field of Study: ([^,\n]+)/i);
  if (fieldMatch) {
    userContext.fieldOfStudy = (fieldMatch[1] || fieldMatch[2]).trim();
  }
  
  // Extract budget
  const budgetMatch = context.match(/Budget: ₦?([0-9,]+)|budget_range[": ]+([0-9,]+)/i);
  if (budgetMatch) {
    const budgetStr = (budgetMatch[1] || budgetMatch[2]).replace(/,/g, '');
    userContext.budget = parseInt(budgetStr);
  }
  
  // Extract countries
  const countriesMatch = context.match(/Interested countries: ([^.\n]+)|countries[": ]+\[([^\]]+)\]/i);
  if (countriesMatch) {
    const countriesStr = countriesMatch[1] || countriesMatch[2];
    userContext.targetCountries = countriesStr.split(',').map(c => c.trim().replace(/["']/g, ''));
  }
  
  return userContext;
};

/**
 * Log chat interaction for analytics and improvement
 */
const logChatInteraction = async (
  userId: string,
  message: string,
  response: string,
  context?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_logs')
      .insert({
        user_id: userId,
        message: message,
        response: response,
        context: context,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Chat: Failed to log chat interaction:', error);
      throw error;
    }

    console.log('Chat: Interaction logged successfully');
  } catch (error) {
    console.error('Chat: Error logging chat interaction:', error);
    throw error;
  }
};

/**
 * Get chat history for a user
 */
export const getChatHistory = async (
  userId: string,
  limit: number = 50
): Promise<ChatMessage[]> => {
  try {
    console.log('Chat: Fetching chat history for user', userId);
    
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Chat: Error fetching chat history:', error);
      throw error;
    }

    console.log('Chat: Fetched', data?.length || 0, 'chat messages');
    return data || [];
  } catch (error) {
    console.error('Chat: Failed to get chat history:', error);
    throw error;
  }
};

/**
 * Get suggested questions for new users
 */
export const getSuggestedQuestions = (): string[] => {
  return [
    "How do I write a compelling statement of purpose for Canadian universities?",
    "What are the visa requirements for studying in the UK as a Nigerian?",
    "How much does it cost to study Computer Science in Germany in NGN?",
    "What scholarships are available for Nigerian engineering students?",
    "How do I convert my WAEC and JAMB results for US university applications?",
    "What's the best time to apply for Fall 2026 programs in Europe?",
    "How do I prepare for IELTS exam from Nigeria on a budget?",
    "What documents do I need for Australian university applications?",
    "How can I find affordable Master's programs with scholarships?",
    "What are the steps to get a student visa for studying in Canada?"
  ];
};

/**
 * Generate context-aware responses based on user profile and preferences
 */
export const createContextualResponse = async (
  userId: string,
  message: string,
  userProfile?: any,
  userPreferences?: any
): Promise<string> => {
  try {
    // Build context from user profile and preferences
    let context = '';
    
    if (userProfile) {
      context += `User Profile: ${userProfile.education_level || 'Not specified'} level student`;
      if (userProfile.field_of_study) {
        context += `, studying ${userProfile.field_of_study}`;
      }
      if (userProfile.current_university) {
        context += `, currently at ${userProfile.current_university}`;
      }
      if (userProfile.gpa) {
        context += `, GPA: ${userProfile.gpa}`;
      }
    }
    
    if (userPreferences) {
      context += `\nPreferences: `;
      if (userPreferences.goals) {
        context += `Goals: ${userPreferences.goals}. `;
      }
      if (userPreferences.budget_range) {
        context += `Budget: ₦${userPreferences.budget_range?.toLocaleString()} NGN. `;
      }
      if (userPreferences.countries) {
        context += `Interested countries: ${userPreferences.countries.join(', ')}.`;
      }
    }

    return await createChatAssistance(userId, message, context);
  } catch (error) {
    console.error('Chat: Error creating contextual response:', error);
    // Fallback to basic response
    return await createChatAssistance(userId, message);
  }
};

/**
 * Quick response for common questions
 */
export const getQuickResponse = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm Akada AI, your study abroad assistant. I'm here to help Nigerian students with international education. What would you like to know about studying abroad?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're very welcome! I'm glad I could help. Feel free to ask me anything else about studying abroad - whether it's about applications, visas, scholarships, or any other aspect of international education. Good luck with your studies! 🎓";
  }
  
  return null;
};

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const getAssistantResponse = async (message: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant helping students with international education applications. Provide helpful, accurate, and concise responses."
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error: any) {
    console.error('Error getting assistant response:', error);
    
    if (error?.status === 429) {
      return "I apologize, but I'm currently experiencing high demand. Please try again in a few minutes.";
    }
    
    if (error?.status === 401) {
      return "I apologize, but there seems to be an issue with the AI service configuration. Please contact support.";
    }
    
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
};
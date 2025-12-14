import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export interface UserContext {
  name: string
  educationLevel?: string
  fieldOfStudy?: string
  currentUniversity?: string
  studyPreferences?: {
    countries?: string[]
    maxTuition?: number
    programType?: string
  }
}

export async function generateResponse(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function analyzeDocument(content: string, type: 'sop' | 'cv'): Promise<string> {
  const analysisPrompt = `
    Analyze the following ${type.toUpperCase()} document and provide detailed feedback:
    
    ${content}
    
    Please provide:
    1. Overall assessment
    2. Strengths
    3. Areas for improvement
    4. Specific recommendations
    5. Grammar and style suggestions
  `;

  return generateResponse(analysisPrompt);
}

export async function getAssistantResponse(
  message: string, 
  context?: string, 
  systemPrompt?: string,
  userContext?: UserContext
): Promise<string> {
  let prompt = ''
  
  if (userContext) {
    prompt += `User Context: ${JSON.stringify(userContext)}\n\n`
  }
  
  if (systemPrompt) {
    prompt += `System: ${systemPrompt}\n\n`
  }
  
  prompt += context 
    ? `Context: ${context}\n\nUser: ${message}\n\nAssistant:`
    : `User: ${message}\n\nAssistant:`
  
  return generateResponse(prompt)
}

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  systemPrompt?: string,
  userContext?: UserContext
): Promise<string> {
  let prompt = ''
  
  if (userContext) {
    prompt += `User Context: ${JSON.stringify(userContext)}\n\n`
  }
  
  if (systemPrompt) {
    prompt += `System: ${systemPrompt}\n\n`
  }
  
  const conversation = messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n')
  
  prompt += conversation + '\n\nAssistant:'
  
  return generateResponse(prompt)
}

export async function generatePersonalizedGreeting(
  userContext: UserContext | string, 
  context?: string
): Promise<string> {
  const userName = typeof userContext === 'string' ? userContext : userContext.name
  const userContextStr = typeof userContext === 'object' ? JSON.stringify(userContext) : ''
  
  const prompt = `Generate a personalized greeting for ${userName}${userContextStr ? ` based on this user context: ${userContextStr}` : ''}${context ? ` and this context: ${context}` : ''}. Keep it friendly and encouraging for a study abroad assistant.`
  
  return generateResponse(prompt)
}

export { genAI };
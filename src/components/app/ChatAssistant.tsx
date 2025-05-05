import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { getAssistantResponse } from '../../lib/openai';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm your Akada AI assistant. How can I help with your international education journey today?",
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await getAssistantResponse(inputText);
      
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: response || "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 ${
                  message.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'bot' ? (
                    <Bot className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-white flex-shrink-0" />
                  )}
                  <span className={`text-xs ${message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {message.sender === 'bot' ? 'Akada AI' : 'You'} • {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className={`break-words ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {message.text}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Ask about programs, requirements, or applications..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isLoading || !inputText.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
            disabled={isLoading || !inputText.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <p className="text-xs text-gray-500 text-center">
            Try asking: "What scholarships am I eligible for?" or "Help me with my statement of purpose"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
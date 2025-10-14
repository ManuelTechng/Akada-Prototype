import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  Lightbulb,
  Target,
  Globe,
  Calculator,
  FileText,
  Search,
  Clock,
  Zap
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: {
    type: 'navigate' | 'search' | 'calculate'
    label: string
    data: any
  }[]
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  prompt: string
}

const AIAssistant: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)

  const quickActions: QuickAction[] = [
    {
      id: 'program-search',
      label: 'Find Programs',
      icon: <Search className="h-4 w-4" />,
      description: 'Get help finding programs that match your profile',
      prompt: 'I want to find study abroad programs that match my profile and preferences.'
    },
    {
      id: 'cost-planning',
      label: 'Cost Planning',
      icon: <Calculator className="h-4 w-4" />,
      description: 'Get guidance on budgeting and financial planning',
      prompt: 'Help me understand the costs of studying abroad and create a budget plan.'
    },
    {
      id: 'application-help',
      label: 'Application Guidance',
      icon: <FileText className="h-4 w-4" />,
      description: 'Get step-by-step application guidance',
      prompt: 'I need help with my study abroad applications. What are the key steps I should follow?'
    },
    {
      id: 'country-comparison',
      label: 'Compare Countries',
      icon: <Globe className="h-4 w-4" />,
      description: 'Compare different study destinations',
      prompt: 'Help me compare different countries for studying abroad. What are the pros and cons?'
    },
    {
      id: 'timeline-planning',
      label: 'Timeline Planning',
      icon: <Clock className="h-4 w-4" />,
      description: 'Create an application timeline',
      prompt: 'Help me create a timeline for my study abroad applications and preparation.'
    },
    {
      id: 'career-guidance',
      label: 'Career Impact',
      icon: <Target className="h-4 w-4" />,
      description: 'Understand career benefits of different programs',
      prompt: 'How will studying abroad impact my career? What should I consider when choosing a program?'
    }
  ]

  // Welcome message
  useEffect(() => {
    if (!conversationStarted) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your AI study abroad advisor. I'm here to help you navigate your journey to studying abroad. 

I can assist you with:
• Finding programs that match your profile
• Understanding costs and financial planning
• Application guidance and timelines
• Comparing countries and universities
• Career planning and program selection

What would you like to know about studying abroad?`,
        timestamp: new Date(),
        suggestions: [
          'Find programs for Computer Science',
          'What are the costs of studying in Canada?',
          'Help me with application timeline',
          'Compare studying in US vs Europe'
        ]
      }
      setMessages([welcomeMessage])
      setConversationStarted(true)
    }
  }, [profile?.full_name, conversationStarted])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date(),
        suggestions: generateSuggestions(content),
        actions: generateActions(content)
      }
      
      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 2000)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('program') && input.includes('find')) {
      return `Based on your profile, I can help you find the perfect programs! Here are some key considerations:

**For Computer Science programs:**
• Canada: University of Toronto, UBC - excellent for AI/ML
• US: MIT, Stanford - top-tier but competitive
• Germany: TU Munich - excellent and often tuition-free
• Netherlands: TU Delft - innovative programs

**Factors to consider:**
• Your GPA and test scores
• Budget and financial aid availability
• Program specializations
• Post-graduation work opportunities

Would you like me to help you search for specific programs or calculate costs for these options?`
    }
    
    if (input.includes('cost') || input.includes('budget')) {
      return `Let me break down the typical costs for studying abroad:

**Annual Costs (in NGN):**
• **Canada:** ₦30-50M (tuition + living)
• **US:** ₦40-80M (varies by state)
• **Germany:** ₦15-25M (low tuition, moderate living)
• **Netherlands:** ₦25-35M (EU rates for some programs)

**Hidden costs to consider:**
• Visa and application fees: ₦500K-1M
• Health insurance: ₦300K-500K/year
• Travel: ₦800K-1.5M annually
• Books and supplies: ₦200K-400K

**Money-saving tips:**
✅ Apply for scholarships early
✅ Consider countries with lower living costs
✅ Look for graduate assistantships
✅ Choose programs with internship opportunities

Would you like me to help you create a detailed budget or find scholarship opportunities?`
    }
    
    if (input.includes('application') || input.includes('timeline')) {
      return `Here's your personalized application timeline:

**12-18 months before:**
• Research programs and requirements
• Start preparing for standardized tests (GRE, IELTS, TOEFL)
• Begin drafting personal statements

**9-12 months before:**
• Take standardized tests
• Request recommendation letters
• Start scholarship applications

**6-9 months before:**
• Submit applications (most deadlines Dec-Feb)
• Apply for student visas
• Arrange financial documentation

**3-6 months before:**
• Receive admission decisions
• Accept offers and pay deposits
• Finalize visa applications
• Arrange accommodation

**1-3 months before:**
• Attend pre-departure briefings
• Book flights
• Get vaccinations if required

Would you like me to help you create a detailed timeline for specific programs or countries?`
    }
    
    return `That's a great question! I'd be happy to help you with that. Based on your profile and preferences, I can provide personalized guidance for your study abroad journey.

Let me know if you'd like me to:
• Find specific programs that match your background
• Calculate detailed costs for your preferred countries
• Create a step-by-step application timeline
• Compare different universities or countries
• Help with scholarship opportunities

What would be most helpful for you right now?`
  }

  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase()
    
    if (input.includes('program')) {
      return [
        'Show me Computer Science programs in Canada',
        'What are the admission requirements?',
        'Find programs with scholarships'
      ]
    }
    
    if (input.includes('cost')) {
      return [
        'Calculate costs for studying in Germany',
        'Find scholarship opportunities',
        'Help me create a budget plan'
      ]
    }
    
    return [
      'Tell me about studying in Canada',
      'What documents do I need?',
      'Help me choose between countries'
    ]
  }

  const generateActions = (userInput: string): Message['actions'] => {
    const input = userInput.toLowerCase()
    
    if (input.includes('program') && input.includes('find')) {
      return [
        {
          type: 'navigate',
          label: 'Search Programs',
          data: '/dashboard/search'
        },
        {
          type: 'search',
          label: 'Find CS Programs',
          data: { query: 'Computer Science', country: 'Canada' }
        }
      ]
    }
    
    if (input.includes('cost') || input.includes('budget')) {
      return [
        {
          type: 'calculate',
          label: 'Cost Calculator',
          data: '/dashboard/calculator'
        }
      ]
    }
    
    return []
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt)
  }

  const handleActionClick = (action: NonNullable<Message['actions']>[0]) => {
    if (action.type === 'navigate' || action.type === 'calculate') {
      navigate(action.data)
    } else if (action.type === 'search') {
      navigate('/dashboard/search', { state: action.data })
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">AI Study Abroad Advisor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Powered by advanced AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([])
              setConversationStarted(false)
            }}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick actions to get started:</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    {action.icon}
                  </span>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{action.label}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              {/* Message Content */}
              <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {/* Message Actions */}
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {/* Action Buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 dark:text-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 dark:text-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:text-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              placeholder="Ask me anything about studying abroad..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              disabled={isTyping}
            />
            <button
              onClick={() => setIsListening(!isListening)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                isListening 
                  ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          AI responses are for guidance only. Always verify information with official sources.
        </p>
      </div>
    </div>
  )
}

export default AIAssistant 
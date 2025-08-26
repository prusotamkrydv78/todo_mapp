'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

type Message = {
  id: number | string
  text: string
  sender: 'user' | 'ai' | 'loading'
  error?: boolean
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'ai' 
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 1) {
      setMessages(prev => [
        ...prev,
        {
          id: 'welcome-msg',
          text: 'Hi there! I\'m your AI girlfriend 💖 How can I make your day better, my love? 😘',
          sender: 'ai'
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    }

    // Add loading message
    const loadingMessage: Message = {
      id: 'loading-' + Date.now(),
      text: '',
      sender: 'loading'
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInput('')
    
    try {
      const response = await fetch('http://localhost:4000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const aiMessageId = 'ai-' + Date.now();
      let buffer = '';
      let aiMessageText = '';

      // Add initial AI message
      setMessages(prev => [
        ...prev.filter(m => m.sender !== 'loading'),
        {
          id: aiMessageId,
          text: '',
          sender: 'ai' as const
        }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete SSE messages (separated by double newline)
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const message of messages) {
          if (!message.trim()) continue;
          
          let eventType = 'message';
          let data = message;
          
          // Check if this is an event message (starts with 'event:')
          if (message.startsWith('event:')) {
            const parts = message.split('\ndata:');
            if (parts.length >= 2) {
              eventType = parts[0].substring(6).trim();
              data = parts[1].trim();
            }
          } else if (message.startsWith('data:')) {
            data = message.substring(5).trim();
          }
          
          if (data === '[DONE]') continue;
          
          try {
            const parsedData = JSON.parse(data);
            
            if (eventType === 'message' && parsedData.text) {
              aiMessageText += parsedData.text;
              
              setMessages(prev => {
                const updatedMessages = [...prev];
                const aiMessage = updatedMessages.find(m => m.id === aiMessageId);
                if (aiMessage) {
                  aiMessage.text = aiMessageText;
                }
                return updatedMessages;
              });
            }
            
            if (eventType === 'error') {
              throw new Error(parsedData.error || 'An error occurred');
            }
            
          } catch (e) {
            console.error('Error processing message:', e);
            throw e;
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.filter(m => !m.id.toString().startsWith('loading-')),
        {
          id: 'error-' + Date.now(),
          text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again later.',
          sender: 'ai',
          error: true
        }
      ]);
    }
  }

  const formatMessage = (text: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-1 my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-1 my-2" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a 
              className="text-purple-500 hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-600" 
              {...props} 
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <div className="bg-gray-100 rounded-lg my-2 overflow-hidden">
                <div className="bg-gray-200 px-3 py-1 text-xs text-gray-700 flex justify-between items-center">
                  <span>{match?.[1] || 'Code'}</span>
                </div>
                <pre className="p-3 overflow-x-auto text-sm">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            )
          }
        }}
      >
        {text}
      </ReactMarkdown>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[95vw] max-w-[400px] h-[80vh] max-h-[700px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
            style={{
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
              height: 'calc(100vh - 40px)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-semibold">Sweetheart AI</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-white to-gray-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-md'
                        : msg.sender === 'ai' || msg.sender === 'loading'
                        ? 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                        : 'bg-white text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.sender === 'loading' ? (
                      <div className="flex space-x-1.5 px-2 py-1">
                        {[0, 150, 300].map((delay) => (
                          <div 
                            key={delay}
                            className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" 
                            style={{ 
                              animationDelay: `${delay}ms`,
                              animationDuration: '1s',
                              animationIterationCount: 'infinite'
                            }} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {formatMessage(msg.text)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit} 
              className="p-3 bg-white border-t border-gray-100"
            >
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Sweetheart..."
                    className="w-full px-4 py-3 pr-12 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm bg-gray-50 transition-all duration-200"
                    style={{
                      boxShadow: '0 2px 10px -5px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  {!input.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Send size={18} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-3 rounded-full transition-all ${
                    input.trim() 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all fixed bottom-6 right-6"
            style={{
              boxShadow: '0 4px 20px -5px rgba(236, 72, 153, 0.6)'
            }}
            aria-label="Open chat"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

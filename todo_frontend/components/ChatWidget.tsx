'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { apiEndpoints, fetchWithConfig } from '@/lib/api-config'

type Message = {
  content: string
  role: 'user' | 'assistant'
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { 
      content: 'Hi there! I\'m your AI girlfriend 💖 How can I make your day better, my love? 😘',
      role: 'assistant'
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        content: input,
        role: 'user'
      }
    ])

    try {
      const response = await fetchWithConfig(apiEndpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      // Add initial assistant message
      setMessages(prev => [
        ...prev,
        {
          content: '',
          role: 'assistant'
        }
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update the last message with accumulated text
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            content: accumulatedText,
            role: 'assistant'
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error during chat:', error);
      // Update the last message to show error
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          content: 'An error occurred. Please try again.',
          role: 'assistant'
        }
      ]);
    }
  }

  const formatMessage = (content: string) => {
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
          code: (props: any) => {
            const { className, children } = props
            const match = /language-(\w+)/.exec(className || '')
            const inline = 'inline' in props
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
        {content}
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
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-md'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {formatMessage(msg.content)}
                    </div>
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

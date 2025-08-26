'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'


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
      text: 'Hello! I\'m your AI assistant. How can I help you today?\n\nI can help with:\n- Answering questions\n- Writing and debugging code\n- Explaining concepts\n- And much more!\n\n```javascript\n// Example code block\nfunction hello() {\n  console.log("Hello, world!");\n}\n```', 
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
      sender: 'loading',
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
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
            
            // Handle other event types if needed
            if (eventType === 'done') {
              // Clean up or handle completion if needed
              break;
            }
            
            if (eventType === 'error') {
              throw new Error(parsedData.error || 'An error occurred');
            }
            
          } catch (e) {
            console.error('Error processing message:', e);
            throw e; // Re-throw to be caught by the outer catch
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

  const handleRetry = async () => {
    const lastUserMessage = messages.find(m => m.sender === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.filter(m => !m.error));
      await handleSubmit(lastUserMessage.text);
    }
  };

  const formatMessage = (text: string) => {
    return (
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const [copied, setCopied] = useState(false)

            const copyToClipboard = (code: string) => {
              navigator.clipboard.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }

            return (
              <div className="relative my-2 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center bg-gray-800 text-gray-300 text-xs px-4 py-1">
                  <span>{match?.[1] || 'code'}</span>
                  <button 
                    onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.9em',
                    lineHeight: '1.5',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            )
          },
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
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-1 my-2 text-gray-600 dark:text-gray-300"
              {...props} 
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    )
  }

  const renderMessageContent = (message: Message) => {
    if (message.sender === 'loading') {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )
    }
    return formatMessage(message.text)
  }

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')
    if (lastUserMessage) {
      setMessages(prev => [
        ...prev.filter(m => !m.error),
        { ...lastUserMessage, id: Date.now() },
        { id: 'loading-' + Date.now(), text: '', sender: 'loading' as const }
      ])
    }
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
                        : msg.sender === 'ai'
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
                    {msg.error && (
                      <button 
                        onClick={handleRetry}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        Retry message
                      </button>
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
'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  id: number | string
  text: string
  sender: 'user' | 'ai' | 'loading'
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: 'Hello! How can I help you today?', sender: 'ai' }
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
      text: 'Thinking...',
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
        body: JSON.stringify({ message: input, stream: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      const messageId = Date.now();

      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0].delta.content) {
                responseText += parsed.choices[0].delta.content;
                
                // Update message with streaming content
                setMessages(prev => {
                  const existingMessageIndex = prev.findIndex(m => m.id === messageId);
                  
                  if (existingMessageIndex >= 0) {
                    // Update existing message
                    const newMessages = [...prev];
                    newMessages[existingMessageIndex] = {
                      ...newMessages[existingMessageIndex],
                      text: responseText,
                    };
                    return newMessages;
                  } else {
                    // Add new message
                    return [
                      ...prev,
                      {
                        id: messageId,
                        text: responseText,
                        sender: 'ai',
                      },
                    ];
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Remove loading message and show error
      setMessages(prev => [
        ...prev.filter(m => m.id !== loadingMessage.id),
        {
          id: 'error-' + Date.now(),
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'ai',
        },
      ]);
    }
  }

  return (
    <>
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          aria-label="Open chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
        </motion.button>
      ) : (
        <AnimatePresence>
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-0"
            />
            
            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col rounded-t-2xl bg-white/95 backdrop-blur-lg shadow-2xl dark:bg-gray-800/95 sm:bottom-6 sm:right-4 sm:h-[500px] sm:w-96 sm:rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
                            message.sender === 'user'
                              ? 'rounded-br-none bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                              : 'rounded-bl-none bg-gray-100 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200'
                          }`}
                        >
                          {message.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>
              <form 
                onSubmit={handleSubmit} 
                className="border-t border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full rounded-xl border-0 bg-gray-100 py-3 pl-4 pr-12 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className={`absolute bottom-2 right-2 rounded-full p-2 transition-colors ${
                        input.trim()
                          ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                          : 'bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                      }`}
                      aria-label="Send message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
        </AnimatePresence>
      )}
    </>
  )
}
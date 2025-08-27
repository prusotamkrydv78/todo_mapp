'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Copy, Check, RotateCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { CSSProperties } from 'react'

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
      text: "Hi love 💕 I'm your little AI angel, always here for you 🤗✨",
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
      const response = await fetch('https://ex-server-ten.vercel.app/api/chat/stream', {
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
                  style={vscDarkPlus as any} // ✅ cast to any to avoid type errors
                  language={match?.[1] || 'text'}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.9em',
                    lineHeight: '1.5',
                  }}
                  {...(props as any)} // ✅ cast props so TS doesn’t complain
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            )
          }
          ,
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
      // Trigger message sending logic here
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
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base ${message.sender === 'user'
                              ? 'rounded-br-none bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                              : 'rounded-bl-none bg-gray-100 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200'
                            }`}
                        >
                          {message.error ? (
                            <div className="text-red-500">
                              {message.text}
                              <button
                                onClick={retryLastMessage}
                                className="ml-2 text-sm text-red-400 hover:text-red-300 flex items-center"
                              >
                                <RotateCw className="w-3.5 h-3.5 mr-1" />
                                Retry
                              </button>
                            </div>
                          ) : (
                            renderMessageContent(message)
                          )}
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
                      className={`absolute bottom-2 right-2 rounded-full p-2 transition-colors ${input.trim()
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
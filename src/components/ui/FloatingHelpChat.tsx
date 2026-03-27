'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageCircleQuestion, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  'Comment creer un Business Plan ?',
  'Comment exporter en PDF ?',
  'Quels templates sont disponibles ?',
  'Comment collaborer avec mon equipe ?',
]

export function FloatingHelpChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/help-chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestion = (question: string) => {
    if (isLoading) return
    sendMessage({ text: question })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="floating-help-btn"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(27, 79, 216, 0.4)',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: 9998,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(27, 79, 216, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(27, 79, 216, 0.4)'
        }}
        aria-label="Ouvrir l'assistant d'aide"
      >
        <MessageCircleQuestion size={24} color="#fff" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            height: 520,
            maxHeight: 'calc(100dvh - 100px)',
            background: 'var(--surface)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'chatSlideUp 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  Assistant EETRA
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.75)' }}>
                  Aide et support
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              aria-label="Fermer le chat"
            >
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'var(--accentS)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={28} color="var(--accent)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    Bienvenue !
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', maxWidth: 260 }}>
                    Posez vos questions sur EETRA et je vous aiderai.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 }}>
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(q)}
                      disabled={isLoading}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--text2)',
                        textAlign: 'left',
                        transition: 'border-color 0.15s, background 0.15s',
                        opacity: isLoading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.borderColor = 'var(--accent)'
                          e.currentTarget.style.background = 'var(--accentS)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--bg2)'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = message.role === 'user'
                  return (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        gap: 10,
                        flexDirection: isUser ? 'row-reverse' : 'row',
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isUser ? 'var(--accentS)' : 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isUser ? (
                          <User size={14} color="var(--accent)" />
                        ) : (
                          <Bot size={14} color="#fff" />
                        )}
                      </div>
                      <div
                        style={{
                          maxWidth: '80%',
                          padding: '10px 14px',
                          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isUser ? 'var(--accent)' : 'var(--bg2)',
                          color: isUser ? '#fff' : 'var(--text)',
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        {message.parts.map((part, index) => {
                          if (part.type === 'text') {
                            return <span key={index}>{part.text}</span>
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )
                })}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={14} color="#fff" />
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '14px 14px 14px 4px',
                        background: 'var(--bg2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Loader2 size={14} color="var(--text3)" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>Reflexion...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              background: 'var(--bg)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                fontSize: 13,
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg3)',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              aria-label="Envoyer"
            >
              {isLoading ? (
                <Loader2 size={18} color="var(--text4)" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={18} color={input.trim() ? '#fff' : 'var(--text4)'} />
              )}
            </button>
          </form>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}

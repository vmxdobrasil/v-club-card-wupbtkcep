import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { createLead } from '@/services/leads'
import { toast } from 'sonner'

export function AIWidget({ companyId, catalogId }: { companyId: string; catalogId: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Hi! I am your AI sales assistant. How can I help you find what you need today?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [leadOpen, setLeadOpen] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', contact: '', notes: '' })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, company_id: companyId, history: messages }),
      })

      if (!response.ok) throw new Error('Network response was not ok')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMsg = ''

      setMessages([...newMessages, { role: 'assistant', content: '' }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  assistantMsg += content
                  setMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1].content = assistantMsg
                    return updated
                  })
                }
              } catch {
                /* intentionally ignored */
              }
            }
          }
        }
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSubmit = async () => {
    try {
      await createLead({ ...leadForm, company_id: companyId, catalog_id: catalogId })
      toast.success('Interest registered! We will contact you soon.')
      setLeadOpen(false)
      setLeadForm({ name: '', contact: '', notes: '' })
    } catch (e) {
      toast.error('Failed to submit form.')
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {open && (
          <div className="bg-white border shadow-2xl rounded-2xl w-[90vw] sm:w-[380px] h-[500px] flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-full text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">AI Assistant</h3>
                  <span className="text-xs text-slate-300">Online</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-slate-800 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4"
              ref={scrollRef}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                        : 'bg-white border text-gray-800 rounded-2xl rounded-bl-sm whitespace-pre-wrap'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-500 italic flex items-center gap-2">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border-transparent focus-visible:ring-primary focus-visible:bg-white transition-all"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="shrink-0 rounded-full"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </Button>
              </div>
              <div className="text-center">
                <button
                  onClick={() => setLeadOpen(true)}
                  className="text-xs font-medium text-slate-500 hover:text-primary transition-colors flex items-center justify-center w-full gap-1.5 p-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Interested? Leave your contact
                </button>
              </div>
            </div>
          </div>
        )}

        {!open && (
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300"
            onClick={() => setOpen(true)}
          >
            <Bot className="w-6 h-6" />
          </Button>
        )}
      </div>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              Leave your details and we will reach out to you with more information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact</label>
              <Input
                value={leadForm.contact}
                onChange={(e) => setLeadForm({ ...leadForm, contact: e.target.value })}
                placeholder="WhatsApp number or Email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What are you interested in?</label>
              <Input
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLeadSubmit} disabled={!leadForm.name || !leadForm.contact}>
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

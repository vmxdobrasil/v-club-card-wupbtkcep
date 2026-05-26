import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getCatalogBySlug, getCatalogItems, Catalog, CatalogItem } from '@/services/catalogs'
import { createLead, updateLead } from '@/services/leads'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, MessageCircle, X, Send, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PublicCatalogPage() {
  const { slug } = useParams<{ slug: string }>()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const [chatOpen, setChatOpen] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    {
      role: 'ai',
      text: 'Olá! Sou seu assistente virtual. Para um melhor atendimento, qual é o seu nome e número de WhatsApp?',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (slug) {
      getCatalogBySlug(slug)
        .then(async (cat) => {
          setCatalog(cat)
          const itms = await getCatalogItems(cat.id)
          setItems(itms)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [slug])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, chatOpen])

  const handleSend = async () => {
    if (!inputValue.trim()) return
    const newMsgs = [...messages, { role: 'user' as const, text: inputValue }]
    setMessages(newMsgs)
    setInputValue('')

    if (!leadId && catalog) {
      try {
        const lead = await createLead({
          catalog_id: catalog.id,
          source: 'AI Sales Agent',
          interaction_history: newMsgs,
          name: 'Novo Lead',
          contact_info: inputValue,
        })
        setLeadId(lead.id)
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            {
              role: 'ai',
              text: 'Obrigado! Como posso ajudar você a encontrar os melhores produtos hoje?',
            },
          ])
        }, 600)
      } catch (err) {
        console.error(err)
      }
    } else if (leadId) {
      try {
        await updateLead(leadId, { interaction_history: newMsgs })
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            {
              role: 'ai',
              text: 'Entendi. Nossos especialistas analisarão sua mensagem e entrarão em contato em breve.',
            },
          ])
        }, 1000)
      } catch {
        /* intentionally ignored */
      }
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )
  if (!catalog)
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-xl font-medium text-muted-foreground">Catálogo não encontrado.</div>
      </div>
    )

  return (
    <div className="min-h-screen bg-muted/10 pb-24">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{catalog.name}</h1>
              <p className="text-xs text-muted-foreground">{catalog.expand?.company_id?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const p = item.expand?.product_id
            if (!p) return null
            const imgUrl = p.image
              ? pb.files.getUrl(p, p.image)
              : `https://img.usecurling.com/p/400/300?q=${encodeURIComponent(p.name)}`
            return (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-none shadow-sm"
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={imgUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
                    {p.description || 'Nenhuma descrição'}
                  </p>
                  <div className="mt-4 font-bold text-lg text-primary">
                    R$ {p.price?.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Este catálogo ainda não possui produtos.
          </div>
        )}
      </main>

      {/* Floating Chat Agent */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <div className="bg-background border shadow-2xl rounded-2xl w-[350px] max-h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Assistente Virtual</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                onClick={() => setChatOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px] bg-muted/10"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none',
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex space-x-2"
              >
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-2xl hover:scale-105 transition-transform"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import pb from '@/lib/pocketbase/client'

export default function PublicCatalogPage() {
  const { slug } = useParams()
  const [catalog, setCatalog] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (slug) {
      pb.collection('catalogs')
        .getOne(slug, { expand: 'company_id,products' })
        .then((res) => setCatalog(res))
        .catch((err) => console.error(err))
    }
  }, [slug])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const streamChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !catalog?.company_id) return

    const userMsg = chatInput
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsLoadingChat(true)

    try {
      const baseUrl = import.meta.env.VITE_POCKETBASE_URL.replace(/\/+$/, '')
      const res = await fetch(`${baseUrl}/backend/v1/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          company_id: catalog.company_id,
          history: chatMessages,
        }),
      })

      if (!res.body) throw new Error('No body in response')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              const content = data.choices[0]?.delta?.content || ''
              setChatMessages((prev) => {
                const last = prev[prev.length - 1]
                return [...prev.slice(0, -1), { ...last, content: last.content + content }]
              })
            } catch {
              /* intentionally ignored */
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error', err)
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' },
      ])
    } finally {
      setIsLoadingChat(false)
    }
  }

  const handleOrderWhatsApp = (product: any) => {
    const text = `Olá! Gostaria de encomendar o produto "${product.name}" por R$ ${product.price?.toFixed(2)} do catálogo.`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (!catalog)
    return (
      <div className="min-h-screen flex items-center justify-center">Carregando catálogo...</div>
    )

  const products = catalog.expand?.products || []

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      <header className="bg-white border-b py-6 px-4 text-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl md:text-4xl font-bold text-slate-800">{catalog.name}</h1>
        {catalog.expand?.company_id?.name && (
          <p className="text-slate-500 mt-2">Oferecido por: {catalog.expand.company_id.name}</p>
        )}
      </header>

      <main className="container mx-auto py-8 px-4">
        {products.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            Nenhum produto disponível neste catálogo no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="aspect-square bg-slate-100 relative">
                  {product.image ? (
                    <img
                      src={pb.files.getURL(product, product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Sem Imagem
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-auto">
                    {product.description}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="font-bold text-xl text-green-600">
                      R$ {product.price?.toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOrderWhatsApp(product)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Pedir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* AI Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-105 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {isChatOpen && (
          <div className="bg-white rounded-lg shadow-2xl w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-5">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Assistente Virtual</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-lg rounded-tl-none p-3 text-sm text-slate-800 w-[85%]">
                  Olá! Como posso ajudar você a encontrar as melhores ofertas hoje?
                </div>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 text-sm max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg rounded-tl-none p-3 text-sm text-slate-500 w-[85%] flex items-center gap-2">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse animation-delay-200">●</span>
                      <span className="animate-pulse animation-delay-400">●</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form
              onSubmit={streamChat}
              className="p-3 border-t bg-slate-50 rounded-b-lg flex gap-2"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte sobre os produtos..."
                className="flex-1"
                disabled={isLoadingChat}
              />
              <Button type="submit" disabled={isLoadingChat || !chatInput.trim()}>
                Enviar
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

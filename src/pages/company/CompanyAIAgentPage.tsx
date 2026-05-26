import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getMyCompany } from '@/services/companies'
import { getAIAgentByCompany, createAIAgent, updateAIAgent } from '@/services/ai_agents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CompanyAIAgentPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [company, setCompany] = useState<any>(null)
  const [agent, setAgent] = useState<any>(null)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    if (user) {
      getMyCompany(user.id).then(async (comp) => {
        if (comp) {
          setCompany(comp)
          const ag = await getAIAgentByCompany(comp.id)
          if (ag) {
            setAgent(ag)
            if (ag.welcome_message) {
              setMessages([{ role: 'ai', content: ag.welcome_message }])
            }
          }
        }
      })
    }
  }, [user])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      company_id: company.id,
      agent_name: formData.get('agent_name'),
      instructions: formData.get('instructions'),
      welcome_message: formData.get('welcome_message'),
      is_enabled: formData.get('is_enabled') === 'on',
    }

    try {
      if (agent?.id) {
        const updated = await updateAIAgent(agent.id, data)
        setAgent(updated)
      } else {
        const created = await createAIAgent(data)
        setAgent(created)
      }
      toast({ description: 'Configurações do Agente salvas com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível salvar', variant: 'destructive' })
    }
  }

  const handleTestChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const msg = chatInput
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setChatInput('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `[Simulação] Respondendo como "${agent?.agent_name || 'Agente'}". Baseado nas instruções, eu te ajudaria com: "${msg}".`,
        },
      ])
    }, 800)
  }

  if (!company) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold mb-2">Agente de IA (CRM)</h1>
        <p className="text-muted-foreground mb-6">
          Configure o comportamento do seu agente de atendimento automatizado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent_name">Nome do Agente</Label>
              <Input
                id="agent_name"
                name="agent_name"
                defaultValue={agent?.agent_name}
                placeholder="Ex: Assistente de Vendas"
                required
              />
            </div>

            <div>
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Input
                id="welcome_message"
                name="welcome_message"
                defaultValue={agent?.welcome_message}
                placeholder="Ex: Olá! Como posso te ajudar hoje?"
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instruções de Vendas / Tom de Voz (Prompt)</Label>
              <Textarea
                id="instructions"
                name="instructions"
                defaultValue={agent?.instructions}
                placeholder="Ex: Seja educado e foque nas promoções de limpeza. Tente conduzir o cliente ao fechamento."
                className="h-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_enabled" name="is_enabled" defaultChecked={agent?.is_enabled} />
              <Label htmlFor="is_enabled">Habilitar Agente no Catálogo Público</Label>
            </div>
          </div>
          <Button type="submit">Salvar Configurações</Button>
        </form>
      </div>

      <div>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Preview do Chat</CardTitle>
            <CardDescription>Simule uma conversa com o agente configurado</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-[400px]">
            <ScrollArea className="flex-1 border rounded-md p-4 bg-slate-50">
              <div className="space-y-4 flex flex-col justify-end">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border'}`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground mt-10">
                    Mande uma mensagem para iniciar o teste.
                  </p>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleTestChat} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Digite uma mensagem..."
              />
              <Button type="submit" disabled={!agent?.id}>
                Enviar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

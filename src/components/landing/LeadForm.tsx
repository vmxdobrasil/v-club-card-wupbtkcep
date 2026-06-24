import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function LeadForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await pb.collection('platform_leads').create({ name, email, phone })
      toast({
        title: 'Solicitação enviada!',
        description: 'Entraremos em contato em breve com mais informações.',
      })
      setName('')
      setEmail('')
      setPhone('')
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar sua solicitação. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl space-y-6 max-w-md mx-auto"
    >
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold text-slate-900">Solicite seu Cartão</h3>
        <p className="text-slate-500 text-sm">
          Preencha os dados abaixo e nossa equipe entrará em contato.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="leadName">Nome Completo</Label>
          <Input
            id="leadName"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="João Silva"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leadEmail">E-mail</Label>
          <Input
            id="leadEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="joao@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leadPhone">Telefone / WhatsApp</Label>
          <Input
            id="leadPhone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Quero meu V CLUB CARD'}
      </Button>
    </form>
  )
}

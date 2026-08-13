import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  QrCode,
  FileText,
  CreditCard,
} from 'lucide-react'
import { createAsaasCharge } from '@/services/asaas'

interface GeneratedLink {
  id: string
  customer_name: string
  amount: number
  billing_type: string
  payment_url: string
  due_date: string
  status: string
  created_at: string
}

export function AsaasLinkGeneratorStep() {
  const [customerName, setCustomerName] = useState('')
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [billingType, setBillingType] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED'>(
    'PIX',
  )
  const [description, setDescription] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault()

    const numAmount = parseFloat(amount.replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor Inválido',
        description: 'Informe um valor numérico maior que zero.',
      })
      return
    }

    if (!customerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome Obrigatório',
        description: 'Por favor, informe o nome do cliente/sacado.',
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await createAsaasCharge({
        customer_name: customerName,
        customer_cpf_cnpj: customerCpfCnpj,
        customer_email: customerEmail,
        amount: numAmount,
        due_date: dueDate || undefined,
        billing_type: billingType,
        description,
      })

      const newLink: GeneratedLink = {
        id: res.payment_id || res.transaction_id || Math.random().toString(),
        customer_name: customerName,
        amount: numAmount,
        billing_type: billingType,
        payment_url: res.payment_url,
        due_date: dueDate || new Date().toISOString().split('T')[0],
        status: res.status || 'PENDING',
        created_at: new Date().toLocaleString('pt-BR'),
      }

      setGeneratedLinks((prev) => [newLink, ...prev])

      toast({
        title: 'Link de Cobrança Gerado!',
        description: 'A cobrança foi criada no Asaas com sucesso e o link está disponível.',
      })

      // Reset Form fields
      setCustomerName('')
      setCustomerCpfCnpj('')
      setCustomerEmail('')
      setAmount('')
      setDescription('')
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Cobrança',
        description: err.message || 'Falha ao conectar com a API Asaas.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast({
      title: 'Link Copiado!',
      description: 'O link de pagamento foi copiado para a área de transferência.',
    })
    setTimeout(() => setCopiedId(null), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">
                Etapa 02 — Gerador de Links de Cobrança
              </CardTitle>
              <CardDescription className="text-blue-100 text-xs">
                Crie links e faturas instantâneas para enviar ao cliente via WhatsApp, E-mail ou SMS
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleCreateCharge} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="cust-name" className="text-sm font-semibold text-slate-900">
                  Nome do Cliente / Pagador <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cust-name"
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 border-slate-300 focus-visible:ring-blue-600"
                  required
                />
              </div>

              {/* CPF / CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cust-cpf" className="text-sm font-semibold text-slate-900">
                  CPF ou CNPJ
                </Label>
                <Input
                  id="cust-cpf"
                  placeholder="000.000.000-00"
                  value={customerCpfCnpj}
                  onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                  className="h-11 border-slate-300 focus-visible:ring-blue-600"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="cust-email" className="text-sm font-semibold text-slate-900">
                  E-mail do Cliente
                </Label>
                <Input
                  id="cust-email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11 border-slate-300 focus-visible:ring-blue-600"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-semibold text-slate-900">
                  Valor da Cobrança (R$) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    R$
                  </span>
                  <Input
                    id="amount"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-11 border-slate-300 font-semibold focus-visible:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Billing Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Forma de Pagamento</Label>
                <Select value={billingType} onValueChange={(val: any) => setBillingType(val)}>
                  <SelectTrigger className="h-11 border-slate-300">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-emerald-600" /> PIX (Aprovação Instantânea)
                      </div>
                    </SelectItem>
                    <SelectItem value="BOLETO">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-600" /> Boleto Bancário
                      </div>
                    </SelectItem>
                    <SelectItem value="CREDIT_CARD">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" /> Cartão de Crédito
                      </div>
                    </SelectItem>
                    <SelectItem value="UNDEFINED">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-slate-600" /> Escolha pelo Cliente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due-date" className="text-sm font-semibold text-slate-900">
                  Data de Vencimento
                </Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-11 border-slate-300 focus-visible:ring-blue-600"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-sm font-semibold text-slate-900">
                Descrição da Cobrança / Observações
              </Label>
              <Textarea
                id="desc"
                placeholder="Ex: Pagamento da Fatura V Club Card - Ref. Mês Vigente"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="border-slate-300 focus-visible:ring-blue-600"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 text-base"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Link no Asaas...
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5 mr-2" />
                  Gerar Link de Cobrança
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Links Table */}
      {generatedLinks.length > 0 && (
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-base font-bold text-slate-900">
              Links de Cobrança Gerados Nesta Sessão ({generatedLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Forma</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {generatedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{link.customer_name}</td>
                    <td className="p-4 font-bold text-slate-900">
                      R$ {link.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-white">
                        {link.billing_type}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600">{link.due_date}</td>
                    <td className="p-4">
                      <Badge className="bg-amber-500 hover:bg-amber-600">{link.status}</Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {link.payment_url && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(link.payment_url, link.id)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-4 h-4 mr-1 text-emerald-600" /> Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1 text-blue-600" /> Copiar Link
                              </>
                            )}
                          </Button>
                          <a href={link.payment_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <ExternalLink className="w-4 h-4 mr-1" /> Abrir Fatura
                            </Button>
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // New Holder Form State
  const [userId, setUserId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [totalLimit, setTotalLimit] = useState('1000')

  useEffect(() => {
    fetchHolders()
  }, [])

  const fetchHolders = async () => {
    try {
      const records = await pb
        .collection('card_holders')
        .getFullList({ expand: 'user_id,company_id' })
      setHolders(records)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateHolder = async () => {
    setLoading(true)
    try {
      if (!userId || !companyId || !totalLimit) {
        throw new Error('Preencha todos os campos obrigatórios.')
      }
      await pb.collection('card_holders').create({
        user_id: userId,
        company_id: companyId,
        total_limit: parseFloat(totalLimit),
        used_limit: 0,
        status: 'active',
        card_number: Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(),
        cvv: Math.floor(100 + Math.random() * 900).toString(),
      })
      toast({ title: 'Sucesso', description: 'Portador criado com sucesso.' })
      setIsOpen(false)
      fetchHolders()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portadores</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Portador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Portador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ID do Usuário (User ID)</Label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="ex: 1z2x3c4v5b..."
                />
              </div>
              <div className="space-y-2">
                <Label>ID da Empresa (Company ID)</Label>
                <Input
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="ex: 1a2b3c4d5e..."
                />
              </div>
              <div className="space-y-2">
                <Label>Limite Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateHolder} disabled={loading} className="w-full">
                {loading ? 'Criando...' : 'Criar Portador'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cartão</TableHead>
              <TableHead>Limite Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holders.map((holder) => (
              <TableRow key={holder.id}>
                <TableCell>{holder.expand?.user_id?.name || 'N/A'}</TableCell>
                <TableCell>{holder.expand?.company_id?.name || 'N/A'}</TableCell>
                <TableCell>{holder.card_number || 'N/A'}</TableCell>
                <TableCell>R$ {holder.total_limit?.toFixed(2)}</TableCell>
                <TableCell>
                  <span className="capitalize px-2 py-1 bg-gray-100 rounded text-sm">
                    {holder.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {holders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Nenhum portador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function MasterHoldersPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [holders, setHolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchHolders = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('card_holders').getFullList({
        expand: 'user_id,company_id',
        sort: '-created',
      })
      setHolders(records)
    } catch (error) {
      console.error('Error fetching holders:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolders()
  }, [])

  const filteredHolders = holders.filter((h) => {
    const name = h.expand?.user_id?.name?.toLowerCase() || ''
    const cpf = h.cpf || ''
    return name.includes(searchTerm.toLowerCase()) || cpf.includes(searchTerm)
  })

  const handleCreateMock = () => {
    toast({ title: 'Atenção', description: 'Criação de usuário simulada com sucesso (Mock).' })
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Usuários / Portadores
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os portadores de cartão do sistema.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto relative z-10 shadow-sm" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Portador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Portador</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome Completo</label>
                <Input placeholder="Ex: João da Silva" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">CPF</label>
                <Input placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMock}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Limite Utilizado</TableHead>
              <TableHead className="text-right">Limite Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Carregando dados...
                </TableCell>
              </TableRow>
            ) : filteredHolders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum portador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredHolders.map((holder) => (
                <TableRow key={holder.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    {holder.expand?.user_id?.name || 'Sem nome'}
                  </TableCell>
                  <TableCell className="text-slate-500">{holder.cpf || '-'}</TableCell>
                  <TableCell>{holder.expand?.company_id?.name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                      ${
                        holder.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : holder.status === 'blocked'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {holder.status === 'active'
                        ? 'Ativo'
                        : holder.status === 'blocked'
                          ? 'Bloqueado'
                          : 'Cancelado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      holder.used_limit || 0,
                    )}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      holder.total_limit || 0,
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const defaultForm = {
    user_id: '',
    company_id: '',
    card_number: '',
    cvv: '',
    expiry: '',
    total_limit: '1000',
    used_limit: '0',
    status: 'active',
    asaas_customer_id: '',
    max_consigned_margin: '0',
  }
  const [formData, setFormData] = useState(defaultForm)

  const loadData = async () => {
    try {
      const [hRes, cRes, uRes] = await Promise.all([
        pb.collection('card_holders').getFullList({
          filter: "deleted_at = '' || deleted_at = null",
          expand: 'user_id,company_id',
          sort: '-created',
        }),
        pb.collection('companies').getFullList({ filter: "deleted_at = '' || deleted_at = null" }),
        pb.collection('users').getFullList({ filter: "role = 'holder'" }),
      ])
      setHolders(hRes)
      setCompanies(cRes)
      setUsers(uRes)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao carregar dados', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('card_holders', () => loadData())

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        total_limit: Number(formData.total_limit),
        used_limit: Number(formData.used_limit),
        max_consigned_margin: Number(formData.max_consigned_margin),
        expiry: formData.expiry ? new Date(formData.expiry).toISOString() : '',
      }
      if (editingId) await pb.collection('card_holders').update(editingId, data)
      else await pb.collection('card_holders').create(data)
      setIsDialogOpen(false)
      toast({ title: 'Sucesso', description: 'Usuário salvo com sucesso!' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Verifique os dados informados.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja mover este usuário para a lixeira?')) return
    try {
      await pb.collection('card_holders').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Movido para a lixeira.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const openEdit = (h: any) => {
    setFormData({
      user_id: h.user_id,
      company_id: h.company_id,
      card_number: h.card_number || '',
      cvv: h.cvv || '',
      expiry: h.expiry ? h.expiry.substring(0, 10) : '',
      total_limit: String(h.total_limit),
      used_limit: String(h.used_limit),
      status: h.status,
      asaas_customer_id: h.asaas_customer_id || '',
      max_consigned_margin: String(h.max_consigned_margin || 0),
    })
    setEditingId(h.id)
    setIsDialogOpen(true)
  }

  const openNew = () => {
    setFormData(defaultForm)
    setEditingId(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Usuários (Cartões)</h2>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titular</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cartão</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holders.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">
                  {h.expand?.user_id?.name || 'Sem nome'}
                </TableCell>
                <TableCell>{h.expand?.company_id?.name || 'N/A'}</TableCell>
                <TableCell>{h.card_number || 'Não gerado'}</TableCell>
                <TableCell>R$ {h.total_limit?.toFixed(2)}</TableCell>
                <TableCell>{h.status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(h)}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {holders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Titular (Conta User)</Label>
              <Select
                value={formData.user_id}
                onValueChange={(v) => setFormData({ ...formData, user_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Empresa Associada</Label>
              <Select
                value={formData.company_id}
                onValueChange={(v) => setFormData({ ...formData, company_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número do Cartão</Label>
              <Input
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                placeholder="Deixe em branco para auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Asaas Customer ID</Label>
              <Input
                value={formData.asaas_customer_id}
                onChange={(e) => setFormData({ ...formData, asaas_customer_id: e.target.value })}
                placeholder="cus_12345"
              />
            </div>
            <div className="space-y-2">
              <Label>Limite Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_limit}
                onChange={(e) => setFormData({ ...formData, total_limit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Margem Consignada Máx (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_consigned_margin}
                onChange={(e) => setFormData({ ...formData, max_consigned_margin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

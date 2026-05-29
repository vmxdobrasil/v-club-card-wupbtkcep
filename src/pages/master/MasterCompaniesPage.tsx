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

export default function MasterCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const defaultForm = {
    name: '',
    bin_prefix: '636943',
    commission_rate: '0',
    modality: 'both',
    gateway_provider: 'Asaas',
    status: 'active',
    asaas_wallet_id: '',
  }
  const [formData, setFormData] = useState(defaultForm)

  const loadData = async () => {
    try {
      const records = await pb
        .collection('companies')
        .getFullList({ filter: "deleted_at = '' || deleted_at = null", sort: '-created' })
      setCompanies(records)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao carregar empresas', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('companies', () => loadData())

  const handleSave = async () => {
    try {
      const data = { ...formData, commission_rate: Number(formData.commission_rate) }
      if (editingId) await pb.collection('companies').update(editingId, data)
      else await pb.collection('companies').create(data)
      setIsDialogOpen(false)
      toast({ title: 'Sucesso', description: 'Empresa salva com sucesso!' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Verifique os dados informados.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja mover esta empresa para a lixeira?')) return
    try {
      await pb.collection('companies').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Movido para a lixeira.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const openEdit = (c: any) => {
    setFormData({
      name: c.name,
      bin_prefix: c.bin_prefix || '636943',
      commission_rate: String(c.commission_rate),
      modality: c.modality,
      gateway_provider: c.gateway_provider,
      status: c.status,
      asaas_wallet_id: c.asaas_wallet_id || '',
    })
    setEditingId(c.id)
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
        <h2 className="text-2xl font-bold tracking-tight">Empresas e Parceiros</h2>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Nova Empresa
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>BIN</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.bin_prefix}</TableCell>
                <TableCell className="capitalize">{c.modality}</TableCell>
                <TableCell>{c.gateway_provider}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label>BIN Prefix</Label>
              <Input
                value={formData.bin_prefix}
                onChange={(e) => setFormData({ ...formData, bin_prefix: e.target.value })}
                placeholder="636943"
              />
            </div>
            <div className="space-y-2">
              <Label>Taxa de Comissão (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select
                value={formData.modality}
                onValueChange={(v) => setFormData({ ...formData, modality: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="both">Ambas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gateway Provider</Label>
              <Select
                value={formData.gateway_provider}
                onValueChange={(v) => setFormData({ ...formData, gateway_provider: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asaas">Asaas</SelectItem>
                  <SelectItem value="Alternative">Alternative</SelectItem>
                  <SelectItem value="None/Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asaas Wallet ID</Label>
              <Input
                value={formData.asaas_wallet_id}
                onChange={(e) => setFormData({ ...formData, asaas_wallet_id: e.target.value })}
                placeholder="wal_12345"
              />
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

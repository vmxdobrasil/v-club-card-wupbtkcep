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
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function MasterPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const defaultForm = { name: '', email: '', password: '', role: 'partner' }
  const [formData, setFormData] = useState(defaultForm)

  const loadData = async () => {
    try {
      const records = await pb
        .collection('users')
        .getFullList({ filter: "role = 'partner'", sort: '-created' })
      setPartners(records)
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao carregar parceiros', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('users', () => loadData())

  const handleSave = async () => {
    try {
      if (editingId) {
        const updateData: any = { name: formData.name }
        if (formData.password) {
          updateData.password = formData.password
          updateData.passwordConfirm = formData.password
        }
        await pb.collection('users').update(editingId, updateData)
      } else {
        await pb.collection('users').create({
          ...formData,
          passwordConfirm: formData.password,
        })
      }
      setIsDialogOpen(false)
      toast({ title: 'Sucesso', description: 'Parceiro salvo com sucesso!' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Verifique os dados informados.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este parceiro permanentemente?')) return
    try {
      await pb.collection('users').delete(id)
      toast({ title: 'Sucesso', description: 'Parceiro excluído.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const openEdit = (p: any) => {
    setFormData({ name: p.name || '', email: p.email, password: '', role: 'partner' })
    setEditingId(p.id)
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
        <h2 className="text-2xl font-bold tracking-tight">Contas Lojistas (Parceiros)</h2>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Parceiro
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name || 'Sem nome'}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {partners.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum parceiro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Responsável / Loja</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                disabled={!!editingId}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@loja.com"
              />
            </div>
            <div className="space-y-2">
              <Label>{editingId ? 'Nova Senha (opcional)' : 'Senha'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="******"
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

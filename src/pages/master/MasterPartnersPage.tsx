import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Trash2, Edit2, Store } from 'lucide-react'

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Contas Lojistas</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os parceiros e lojistas credenciados.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Parceiro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((p) => (
          <Card
            key={p.id}
            className="relative overflow-hidden group hover:border-accent/50 transition-colors shadow-lg"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            <CardContent className="p-6 pl-8 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">
                      {p.name || 'Sem nome'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{p.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/20 text-secondary-foreground border border-secondary/20">
                  Parceiro
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => openEdit(p)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {partners.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-border shadow-sm">
            Nenhum parceiro encontrado.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                className="bg-card"
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
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label>{editingId ? 'Nova Senha (opcional)' : 'Senha'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="******"
                className="bg-card"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

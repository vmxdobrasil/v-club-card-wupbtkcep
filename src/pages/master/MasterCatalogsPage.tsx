import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company_id: '',
    status: 'active',
  })

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [catalogsData, companiesData] = await Promise.all([
        pb
          .collection('catalogs')
          .getFullList({ filter: "deleted_at = ''", expand: 'company_id', sort: '-created' }),
        pb.collection('companies').getFullList({ filter: "deleted_at = ''", sort: 'name' }),
      ])
      setCatalogs(catalogsData)
      setCompanies(companiesData)
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.company_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e selecione uma empresa.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await pb.collection('catalogs').update(editingId, formData)
        toast({ title: 'Sucesso', description: 'Catálogo atualizado com sucesso.' })
      } else {
        await pb.collection('catalogs').create(formData)
        toast({ title: 'Sucesso', description: 'Catálogo criado com sucesso.' })
      }
      setIsDialogOpen(false)
      loadData()
      resetForm()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este catálogo?')) return
    try {
      await pb.collection('catalogs').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Catálogo excluído com sucesso.' })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o catálogo.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', company_id: '', status: 'active' })
    setEditingId(null)
  }

  const openEdit = (catalog: any) => {
    setFormData({
      name: catalog.name || '',
      description: catalog.description || '',
      company_id: catalog.company_id || '',
      status: catalog.status || 'active',
    })
    setEditingId(catalog.id)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Catálogos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os catálogos de produtos e serviços</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm()
            setIsDialogOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Catálogo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Catálogo' : 'Cadastrar Novo Catálogo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Catálogo</Label>
                <Input
                  placeholder="Ex: Catálogo de Verão"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (Opcional)</Label>
                <Input
                  placeholder="Uma breve descrição..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa Associada</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
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
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : catalogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Nenhum catálogo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              catalogs.map((c) => (
                <TableRow key={c.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10 text-primary">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {c.name}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground max-w-xs truncate"
                    title={c.description}
                  >
                    {c.description || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.expand?.company_id?.name || 'Empresa Desconhecida'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.status === 'active' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}
                    >
                      {c.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        title="Excluir"
                      >
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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

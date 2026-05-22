import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { getCatalogs, createCatalog, updateCatalog, deleteCatalog } from '@/services/catalog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' })
  const [file, setFile] = useState<File | null>(null)

  const load = () => {
    getCatalogs().then(setCatalogs).catch(console.error)
  }
  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    if (!formData.name) return toast.error('Nome é obrigatório')
    setLoading(true)
    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('status', formData.status)
    if (file) data.append('cover_image', file)

    try {
      if (editing) await updateCatalog(editing.id, data)
      else await createCatalog(data)
      toast.success('Salvo com sucesso')
      setOpen(false)
      load()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir catálogo?')) {
      await deleteCatalog(id)
      load()
    }
  }

  const openEdit = (c: any) => {
    setEditing(c)
    setFormData({ name: c.name, description: c.description, status: c.status })
    setFile(null)
    setOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Catálogos</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setFormData({ name: '', description: '', status: 'active' })
            setFile(null)
            setOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Catálogo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalogs.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>
                <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                  {c.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/master/catalogs/${c.id}`}>
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {catalogs.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                Nenhum catálogo.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Catálogo' : 'Novo Catálogo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

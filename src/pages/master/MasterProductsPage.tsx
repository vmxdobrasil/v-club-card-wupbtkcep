import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/catalog'
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
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

export default function MasterProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'active',
  })

  const load = () => {
    getProducts().then(setProducts).catch(console.error)
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('products', () => {
    load()
  })

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    setLoading(true)
    const data = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      status: formData.status,
    }

    try {
      if (editing) await updateProduct(editing.id, data)
      else await createProduct(data)
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
    if (confirm('Excluir produto?')) {
      await deleteProduct(id)
      load()
    }
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price?.toString() || '0',
      status: p.status || 'active',
    })
    setOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Produtos</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setFormData({
              name: '',
              description: '',
              price: '',
              status: 'active',
            })
            setOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço Base</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>R$ {p.price?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                  {p.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Nenhum produto cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
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
              <Label>Preço Base (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

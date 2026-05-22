import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getPartnerProducts, createProduct, updateProduct, deleteProduct } from '@/services/catalog'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function PartnerProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    original_price: '',
    promo_price: '',
    active: true,
  })
  const [file, setFile] = useState<File | null>(null)

  const load = () => {
    if (user) getPartnerProducts(user.id).then(setProducts).catch(console.error)
  }
  useEffect(() => {
    load()
  }, [user])

  const handleSave = async () => {
    if (!formData.name || !formData.original_price || !formData.promo_price) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    if (Number(formData.promo_price) > Number(formData.original_price)) {
      toast.error('Preço promocional não pode ser maior que o original')
      return
    }
    setLoading(true)
    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('original_price', formData.original_price)
    data.append('promo_price', formData.promo_price)
    data.append('active', String(formData.active))
    data.append('partner_id', user.id)
    if (file) data.append('image', file)

    try {
      if (editing) await updateProduct(editing.id, data)
      else await createProduct(data)
      toast.success('Produto salvo com sucesso')
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
      description: p.description,
      original_price: p.original_price,
      promo_price: p.promo_price,
      active: p.active,
    })
    setFile(null)
    setOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Meus Produtos</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setFormData({
              name: '',
              description: '',
              original_price: '',
              promo_price: '',
              active: true,
            })
            setFile(null)
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
            <TableHead>Preço Original</TableHead>
            <TableHead>Promoção</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>R$ {p.original_price.toFixed(2)}</TableCell>
              <TableCell>R$ {p.promo_price.toFixed(2)}</TableCell>
              <TableCell>{p.active ? 'Ativo' : 'Inativo'}</TableCell>
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
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Original (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Promocional (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.promo_price}
                  onChange={(e) => setFormData({ ...formData, promo_price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(c) => setFormData({ ...formData, active: c })}
              />
              <Label>Ativo</Label>
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

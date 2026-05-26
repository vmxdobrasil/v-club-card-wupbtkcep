import { useEffect, useState } from 'react'
import { Plus, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCompanyProducts, createProduct, deleteProduct } from '@/services/products'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_status: 'in_stock',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      pb.collection('companies')
        .getFirstListItem(`owner_id = '${user.id}'`)
        .then((comp) => {
          setCompanyId(comp.id)
          loadData(comp.id)
        })
        .catch(() =>
          toast({ title: 'Aviso', description: 'Nenhuma empresa associada encontrada.' }),
        )
    }
  }, [user])

  const loadData = async (cid: string) => {
    try {
      const prods = await getCompanyProducts(cid)
      setProducts(prods)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Erro ao carregar produtos.', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    if (!formData.name || !formData.price) {
      toast({
        title: 'Validação',
        description: 'Nome e Preço são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('company_id', companyId)
      data.append('stock_status', formData.stock_status)
      if (imageFile) data.append('image', imageFile)

      await createProduct(data)
      toast({ title: 'Sucesso', description: 'Produto criado com sucesso.' })
      setIsDialogOpen(false)
      loadData(companyId)
      setFormData({ name: '', description: '', price: '', stock_status: 'in_stock' })
      setImageFile(null)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao criar produto.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este produto?')) return
    try {
      await deleteProduct(id)
      toast({ title: 'Sucesso', description: 'Produto excluído.' })
      if (companyId) loadData(companyId)
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meus Produtos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!companyId}>
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label>Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque</Label>
                  <Select
                    value={formData.stock_status}
                    onValueChange={(v) => setFormData({ ...formData, stock_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">Em Estoque</SelectItem>
                      <SelectItem value="out_of_stock">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Imagem</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image ? (
                    <img
                      src={pb.files.getURL(product, product.image, { thumb: '100x100' })}
                      className="w-10 h-10 object-cover rounded"
                      alt=""
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded">
                      <ImageIcon className="text-slate-400 w-5 h-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>R$ {product.price?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  {product.stock_status === 'in_stock' ? 'Estoque' : 'Esgotado'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(product.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

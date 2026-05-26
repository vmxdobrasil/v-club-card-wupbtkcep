import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCatalog } from '@/services/catalogs'
import { getProducts, createProduct, deleteProduct, updateProductOrders } from '@/services/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { GripVertical, Trash2 } from 'lucide-react'

export default function CompanyCatalogDetailsPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    if (id) {
      setCatalog(await getCatalog(id))
      setProducts(await getProducts(id))
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleProductSubmit = async (e: any) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    formData.append('catalog_id', id!)
    formData.append('order', products.length.toString())

    const imageFile = formData.get('image') as File
    if (!imageFile || !imageFile.name) {
      formData.delete('image')
    }

    try {
      await createProduct(formData)
      toast({ description: 'Produto adicionado com sucesso!' })
      setOpen(false)
      form.reset()
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o produto',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Deseja realmente remover este produto do catálogo?')) return
    await deleteProduct(productId)
    toast({ description: 'Produto removido.' })
    loadData()
  }

  const onDragStart = (e: any, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
  const onDragOver = (e: any) => e.preventDefault()

  const onDrop = async (e: any, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'))
    if (sourceIndex === targetIndex) return

    const newItems = [...products]
    const [moved] = newItems.splice(sourceIndex, 1)
    newItems.splice(targetIndex, 0, moved)
    setProducts(newItems)

    try {
      const updates = newItems.map((p, i) => ({ id: p.id, order: i }))
      await updateProductOrders(updates)
      toast({ description: 'Ordem dos produtos atualizada.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao reordenar', variant: 'destructive' })
      loadData()
    }
  }

  if (!catalog) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{catalog.name}</h1>
          <p className="text-muted-foreground">{catalog.description}</p>
          <a
            href={`/public/catalog/${catalog.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-green-600 hover:underline mt-1 inline-block"
          >
            Visualizar Link Público
          </a>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Produto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto no Catálogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input name="name" required placeholder="Nome do Produto" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea name="description" placeholder="Breve descrição" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Preço Original (opcional)</label>
                  <Input name="original_price" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium">Preço Promocional</label>
                  <Input name="promo_price" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Estoque</label>
                <select
                  name="stock_status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="in_stock"
                >
                  <option value="in_stock">Em Estoque</option>
                  <option value="out_of_stock">Sem Estoque</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Imagem do Produto</label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <Button type="submit" className="w-full">
                Salvar Produto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <h2 className="text-lg font-semibold mb-4">Lista de Produtos (Arraste para reordenar)</h2>
      <div className="space-y-3">
        {products.map((p, index) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className="flex items-center gap-4 p-4 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
          >
            <div className="text-gray-400">
              <GripVertical size={24} />
            </div>
            {p.image ? (
              <img
                src={pb.files.getURL(p, p.image)}
                alt={p.name}
                className="w-16 h-16 object-cover rounded bg-gray-50"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight p-1">
                Sem imagem
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-primary">
                  R$ {p.promo_price > 0 ? p.promo_price : p.original_price}
                </span>
                {p.stock_status === 'out_of_stock' && (
                  <span className="ml-2 text-red-500 text-xs font-bold">(Sem Estoque)</span>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(p.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center text-muted-foreground py-10 border border-dashed rounded-md bg-gray-50">
            Nenhum produto adicionado ainda.
          </div>
        )}
      </div>
    </div>
  )
}

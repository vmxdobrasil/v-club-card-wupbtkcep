import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Trash, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
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
import { getCatalog, updateCatalog } from '@/services/catalogs'
import { getCompanyProducts } from '@/services/products'
import pb from '@/lib/pocketbase/client'

export default function MasterCatalogDetailsPage() {
  const { id } = useParams()
  const [catalog, setCatalog] = useState<any>(null)
  const [companyProducts, setCompanyProducts] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (id) loadData(id)
  }, [id])

  const loadData = async (catalogId: string) => {
    try {
      const cat = await getCatalog(catalogId)
      setCatalog(cat)
      if (cat.company_id) {
        const prods = await getCompanyProducts(cat.company_id)
        setCompanyProducts(prods)
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Catálogo não encontrado.', variant: 'destructive' })
    }
  }

  const handleAddProduct = async (productId: string) => {
    try {
      const updatedProducts = [...(catalog.products || []), productId]
      await updateCatalog(catalog.id, { products: updatedProducts })
      toast({ title: 'Sucesso', description: 'Produto adicionado ao catálogo.' })
      loadData(catalog.id)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao adicionar produto.', variant: 'destructive' })
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    try {
      const updatedProducts = (catalog.products || []).filter((pid: string) => pid !== productId)
      await updateCatalog(catalog.id, { products: updatedProducts })
      toast({ title: 'Sucesso', description: 'Produto removido do catálogo.' })
      loadData(catalog.id)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao remover produto.', variant: 'destructive' })
    }
  }

  if (!catalog) return <div className="p-6">Carregando...</div>

  const catalogProducts = catalog.expand?.products || []
  const availableProducts = companyProducts.filter((p) => !(catalog.products || []).includes(p.id))

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{catalog.name}</h1>
          <p className="text-slate-500">Empresa: {catalog.expand?.company_id?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/catalog/${catalog.id}`} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Ver Catálogo Público
            </a>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Produtos ao Catálogo</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>R$ {p.price?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleAddProduct(p.id)}>
                            Adicionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {availableProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-slate-500">
                          Todos os produtos já estão no catálogo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image ? (
                    <img
                      src={pb.files.getURL(product, product.image, { thumb: '100x100' })}
                      className="w-10 h-10 object-cover rounded"
                      alt=""
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>R$ {product.price?.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {catalogProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum produto neste catálogo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

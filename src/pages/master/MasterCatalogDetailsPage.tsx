import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import {
  getCatalog,
  getCatalogItems,
  removeProductFromCatalog,
  addProductToCatalog,
  getProducts,
} from '@/services/catalog'
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
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export default function MasterCatalogDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [catalog, setCatalog] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [openAdd, setOpenAdd] = useState(false)

  const load = () => {
    if (!id) return
    getCatalog(id).then(setCatalog).catch(console.error)
    getCatalogItems(id).then(setItems).catch(console.error)
  }
  useEffect(() => {
    load()
  }, [id])

  const openAddModal = async () => {
    try {
      const prod = await getProducts()
      setAllProducts(prod.filter((p: any) => p.active))
      setOpenAdd(true)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAdd = async (productId: string) => {
    if (!id) return
    try {
      await addProductToCatalog(id, productId)
      toast.success('Adicionado!')
      load()
    } catch (e: any) {
      toast.error('Erro ao adicionar')
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await removeProductFromCatalog(itemId)
      toast.success('Removido!')
      load()
    } catch (e) {
      toast.error('Erro ao remover')
    }
  }

  if (!catalog) return <div className="p-6">Carregando...</div>

  const currentProductIds = new Set(items.map((i) => i.product_id))
  const availableProducts = allProducts.filter((p) => !currentProductIds.has(p.id))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/master/catalogs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{catalog.name}</h1>
          <p className="text-muted-foreground">Itens do catálogo</p>
        </div>
        <div className="ml-auto">
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => {
              const p = i.expand?.product_id
              if (!p) return null
              return (
                <TableRow key={i.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    {p.image && (
                      <img
                        src={pb.files.getURL(p, p.image)}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    {p.name}
                  </TableCell>
                  <TableCell>{p.expand?.partner_id?.name}</TableCell>
                  <TableCell>R$ {p.promo_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(i.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Nenhum produto neste catálogo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
          </DialogHeader>
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
                  <TableCell>R$ {p.promo_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleAdd(p.id)}>
                      Adicionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {availableProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    Nenhum produto disponível.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}

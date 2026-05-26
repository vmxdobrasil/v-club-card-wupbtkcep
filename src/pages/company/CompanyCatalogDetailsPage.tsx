import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCatalog,
  getCatalogItems,
  createCatalogItem,
  deleteCatalogItem,
  Catalog,
  CatalogItem,
} from '@/services/catalogs'
import { getCompanyProducts, Product } from '@/services/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, Trash2, Plus } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function CompanyCatalogDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')

  const loadData = async () => {
    if (!id) return
    try {
      const cat = await getCatalog(id)
      setCatalog(cat)
      const [itms, prods] = await Promise.all([
        getCatalogItems(id),
        getCompanyProducts(cat.company_id),
      ])
      setItems(itms)
      setProducts(prods)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])
  useRealtime('catalog_items', () => {
    loadData()
  })

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !selectedProductId) return
    try {
      await createCatalogItem({ catalog_id: id, product_id: selectedProductId })
      toast.success('Product added to catalog')
      setOpen(false)
      setSelectedProductId('')
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    )

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/company/catalogs">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{catalog?.name}</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="add-prod-cat-desc">
            <DialogHeader>
              <DialogTitle>Add Product to Catalog</DialogTitle>
              <DialogDescription id="add-prod-cat-desc">
                Select an existing product to feature.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4 pt-4">
              <Select required value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - ${p.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">
                Add to Catalog
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.expand?.product_id?.name}</TableCell>
                  <TableCell>${item.expand?.product_id?.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteCatalogItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No products added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

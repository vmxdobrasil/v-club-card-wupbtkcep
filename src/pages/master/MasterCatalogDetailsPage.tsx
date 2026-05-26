import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getCatalog,
  getCatalogItems,
  deleteCatalogItem,
  Catalog,
  CatalogItem,
} from '@/services/catalogs'
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
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function MasterCatalogDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      const [cat, itms] = await Promise.all([getCatalog(id), getCatalogItems(id)])
      setCatalog(cat)
      setItems(itms)
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

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteCatalogItem(itemId)
      toast.success('Removed from catalog')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/master/catalogs">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{catalog?.name} - Items</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products in Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
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
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No products in this catalog.
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

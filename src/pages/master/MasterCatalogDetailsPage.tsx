import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Image as ImageIcon, GripVertical, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import useRealtime from '@/hooks/use-realtime'

import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { getCatalog } from '@/services/catalogs'
import {
  getProductsByCatalog,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/products'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  status: z.enum(['active', 'inactive']),
  image: z.any().optional(),
})
type ProductFormValues = z.infer<typeof productSchema>

export default function MasterCatalogDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const { toast } = useToast()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, status: 'active' },
  })

  const loadData = async () => {
    if (!id) return
    try {
      const cat = await getCatalog(id)
      setCatalog(cat)
      const prods = await getProductsByCatalog(id)
      setProducts(prods)
    } catch {
      toast({ title: 'Error loading catalog details', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('products', () => {
    if (draggedIdx === null) {
      getProductsByCatalog(id!).then(setProducts)
    }
  })

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      if (values.description) formData.append('description', values.description)
      formData.append('price', values.price.toString())
      formData.append('status', values.status)
      formData.append('catalog_id', id!)
      formData.append('sort_order', (products.length + 1).toString())

      if (values.image && values.image.length > 0) {
        formData.append('image', values.image[0])
      }

      await createProduct(formData)
      setIsAddOpen(false)
      form.reset()
      toast({ title: 'Product added successfully' })
    } catch (err) {
      const errors = extractFieldErrors(err)
      Object.keys(errors).forEach((k) => form.setError(k as any, { message: errors[k] }))
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct(productId)
      toast({ title: 'Product deleted' })
    } catch {
      toast({ title: 'Error deleting product', variant: 'destructive' })
    }
  }

  const toggleProductStatus = async (product: any) => {
    try {
      await updateProduct(product.id, {
        status: product.status === 'active' ? 'inactive' : 'active',
      })
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' })
    }
  }

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.parentNode as any)
  }

  const onDragEnter = (e: React.DragEvent, index: number) => {
    if (draggedIdx === null || draggedIdx === index) return
    const newProds = [...products]
    const draggedItem = newProds[draggedIdx]
    newProds.splice(draggedIdx, 1)
    newProds.splice(index, 0, draggedItem)
    setDraggedIdx(index)
    setProducts(newProds)
  }

  const onDragEnd = async () => {
    setDraggedIdx(null)
    const updates = products
      .map((p, idx) => {
        const expectedSort = idx + 1
        if (p.sort_order !== expectedSort) {
          p.sort_order = expectedSort
          return pb.collection('products').update(p.id, { sort_order: expectedSort })
        }
        return null
      })
      .filter(Boolean)

    if (updates.length > 0) {
      try {
        await Promise.all(updates)
        toast({ title: 'Product order saved' })
      } catch {
        toast({ title: 'Error saving product order', variant: 'destructive' })
      }
    }
  }

  if (!catalog) return <div className="p-8">Loading...</div>

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/master/catalogs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{catalog.name}</h1>
            <Badge variant={catalog.status === 'active' ? 'default' : 'secondary'}>
              {catalog.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {catalog.expand?.company_id?.name} &bull; {catalog.description}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products in this catalog yet.</p>
          </div>
        ) : (
          products.map((p, idx) => (
            <Card
              key={p.id}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragEnter={(e) => onDragEnter(e, idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`transition-colors ${draggedIdx === idx ? 'opacity-50 border-primary' : 'hover:border-primary/50 cursor-move'}`}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <GripVertical className="text-muted-foreground opacity-50 shrink-0 hidden sm:block" />
                  <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden border">
                    {p.image ? (
                      <img
                        src={pb.files.getURL(p, p.image, { thumb: '100x100' })}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground opacity-30" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {p.description || 'No description'}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                  <div className="font-semibold text-lg">${Number(p.price).toFixed(2)}</div>
                  <Badge
                    variant={p.status === 'active' ? 'default' : 'secondary'}
                    className="cursor-pointer shrink-0"
                    onClick={() => toggleProductStatus(p)}
                  >
                    {p.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from '@/services/products'
import { getCompanies, Company } from '@/services/companies'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function MasterProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialog, setIsDialog] = useState(false)
  const [form, setForm] = useState<Partial<Product>>({})
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([getProducts(), getCompanies()])
      .then(([p, c]) => {
        setProducts(p)
        setCompanies(c)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      const formData = new FormData()
      if (form.name) formData.append('name', form.name)
      if (form.description) formData.append('description', form.description)
      if (form.price) formData.append('price', form.price.toString())
      if (form.category) formData.append('category', form.category)
      if (form.company_id) formData.append('company_id', form.company_id)
      if (file) formData.append('image', file)

      if (form.id) {
        await updateProduct(form.id, formData as any)
        toast.success('Product updated')
      } else {
        await createProduct(formData as any)
        toast.success('Product created')
      }
      setIsDialog(false)
      const updated = await getProducts()
      setProducts(updated)
    } catch (e: any) {
      toast.error(e.message || 'Error saving product')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id)
      setProducts((p) => p.filter((x) => x.id !== id))
      toast.success('Product deleted')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage global product inventory and assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({})
            setFile(null)
            setIsDialog(true)
          }}
        >
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const comp = companies.find((c) => c.id === p.company_id)
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      <img
                        src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/products/${p.id}/${p.image}?thumb=100x100`}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 border rounded flex items-center justify-center text-[10px] text-gray-400">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell>{comp?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForm(p)
                        setFile(null)
                        setIsDialog(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialog} onOpenChange={setIsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit' : 'New'} Product</DialogTitle>
            <DialogDescription>
              Fill out the product details below. Required fields are marked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Wireless Mouse"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief product overview..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Electronics"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={form.company_id}
                onValueChange={(v) => setForm({ ...form, company_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company owner" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

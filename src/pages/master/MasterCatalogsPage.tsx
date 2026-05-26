import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getCatalogs,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  Catalog,
} from '@/services/catalogs'
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

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  const [isDialog, setIsDialog] = useState(false)
  const [form, setForm] = useState<Partial<Catalog>>({})
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    Promise.all([getCatalogs(), getCompanies()])
      .then(([c, comp]) => {
        setCatalogs(c)
        setCompanies(comp)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      const formData = new FormData()
      if (form.title) formData.append('title', form.title)
      if (form.description) formData.append('description', form.description)
      if (form.slug) formData.append('slug', form.slug)
      if (form.status) formData.append('status', form.status)
      if (form.company_id) formData.append('company_id', form.company_id)
      if (file) formData.append('banner', file)

      if (form.id) {
        await updateCatalog(form.id, formData as any)
        toast.success('Catalog updated')
      } else {
        await createCatalog(formData as any)
        toast.success('Catalog created')
      }
      setIsDialog(false)
      const updated = await getCatalogs()
      setCatalogs(updated)
    } catch (e: any) {
      toast.error(e.message || 'Error saving catalog')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this catalog?')) {
      await deleteCatalog(id)
      setCatalogs((c) => c.filter((x) => x.id !== id))
      toast.success('Catalog deleted')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalogs Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage public storefront catalogs.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ status: 'active' })
            setFile(null)
            setIsDialog(true)
          }}
        >
          Create Catalog
        </Button>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Public URL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((c) => {
              const comp = companies.find((x) => x.id === c.company_id)
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{comp?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/catalog/${c.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                    >
                      /c/{c.slug}
                    </a>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/master/catalogs/${c.id}`}>Products</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForm(c)
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
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {catalogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No catalogs created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialog} onOpenChange={setIsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit' : 'New'} Catalog</DialogTitle>
            <DialogDescription>
              Setup your promotional catalog. The slug will be used for the public URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Summer Sale 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short catchy description..."
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL path)</Label>
              <Input
                value={form.slug || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  })
                }
                placeholder="summer-sale-24"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={form.company_id}
                  onValueChange={(v) => setForm({ ...form, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
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
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Banner Image</Label>
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
            <Button onClick={handleSave}>Save Catalog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

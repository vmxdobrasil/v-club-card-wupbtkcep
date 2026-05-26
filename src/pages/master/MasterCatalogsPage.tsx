import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCatalogs, createCatalog, deleteCatalog, Catalog } from '@/services/catalogs'
import { getCompanies, Company } from '@/services/companies'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, Plus, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [companyId, setCompanyId] = useState('')

  const loadData = async () => {
    try {
      const [cats, comps] = await Promise.all([getCatalogs(), getCompanies()])
      setCatalogs(cats)
      setCompanies(comps)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('catalogs', () => {
    loadData()
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCatalog({
        name,
        slug,
        company_id: companyId,
        status: 'active',
        is_promotional: true,
      })
      toast.success('Catalog created')
      setOpen(false)
      setName('')
      setSlug('')
      setCompanyId('')
    } catch (error) {
      toast.error('Failed to create catalog')
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Catalogs Master List</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Catalog
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="add-catalog-desc">
            <DialogHeader>
              <DialogTitle>Add New Catalog</DialogTitle>
              <DialogDescription id="add-catalog-desc">
                Create a new product catalog for a company.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Catalog Name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug (Public URL)</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. promo-2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select required value={companyId} onValueChange={setCompanyId}>
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
              <Button type="submit" className="w-full">
                Save Catalog
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Catalogs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell>{c.expand?.company_id?.name}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/master/catalogs/${c.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCatalog(c.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

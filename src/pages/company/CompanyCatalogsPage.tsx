import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Company } from '@/services/companies'
import { getCompanyCatalogs, createCatalog, Catalog } from '@/services/catalogs'
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
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, Plus, Settings, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CompanyCatalogsPage() {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const loadCatalogs = async (compId: string) => {
    try {
      const data = await getCompanyCatalogs(compId)
      setCatalogs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      pb.collection('companies')
        .getFirstListItem<Company>(`owner_id="${user.id}"`)
        .then((c) => {
          setCompany(c)
          loadCatalogs(c.id)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  useRealtime(
    'catalogs',
    () => {
      if (company) loadCatalogs(company.id)
    },
    !!company,
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    try {
      await createCatalog({
        name,
        slug,
        company_id: company.id,
        status: 'active',
        is_promotional: true,
      })
      toast.success('Catalog created')
      setOpen(false)
      setName('')
      setSlug('')
    } catch (error) {
      toast.error('Failed to create catalog')
    }
  }

  const handleShare = (catalog: Catalog) => {
    const url = `${window.location.origin}/catalog/${catalog.slug}`
    const text = `Confira nosso catálogo promocional: ${catalog.name}!\n${url}`
    navigator.clipboard.writeText(text)
    toast.success('Link copiado para a área de transferência!')
  }

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
      </div>
    )
  if (!company)
    return <div className="p-8 text-center text-muted-foreground">Company profile not found.</div>

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Catalogs</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Catalog
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="new-cat-desc">
            <DialogHeader>
              <DialogTitle>Create Catalog</DialogTitle>
              <DialogDescription id="new-cat-desc">
                Create a new digital storefront.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Catalog Name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. promo-diadospais"
                />
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Catalogs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>URL Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">/catalog/{c.slug}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleShare(c)}>
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link to={`/company/catalogs/${c.id}`}>
                        <Settings className="w-4 h-4 mr-2" /> Manage Items
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {catalogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No catalogs found.
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

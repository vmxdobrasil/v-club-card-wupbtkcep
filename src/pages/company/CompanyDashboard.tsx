import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Company } from '@/services/companies'
import { getCompanyProducts, createProduct, Product } from '@/services/products'
import { getCompanyLeads, Lead } from '@/services/leads'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Loader2, Package, Users, Plus, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const [newProdName, setNewProdName] = useState('')
  const [newProdPrice, setNewProdPrice] = useState('')
  const [open, setOpen] = useState(false)

  const loadData = async (compId: string) => {
    try {
      const [prods, lds] = await Promise.all([getCompanyProducts(compId), getCompanyLeads(compId)])
      setProducts(prods)
      setLeads(lds)
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
          loadData(c.id)
        })
        .catch(() => setLoading(false))
    }
  }, [user])

  useRealtime(
    'products',
    () => {
      if (company) loadData(company.id)
    },
    !!company,
  )
  useRealtime(
    'leads',
    () => {
      if (company) loadData(company.id)
    },
    !!company,
  )

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return
    try {
      await createProduct({
        name: newProdName,
        price: Number(newProdPrice),
        company_id: company.id,
        status: 'active',
      })
      toast.success('Product added')
      setOpen(false)
      setNewProdName('')
      setNewProdPrice('')
    } catch (err) {
      toast.error('Failed to add product')
    }
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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard - {company.name}</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="leads">CRM / Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Catalogs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage in Catalogs Tab</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="add-product-desc">
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription id="add-product-desc">
                      Add a new product to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Save
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>${p.price?.toFixed(2)}</TableCell>
                      <TableCell>{p.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{format(new Date(l.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>{l.contact_info}</TableCell>
                      <TableCell>{l.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

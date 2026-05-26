import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Package, Building2, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { getCompanies } from '@/services/companies'
import { getCatalogsByCompany, createCatalog, updateCatalog } from '@/services/catalogs'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})
type FormValues = z.infer<typeof schema>

export default function MasterCatalogsPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', status: 'active' },
  })

  useEffect(() => {
    getCompanies()
      .then((data) => {
        setCompanies(data)
        if (data.length > 0) setSelectedCompany(data[0].id)
      })
      .catch(() => toast({ title: 'Error loading companies', variant: 'destructive' }))
  }, [])

  const loadData = async () => {
    if (!selectedCompany) return
    try {
      const data = await getCatalogsByCompany(selectedCompany)
      setCatalogs(data)

      const prods = await pb.collection('products').getFullList({
        filter: `catalog_id.company_id="${selectedCompany}"`,
        fields: 'catalog_id',
      })
      const counts: Record<string, number> = {}
      prods.forEach((p) => {
        counts[p.catalog_id] = (counts[p.catalog_id] || 0) + 1
      })
      setProductCounts(counts)
    } catch {
      toast({ title: 'Error loading catalogs', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedCompany])

  useRealtime('catalogs', loadData)
  useRealtime('products', loadData)

  const onSubmit = async (values: FormValues) => {
    try {
      await createCatalog({ ...values, company_id: selectedCompany })
      setIsDialogOpen(false)
      form.reset()
      toast({ title: 'Catalog created successfully' })
    } catch (err) {
      const errors = extractFieldErrors(err)
      Object.keys(errors).forEach((k) => form.setError(k as any, { message: errors[k] }))
    }
  }

  const toggleStatus = async (e: React.MouseEvent, catalog: any) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await updateCatalog(catalog.id, {
        status: catalog.status === 'active' ? 'inactive' : 'active',
      })
      toast({ title: 'Status updated' })
    } catch {
      toast({ title: 'Error updating status', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
          <p className="text-muted-foreground">Manage product catalogs for client companies.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCompany}>
              <Plus className="mr-2 h-4 w-4" /> New Catalog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Catalog</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catalog Name</FormLabel>
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
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 max-w-sm">
            <Building2 className="text-muted-foreground" />
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
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
        </CardContent>
      </Card>

      {selectedCompany && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {catalogs.length === 0 ? (
            <div className="col-span-full text-center p-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No catalogs found for this company.</p>
            </div>
          ) : (
            catalogs.map((catalog) => (
              <Link key={catalog.id} to={`/master/catalogs/${catalog.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{catalog.name}</CardTitle>
                      <Badge
                        variant={catalog.status === 'active' ? 'default' : 'secondary'}
                        onClick={(e) => toggleStatus(e, catalog)}
                      >
                        {catalog.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {catalog.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto border-t pt-4 text-sm text-muted-foreground flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    {productCounts[catalog.id] || 0} Products
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

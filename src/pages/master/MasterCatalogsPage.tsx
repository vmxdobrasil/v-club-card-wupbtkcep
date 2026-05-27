import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getCatalogs, createCatalog, deleteCatalog } from '@/services/catalogs'
import { getCompanies } from '@/services/companies'

export default function MasterCatalogsPage() {
  const [searchParams] = useSearchParams()
  const initialCompany = searchParams.get('company') || 'all'
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompany)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company_id: '',
    status: 'active',
  })

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('catalogs', () => {
    loadData()
  })

  const loadData = async () => {
    try {
      const [cats, comps] = await Promise.all([getCatalogs(), getCompanies()])
      setCatalogs(cats)
      setCompanies(comps)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Erro ao carregar dados.', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.company_id) {
      toast({
        title: 'Validação',
        description: 'Nome e Empresa são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      await createCatalog(formData)
      toast({ title: 'Sucesso', description: 'Catálogo criado com sucesso.' })
      setIsDialogOpen(false)
      loadData()
      setFormData({ name: '', description: '', company_id: '', status: 'active' })
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao criar catálogo.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este catálogo?')) return
    try {
      await deleteCatalog(id)
      toast({ title: 'Sucesso', description: 'Catálogo excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    }
  }

  const filteredCatalogs =
    selectedCompanyId === 'all'
      ? catalogs
      : catalogs.filter((c) => c.company_id === selectedCompanyId)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Catálogos Promocionais</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Catálogo
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>Criar Catálogo</DialogTitle>
              <DialogDescription id="dialog-description" className="sr-only">
                Preencha as informações do catálogo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                <Label>Nome do Catálogo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Empresas</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCatalogs.map((catalog) => (
              <TableRow key={catalog.id}>
                <TableCell className="font-medium">{catalog.name}</TableCell>
                <TableCell>{catalog.expand?.company_id?.name || 'N/A'}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${catalog.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {catalog.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell>{catalog.products?.length || 0} itens</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/master/catalogs/${catalog.id}`}>Gerenciar</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/catalog/${catalog.id}`} target="_blank" rel="noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(catalog.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCatalogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum catálogo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

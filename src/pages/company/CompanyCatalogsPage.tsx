import { useEffect, useState } from 'react'
import { Plus, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCompanyCatalogs, createCatalog, deleteCatalog } from '@/services/catalogs'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function CompanyCatalogsPage() {
  const { user } = useAuth()
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  })

  useEffect(() => {
    if (user) {
      pb.collection('companies')
        .getFirstListItem(`owner_id = '${user.id}'`)
        .then((comp) => {
          setCompanyId(comp.id)
          loadData(comp.id)
        })
        .catch(() => toast({ title: 'Aviso', description: 'Nenhuma empresa encontrada.' }))
    }
  }, [user])

  const loadData = async (cid: string) => {
    try {
      const cats = await getCompanyCatalogs(cid)
      setCatalogs(cats)
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Erro ao carregar catálogos.', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) return
    if (!formData.name) {
      toast({ title: 'Validação', description: 'Nome é obrigatório.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createCatalog({ ...formData, company_id: companyId })
      toast({ title: 'Sucesso', description: 'Catálogo criado.' })
      setIsDialogOpen(false)
      loadData(companyId)
      setFormData({ name: '', status: 'active' })
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao criar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este catálogo?')) return
    try {
      await deleteCatalog(id)
      toast({ title: 'Sucesso', description: 'Catálogo excluído.' })
      if (companyId) loadData(companyId)
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meus Catálogos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!companyId}>
              <Plus className="mr-2 h-4 w-4" /> Novo Catálogo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Catálogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((catalog) => (
              <TableRow key={catalog.id}>
                <TableCell className="font-medium">{catalog.name}</TableCell>
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
                    <Link to={`/company/catalogs/${catalog.id}`}>Gerenciar</Link>
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
            {catalogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
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

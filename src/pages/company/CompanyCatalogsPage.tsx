import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getMyCompany } from '@/services/companies'
import { getCatalogs, createCatalog } from '@/services/catalogs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function CompanyCatalogsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [company, setCompany] = useState<any>(null)
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    if (!user) return
    const comp = await getMyCompany(user.id)
    if (comp) {
      setCompany(comp)
      const cats = await getCatalogs(`company_id="${comp.id}"`)
      setCatalogs(cats)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      await createCatalog({
        name: formData.get('name'),
        description: formData.get('description'),
        company_id: company.id,
        status: formData.get('status'),
      })
      toast({ description: 'Catálogo criado com sucesso!' })
      setOpen(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o catálogo.',
        variant: 'destructive',
      })
    }
  }

  if (!company) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Catálogos Promocionais</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Catálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Catálogo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Catálogo</label>
                <Input name="name" required placeholder="Ex: Ofertas de Natal" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input name="description" placeholder="Breve descrição" />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select name="status" defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo (Visível)</SelectItem>
                    <SelectItem value="inactive">Inativo (Oculto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Salvar Catálogo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {catalogs.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                ></span>
                <span className="text-sm text-muted-foreground">
                  {c.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="space-y-2">
                <Link
                  to={`/company/catalogs/${c.id}`}
                  className="text-primary font-medium hover:underline block"
                >
                  Gerenciar Produtos
                </Link>
                <a
                  href={`/public/catalog/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 font-medium hover:underline block text-sm"
                >
                  Ver Página Pública
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {catalogs.length === 0 && (
          <div className="col-span-3 text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">Você ainda não tem catálogos criados.</p>
            <Button variant="outline" onClick={() => setOpen(true)}>
              Criar meu primeiro catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

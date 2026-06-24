import { useEffect, useState } from 'react'
import { Plus, Search, MoreVertical, Edit, Trash, FileText, Building } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { CompanyFormModal } from '@/components/companies/CompanyFormModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MasterCompaniesPageProps {
  defaultTab?: 'companies' | 'bins'
}

export default function MasterCompaniesPage({
  defaultTab = 'companies',
}: MasterCompaniesPageProps) {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('companies').getFullList({
        sort: '-created',
        filter: "deleted_at = ''",
      })
      setCompanies(records)
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao carregar empresas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta empresa?')) return
    try {
      await pb.collection('companies').update(id, { deleted_at: new Date().toISOString() })
      toast({ title: 'Sucesso', description: 'Empresa movida para lixeira.' })
      fetchCompanies()
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao remover empresa.', variant: 'destructive' })
    }
  }

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) || (c.cnpj && c.cnpj.includes(search)),
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gerenciamento de Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            Administre as empresas e seus respectivos BINs da plataforma.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCompany(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Empresa
        </Button>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="bins">BINs</TabsTrigger>
        </TabsList>
        <TabsContent value="companies" className="space-y-6 mt-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                Nenhuma empresa encontrada.
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="relative overflow-hidden group hover:border-primary/50 transition-colors shadow-lg"
                >
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full ${company.status === 'active' ? 'bg-primary' : 'bg-destructive'}`}
                  />
                  <CardContent className="p-6 pl-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-border bg-secondary/20">
                          <AvatarImage
                            src={company.logo ? pb.files.getURL(company, company.logo) : ''}
                          />
                          <AvatarFallback className="text-secondary-foreground">
                            <Building className="h-6 w-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg line-clamp-1">{company.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono mt-0.5">
                            {company.cnpj || 'Sem CNPJ'}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCompany(company)
                              setIsModalOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4 text-primary" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {}}>
                            <FileText className="mr-2 h-4 w-4 text-accent" /> Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(company.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${company.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}
                      >
                        {company.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        Criado em {format(new Date(company.created), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="bins" className="mt-4">
          <Card className="shadow-lg border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle>BINs Configurados</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Prefixo do BIN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono">{c.bin_prefix || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-12 text-muted-foreground">
                        Nenhum BIN encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCompany(null)
        }}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  )
}

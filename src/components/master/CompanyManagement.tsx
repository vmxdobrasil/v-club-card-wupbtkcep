import { useState, useEffect } from 'react'
import { type Company, deleteCompany } from '@/services/companies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Building2, CreditCard, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { CompanyForm } from './CompanyForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  getProducts,
  getCompanyProducts,
  saveCompanyProduct,
  removeCompanyProduct,
} from '@/services/catalog'
import { Switch } from '@/components/ui/switch'

export function CompanyManagement({
  companies,
  defaultTab = 'companies',
}: {
  companies: Company[]
  defaultTab?: string
}) {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>()
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogCompany, setCatalogCompany] = useState<Company | null>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [companyProducts, setCompanyProducts] = useState<any[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  const handleCreate = () => {
    setEditingCompany(undefined)
    setFormOpen(true)
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta empresa? Esta ação não pode ser desfeita.'))
      return
    try {
      await deleteCompany(id)
      toast.success('Empresa removida com sucesso.')
    } catch (error) {
      toast.error('Erro ao remover empresa. Verifique as dependências.')
    }
  }

  const handleManageCatalog = async (company: Company) => {
    setCatalogCompany(company)
    setLoadingCatalog(true)
    setCatalogOpen(true)
    try {
      const [prods, compProds] = await Promise.all([getProducts(), getCompanyProducts(company.id)])
      setAllProducts(prods.filter((p) => p.status === 'active'))
      setCompanyProducts(compProds)
    } catch (error) {
      toast.error('Erro ao carregar catálogo.')
    } finally {
      setLoadingCatalog(false)
    }
  }

  const toggleProduct = async (productId: string, checked: boolean) => {
    if (!catalogCompany) return
    try {
      if (checked) {
        await saveCompanyProduct(catalogCompany.id, productId)
        const compProds = await getCompanyProducts(catalogCompany.id)
        setCompanyProducts(compProds)
        toast.success('Produto adicionado ao catálogo')
      } else {
        await removeCompanyProduct(catalogCompany.id, productId)
        setCompanyProducts((prev) => prev.filter((cp) => cp.product_id !== productId))
        toast.success('Produto removido do catálogo')
      }
    } catch (error) {
      toast.error('Erro ao atualizar produto no catálogo.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Empresas e BINs</h2>
          <p className="text-muted-foreground">
            Administre empresas clientes e monitore a alocação de prefixos BIN.
          </p>
        </div>
        {isMaster && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nova Empresa
          </Button>
        )}
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="companies">Empresas Cliente</TabsTrigger>
          <TabsTrigger value="bins">Controle de BINs</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardContent className="pt-6">
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Nenhuma empresa encontrada</p>
                    <p className="text-sm text-muted-foreground">
                      Cadastre a primeira empresa para iniciar a operação e alocar BINs.
                    </p>
                  </div>
                  {isMaster && (
                    <Button variant="outline" onClick={handleCreate}>
                      Adicionar Empresa
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ / Contato</TableHead>
                      <TableHead>Hierarquia</TableHead>
                      <TableHead>Prefixo BIN</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Status</TableHead>
                      {isMaster && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {company.market_segment || 'Sem segmento'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{company.cnpj}</div>
                          {(company.phone || company.whatsapp) && (
                            <div className="text-xs text-muted-foreground">
                              {company.whatsapp || company.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={company.is_matrix ? 'border-primary/50 text-primary' : ''}
                          >
                            {company.is_matrix ? 'Matriz' : 'Filial'}
                          </Badge>
                          {!company.is_matrix && company.expand?.matrix_id && (
                            <div
                              className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]"
                              title={company.expand.matrix_id.name}
                            >
                              De: {company.expand.matrix_id.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{company.bin_prefix}</TableCell>
                        <TableCell>
                          <div>Modo {company.modality}</div>
                          <div className="text-xs text-muted-foreground">
                            {company.commission_rate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={company.status === 'active' ? 'default' : 'secondary'}
                            className={
                              company.status === 'active'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : ''
                            }
                          >
                            {company.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        {isMaster && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Gerenciar Catálogo"
                              onClick={() => handleManageCatalog(company)}
                            >
                              <BookOpen className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(company.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bins">
          <Card>
            <CardHeader>
              <CardTitle>Controle de BINs</CardTitle>
              <CardDescription>
                Relação de empresas e seus respectivos prefixos BIN.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
                  <CreditCard className="w-10 h-10 text-muted-foreground" />
                  <p className="font-medium text-foreground">Nenhum BIN alocado</p>
                  <p className="text-sm text-muted-foreground">
                    Os BINs aparecerão aqui assim que as empresas forem cadastradas.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Prefixo BIN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="font-mono">{company.bin_prefix}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editingCompany}
        companies={companies}
        onSuccess={() => setFormOpen(false)}
      />

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Catálogo de Produtos</DialogTitle>
            <DialogDescription>
              Gerencie quais produtos estão disponíveis para {catalogCompany?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {loadingCatalog ? (
              <div className="text-center py-10 text-muted-foreground">Carregando...</div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum produto ativo encontrado no sistema.
              </div>
            ) : (
              <div className="space-y-4">
                {allProducts.map((product) => {
                  const isChecked = companyProducts.some((cp) => cp.product_id === product.id)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {product.base_price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(c) => toggleProduct(product.id, c)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setCatalogOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

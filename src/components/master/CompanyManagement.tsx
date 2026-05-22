import { useState } from 'react'
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
import { Plus, Edit2, Trash2, Building2, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { CompanyForm } from './CompanyForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CompanyManagement({ companies }: { companies: Company[] }) {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>()

  const uniqueBins = Array.from(new Set(companies.map((c) => c.bin_prefix))).filter(Boolean)
  const binGroups = uniqueBins.map((bin) => ({
    bin_prefix: bin,
    companies: companies.filter((c) => c.bin_prefix === bin),
  }))

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

      <Tabs defaultValue="companies" className="w-full">
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
                    <p className="font-medium text-foreground">Nenhuma empresa cadastrada</p>
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
                      <TableHead>Responsável</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Faixa BIN</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Taxa (%)</TableHead>
                      <TableHead>Status</TableHead>
                      {isMaster && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {company.expand?.owner_id?.name || 'Não atribuído'}
                        </TableCell>
                        <TableCell>Modo {company.modality}</TableCell>
                        <TableCell className="font-mono">{company.bin_prefix}</TableCell>
                        <TableCell>{company.gateway_provider}</TableCell>
                        <TableCell>{company.commission_rate}%</TableCell>
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
              <CardTitle>Prefixos BIN Alocados</CardTitle>
              <CardDescription>
                Resumo dos prefixos BIN em uso e suas empresas associadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {binGroups.length === 0 ? (
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
                      <TableHead>Prefixo BIN</TableHead>
                      <TableHead>Empresas Utilizando</TableHead>
                      <TableHead>Total de Empresas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {binGroups.map((group) => (
                      <TableRow key={group.bin_prefix}>
                        <TableCell className="font-mono font-medium">{group.bin_prefix}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.companies.map((c) => (
                              <Badge key={c.id} variant="outline">
                                {c.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{group.companies.length}</TableCell>
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
        onSuccess={() => setFormOpen(false)}
      />
    </div>
  )
}

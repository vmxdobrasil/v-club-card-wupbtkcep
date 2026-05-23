import { useState, useEffect } from 'react'
import { getPartners, type User } from '@/services/users'
import { getCompanies, type Company } from '@/services/companies'
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
import { Loader2, Store, Users, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MasterPartnersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPartners(), getCompanies()])
      .then(([u, c]) => {
        setUsers(u)
        setCompanies(c.filter((comp) => comp.is_partner))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Módulo de Parceiros</h1>
        <p className="text-muted-foreground">
          Gerencie parceiros, afiliados e suas respectivas regras de negócio.
        </p>
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="companies">
            <Building2 className="w-4 h-4 mr-2" /> Empresas Parceiras
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" /> Usuários Parceiros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Designadas como Parceiras</CardTitle>
              <CardDescription>
                Empresas com regras de negócios específicas (ex: taxas comissionadas).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
                  <Store className="w-10 h-10 text-muted-foreground" />
                  <p className="font-medium text-foreground">Nenhuma empresa parceira encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Modo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="font-mono text-sm">{company.cnpj}</TableCell>
                        <TableCell>{company.commission_rate}%</TableCell>
                        <TableCell>Modo {company.modality}</TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                            {company.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Contas de Usuário Parceiro</CardTitle>
              <CardDescription>Lojistas e afiliados que operam a plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
                  <Users className="w-10 h-10 text-muted-foreground" />
                  <p className="font-medium text-foreground">Nenhum usuário parceiro encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cadastrado Em</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          {user.name || 'Sem nome'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{format(new Date(user.created), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Ativo</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

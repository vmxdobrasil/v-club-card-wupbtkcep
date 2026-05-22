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
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { CompanyForm } from './CompanyForm'

export function CompanyManagement({ companies }: { companies: Company[] }) {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>()

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Empresas Cliente e Controle de BINs</CardTitle>
          <CardDescription>
            Gestão das empresas cadastradas e alocação de prefixos BIN
          </CardDescription>
        </div>
        {isMaster && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" /> Nova Empresa
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
            <Building2 className="w-10 h-10 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Nenhuma empresa cadastrada</p>
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
                  <TableCell>Modo {company.modality}</TableCell>
                  <TableCell className="font-mono">{company.bin_prefix}.xxxx</TableCell>
                  <TableCell>{company.gateway_provider}</TableCell>
                  <TableCell>{company.commission_rate}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === 'active' ? 'default' : 'secondary'}
                      className={
                        company.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                      }
                    >
                      {company.status}
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

      <CompanyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editingCompany}
        onSuccess={() => setFormOpen(false)}
      />
    </Card>
  )
}

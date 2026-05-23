import { useState, useEffect } from 'react'
import { getPartners, type User } from '@/services/users'
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
import { Loader2, Store } from 'lucide-react'
import { format } from 'date-fns'

export default function MasterPartnersPage() {
  const [partners, setPartners] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartners()
      .then(setPartners)
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

      <Card>
        <CardHeader>
          <CardTitle>Rede de Parceiros</CardTitle>
          <CardDescription>Parceiros e lojistas que fazem parte do ecossistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border border-dashed rounded-lg">
              <Store className="w-10 h-10 text-muted-foreground" />
              <p className="font-medium text-foreground">Nenhum parceiro encontrado</p>
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
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium flex items-center gap-3">
                      {partner.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{format(new Date(partner.created), 'dd/MM/yyyy')}</TableCell>
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
    </div>
  )
}

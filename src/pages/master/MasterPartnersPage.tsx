import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

export default function MasterPartnersPage() {
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    pb.collection('users')
      .getFullList({ filter: "role = 'partner'" })
      .then(setPartners)
      .catch(() => toast.error('Erro ao carregar parceiros'))
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Empresas Parceiras</h2>
        <Button>Novo Parceiro</Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.email}</TableCell>
                <TableCell>{p.name || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {partners.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                  Nenhuma empresa parceira cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

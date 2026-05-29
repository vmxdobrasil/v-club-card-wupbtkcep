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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function MasterCompaniesPage({ defaultTab }: { defaultTab?: string }) {
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    pb.collection('companies')
      .getFullList({ filter: "deleted_at = ''" })
      .then(setCompanies)
      .catch(() => toast.error('Erro ao carregar empresas'))
  }, [])

  const handleSoftDelete = async (id: string) => {
    try {
      await pb.collection('companies').update(id, { deleted_at: new Date().toISOString() })
      setCompanies(companies.filter((c) => c.id !== id))
      toast.success('Empresa movida para a lixeira')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h2>
        <Button>Nova Empresa</Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>BIN Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono">{c.bin_prefix}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(c.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

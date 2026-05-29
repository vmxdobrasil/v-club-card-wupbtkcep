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

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])

  useEffect(() => {
    pb.collection('catalogs')
      .getFullList({ filter: "deleted_at = ''" })
      .then(setCatalogs)
      .catch(() => toast.error('Erro ao carregar catálogos'))
  }, [])

  const handleSoftDelete = async (id: string) => {
    try {
      await pb.collection('catalogs').update(id, { deleted_at: new Date().toISOString() })
      setCatalogs(catalogs.filter((c) => c.id !== id))
      toast.success('Catálogo movido para a lixeira')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Catálogos</h2>
        <Button>Novo Catálogo</Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(c.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {catalogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
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

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

export default function MasterProductsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    pb.collection('products')
      .getFullList({ filter: "deleted_at = ''" })
      .then(setProducts)
      .catch(() => toast.error('Erro ao carregar produtos'))
  }, [])

  const handleSoftDelete = async (id: string) => {
    try {
      await pb.collection('products').update(id, { deleted_at: new Date().toISOString() })
      setProducts(products.filter((p) => p.id !== id))
      toast.success('Produto movido para a lixeira')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h2>
        <Button>Novo Produto</Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>R$ {p.price?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={p.stock_status === 'in_stock' ? 'default' : 'secondary'}>
                    {p.stock_status === 'in_stock' ? 'Em Estoque' : 'Sem Estoque'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(p.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

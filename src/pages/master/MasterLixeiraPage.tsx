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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function MasterLixeiraPage() {
  const [items, setItems] = useState<Record<string, any[]>>({
    companies: [],
    card_holders: [],
    products: [],
    catalogs: [],
  })

  const loadData = async (col: string) => {
    try {
      const data = await pb.collection(col).getFullList({ filter: "deleted_at != ''" })
      setItems((prev) => ({ ...prev, [col]: data }))
    } catch {
      toast.error(`Erro ao carregar lixeira de ${col}`)
    }
  }

  useEffect(() => {
    ;['companies', 'card_holders', 'products', 'catalogs'].forEach(loadData)
  }, [])

  const handleRestore = async (col: string, id: string) => {
    try {
      await pb.collection(col).update(id, { deleted_at: null })
      setItems((prev) => ({ ...prev, [col]: prev[col].filter((i) => i.id !== id) }))
      toast.success('Registro restaurado com sucesso')
    } catch {
      toast.error('Erro ao restaurar')
    }
  }

  const handlePermanentDelete = async (col: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente?')) return
    try {
      await pb.collection(col).delete(id)
      setItems((prev) => ({ ...prev, [col]: prev[col].filter((i) => i.id !== id) }))
      toast.success('Excluído permanentemente')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const renderTable = (col: string, titleKey: string) => (
    <div className="border rounded-md bg-white mt-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador</TableHead>
            <TableHead>Data de Exclusão</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items[col].map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item[titleKey] || item.id}</TableCell>
              <TableCell className="text-slate-500">
                {item.deleted_at ? format(new Date(item.deleted_at), 'dd/MM/yyyy HH:mm') : ''}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleRestore(col, item.id)}>
                  Restaurar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(col, item.id)}
                >
                  Excluir Permanentemente
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items[col].length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                Nenhum item na lixeira.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Lixeira</h2>
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-200">
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="card_holders">Usuários</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="catalogs">Catálogos</TabsTrigger>
        </TabsList>
        <TabsContent value="companies">{renderTable('companies', 'name')}</TabsContent>
        <TabsContent value="card_holders">{renderTable('card_holders', 'card_number')}</TabsContent>
        <TabsContent value="products">{renderTable('products', 'name')}</TabsContent>
        <TabsContent value="catalogs">{renderTable('catalogs', 'name')}</TabsContent>
      </Tabs>
    </div>
  )
}

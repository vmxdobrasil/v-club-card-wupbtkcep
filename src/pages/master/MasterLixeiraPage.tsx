import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Trash2 } from 'lucide-react'

export default function MasterLixeiraPage() {
  const [data, setData] = useState({ companies: [], card_holders: [], products: [], catalogs: [] })
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const [cmp, hld, prd, cat] = await Promise.all([
        pb
          .collection('companies')
          .getFullList({ filter: "deleted_at != '' && deleted_at != null" }),
        pb
          .collection('card_holders')
          .getFullList({ filter: "deleted_at != '' && deleted_at != null", expand: 'user_id' }),
        pb.collection('products').getFullList({ filter: "deleted_at != '' && deleted_at != null" }),
        pb.collection('catalogs').getFullList({ filter: "deleted_at != '' && deleted_at != null" }),
      ])
      setData({
        companies: cmp as any,
        card_holders: hld as any,
        products: prd as any,
        catalogs: cat as any,
      })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao carregar lixeira', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRestore = async (collection: string, id: string) => {
    try {
      await pb.collection(collection).update(id, { deleted_at: null })
      toast({ title: 'Restaurado', description: 'Registro restaurado com sucesso.' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao restaurar.', variant: 'destructive' })
    }
  }

  const handlePermanentDelete = async (collection: string, id: string) => {
    if (!confirm('Tem certeza? A exclusão permanente não pode ser desfeita.')) return
    try {
      await pb.collection(collection).delete(id)
      toast({ title: 'Excluído', description: 'Registro excluído permanentemente.' })
      loadData()
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir permanentemente.',
        variant: 'destructive',
      })
    }
  }

  const renderTable = (items: any[], collection: string, nameField: string) => (
    <div className="bg-white rounded-lg border shadow-sm mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador</TableHead>
            <TableHead>Data de Exclusão</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {collection === 'card_holders'
                  ? item.expand?.user_id?.name || item.card_number
                  : item[nameField]}
              </TableCell>
              <TableCell>{new Date(item.deleted_at).toLocaleString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(collection, item.id)}
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Restaurar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(collection, item.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                Lixeira vazia para esta categoria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lixeira</h2>
        <p className="text-sm text-slate-500">
          Gerencie registros excluídos. Registros aqui podem ser restaurados ou permanentemente
          deletados.
        </p>
      </div>
      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Empresas ({data.companies.length})</TabsTrigger>
          <TabsTrigger value="holders">Usuários ({data.card_holders.length})</TabsTrigger>
          <TabsTrigger value="products">Produtos ({data.products.length})</TabsTrigger>
          <TabsTrigger value="catalogs">Catálogos ({data.catalogs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="companies">
          {renderTable(data.companies, 'companies', 'name')}
        </TabsContent>
        <TabsContent value="holders">
          {renderTable(data.card_holders, 'card_holders', 'name')}
        </TabsContent>
        <TabsContent value="products">{renderTable(data.products, 'products', 'name')}</TabsContent>
        <TabsContent value="catalogs">{renderTable(data.catalogs, 'catalogs', 'name')}</TabsContent>
      </Tabs>
    </div>
  )
}

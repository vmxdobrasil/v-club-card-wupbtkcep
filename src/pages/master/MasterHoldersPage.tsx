import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadHolders = async () => {
    try {
      const records = await pb.collection('card_holders').getFullList({
        expand: 'user_id,company_id',
        sort: '-created',
      })
      setHolders(records)
    } catch (error) {
      console.error('Error loading holders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHolders()
  }, [])

  useRealtime('card_holders', () => {
    loadHolders()
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestão de Detentores</h1>
          <p className="text-gray-500 mt-2">
            Visualize e gerencie os detentores de cartão cadastrados no sistema.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detentores de Cartão</CardTitle>
          <CardDescription>
            Lista completa de todos os usuários com cartões vinculados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum detentor encontrado.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cartão Final</TableHead>
                    <TableHead>Limite Total</TableHead>
                    <TableHead>Limite Usado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holders.map((holder) => (
                    <TableRow key={holder.id}>
                      <TableCell className="font-medium">
                        {holder.expand?.user_id?.name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>{holder.expand?.company_id?.name || '-'}</TableCell>
                      <TableCell>
                        {holder.card_number ? `**** ${holder.card_number.slice(-4)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(holder.total_limit || 0)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(holder.used_limit || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            holder.status === 'active'
                              ? 'default'
                              : holder.status === 'blocked'
                                ? 'secondary'
                                : 'destructive'
                          }
                          className={cn(
                            holder.status === 'active' && 'bg-green-600 hover:bg-green-700',
                          )}
                        >
                          {holder.status === 'active'
                            ? 'Ativo'
                            : holder.status === 'blocked'
                              ? 'Bloqueado'
                              : 'Cancelado'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

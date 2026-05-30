import { useState, useEffect } from 'react'
import { Plus, CreditCard, CheckCircle, Ban } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HolderForm } from '@/pages/master/HolderForm'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)

  const loadHolders = async () => {
    try {
      const records = await pb.collection('card_holders').getFullList({
        expand: 'user_id,company_id',
        sort: '-created',
      })
      setHolders(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadHolders()
  }, [])
  useRealtime('card_holders', () => {
    loadHolders()
  })

  const activeCount = holders.filter((h) => h.status === 'active').length
  const blockedCount = holders.filter((h) => h.status === 'blocked').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portadores de Cartão</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de titulares e cartões co-branded emitidos.
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Titular
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cadastrar Novo Titular</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <HolderForm onSuccess={() => setIsAddOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cartões Emitidos</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{holders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Bloqueados</CardTitle>
            <Ban className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titular</TableHead>
              <TableHead>Empresa Parceira</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cartão Gerado</TableHead>
              <TableHead>Limite de Crédito</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holders.map((holder) => {
              const user = holder.expand?.user_id
              const avatarUrl = user?.avatar
                ? pb.files.getURL(user, user.avatar, { thumb: '100x100' })
                : undefined

              return (
                <TableRow key={holder.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      {avatarUrl && <AvatarImage src={avatarUrl} />}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{holder.expand?.company_id?.name || 'N/A'}</TableCell>
                  <TableCell className="text-sm">{holder.cpf}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {holder.card_number || (
                      <span className="text-muted-foreground italic">Aguardando BIN...</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">R$ {holder.total_limit?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={holder.status === 'active' ? 'default' : 'destructive'}>
                      {holder.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {holders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum titular cadastrado no sistema.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

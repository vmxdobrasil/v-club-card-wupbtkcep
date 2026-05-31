import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const loadHolders = async () => {
    try {
      const records = await pb.collection('card_holders').getFullList({
        expand: 'user_id,company_id',
        sort: '-created',
      })
      setHolders(records)
    } catch (error) {
      console.error('Failed to load holders', error)
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

  const filteredHolders = holders.filter((h) => {
    const userName = h.expand?.user_id?.name?.toLowerCase() || ''
    const userEmail = h.expand?.user_id?.email?.toLowerCase() || ''
    const cpf = h.cpf || ''
    const s = searchTerm.toLowerCase()
    return userName.includes(s) || userEmail.includes(s) || cpf.includes(s)
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
            Ativo
          </Badge>
        )
      case 'blocked':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            Bloqueado
          </Badge>
        )
      case 'canceled':
        return (
          <Badge
            variant="secondary"
            className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
          >
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários & Portadores</h2>
          <p className="text-muted-foreground">
            Gerenciamento global de portadores de cartão de todas as empresas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portadores de Cartão</CardTitle>
          <CardDescription>
            Lista de usuários que possuem cartões emitidos na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Limite Total</TableHead>
                  <TableHead>Limite Disponível</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredHolders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum portador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolders.map((holder) => {
                    const user = holder.expand?.user_id
                    const company = holder.expand?.company_id
                    const availableLimit = holder.total_limit - holder.used_limit

                    return (
                      <TableRow key={holder.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={
                                  user?.avatar
                                    ? pb.files.getURL(user, user.avatar)
                                    : `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`
                                }
                              />
                              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {user?.name || 'Sem nome'}
                              </span>
                              <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {company ? (
                            <span className="font-medium text-sm">{company.name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{holder.cpf || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(holder.total_limit || 0)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(availableLimit || 0)}
                        </TableCell>
                        <TableCell>{getStatusBadge(holder.status)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

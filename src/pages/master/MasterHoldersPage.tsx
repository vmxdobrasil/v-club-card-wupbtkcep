import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import cardImg from '@/assets/whatsapp-image-2026-05-29-at-11.30.19-b53dc.jpeg'
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

export default function MasterHoldersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    pb.collection('card_holders')
      .getFullList({ filter: "deleted_at = ''", expand: 'user_id' })
      .then(setUsers)
      .catch(() => toast.error('Erro ao carregar usuários'))
  }, [])

  const handleSoftDelete = async (id: string) => {
    try {
      await pb.collection('card_holders').update(id, { deleted_at: new Date().toISOString() })
      setUsers(users.filter((u) => u.id !== id))
      toast.success('Usuário movido para a lixeira')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h2>
        <Button>Novo Usuário</Button>
      </div>

      <div className="flex justify-center bg-white p-12 rounded-xl border shadow-sm">
        <div className="relative w-[420px] h-[260px] rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300">
          <img
            src={cardImg}
            alt="V Club Card Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white font-mono drop-shadow-md">
            <div className="text-2xl tracking-widest mb-2 font-semibold">6035 8700 1234 5678</div>
            <div className="flex justify-between text-sm opacity-90 uppercase">
              <span>NOME DO USUÁRIO</span>
              <span>08/28</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número do Cartão</TableHead>
              <TableHead>Limite Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono">{u.card_number || 'Não definido'}</TableCell>
                <TableCell>R$ {u.total_limit?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'default' : 'secondary'}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleSoftDelete(u.id)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário ativo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

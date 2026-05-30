import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getCardHolders, getCompanies } from '@/services/card_holders'
import { CardHolderForm } from './components/CardHolderForm'
import pb from '@/lib/pocketbase/client'

export default function MasterHoldersPage() {
  const [holders, setHolders] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = async () => {
    try {
      const [hRes, cRes] = await Promise.all([getCardHolders(), getCompanies()])
      setHolders(hRes)
      setFiltered(hRes)
      setCompanies(cRes)
    } catch (err) {
      console.error('Failed to load data', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    setFiltered(
      holders.filter(
        (h) =>
          h.expand?.user_id?.name?.toLowerCase().includes(term) ||
          h.cpf?.includes(term) ||
          h.expand?.company_id?.name?.toLowerCase().includes(term),
      ),
    )
  }, [searchTerm, holders])

  const getAvatarUrl = (user: any) => {
    return user?.avatar
      ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
      : ''
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Portadores de Cartão</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Portador
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cadastrar Novo Portador</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <CardHolderForm
                companies={companies}
                holders={holders}
                onSuccess={() => {
                  setIsOpen(false)
                  loadData()
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nome, CPF ou empresa..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Portador</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo / Fonte</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  Nenhum portador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((holder) => (
                <TableRow key={holder.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={getAvatarUrl(holder.expand?.user_id)} />
                      <AvatarFallback>
                        {holder.expand?.user_id?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {holder.expand?.user_id?.name || 'Sem nome'}
                      </span>
                      {holder.parent_holder_id && (
                        <span className="text-xs text-gray-500">
                          Dep. de:{' '}
                          {holder.expand?.parent_holder_id?.expand?.user_id?.name || 'Desconhecido'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{holder.cpf || '-'}</TableCell>
                  <TableCell>{holder.expand?.company_id?.name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline" className="text-[10px]">
                        {holder.card_type === 'virtual_only' ? 'Virtual' : 'Físico + Virtual'}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {holder.credit_source === 'asaas' ? 'Asaas' : 'Crédito Próprio'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      holder.total_limit || 0,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={holder.status === 'active' ? 'default' : 'destructive'}>
                      {holder.status === 'active' ? 'Ativo' : holder.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

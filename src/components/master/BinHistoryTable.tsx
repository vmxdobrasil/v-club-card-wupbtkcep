import { useState, useEffect } from 'react'
import { getBinAuditLogs } from '@/services/audit'
import { getCompanies, type Company } from '@/services/companies'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useRealtime } from '@/hooks/use-realtime'

export function BinHistoryTable() {
  const [logs, setLogs] = useState<any[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState('')

  const loadLogs = () => {
    getBinAuditLogs(selectedCompany !== 'all' ? selectedCompany : undefined)
      .then((data) => setLogs(data))
      .catch(() => {})
  }

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadLogs()
  }, [selectedCompany])

  useRealtime('bin_logs', () => {
    loadLogs()
  })

  const filteredLogs = logs.filter((log) => {
    if (!dateFilter) return true
    return log.created.startsWith(dateFilter)
  })

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Histórico de BINs</CardTitle>
        <CardDescription>Rastreabilidade de alterações de prefixo BIN na rede.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Empresas</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-1/3">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filtrar por data"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>BIN Anterior</TableHead>
                <TableHead>Novo BIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.created), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {log.expand?.changed_by?.name || log.expand?.changed_by?.email || 'Sistema'}
                    </TableCell>
                    <TableCell>{log.expand?.company_id?.name || '-'}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {log.old_prefix}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-primary">
                      {log.new_prefix}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

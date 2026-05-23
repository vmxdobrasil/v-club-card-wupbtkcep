import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getBinLogs } from '@/services/audit'
import { format } from 'date-fns'
import { Loader2, History } from 'lucide-react'

export function CompanyHistoryModal({
  companyId,
  open,
  onClose,
}: {
  companyId: string | null
  open: boolean
  onClose: () => void
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && companyId) {
      setLoading(true)
      getBinLogs(companyId)
        .then(setLogs)
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open, companyId])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Histórico de Alterações de BIN
          </DialogTitle>
          <DialogDescription>
            Tabela com log de auditoria das mudanças de BIN da empresa.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              Nenhum registro encontrado.
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Data</th>
                    <th className="px-4 py-2 font-medium">Usuário</th>
                    <th className="px-4 py-2 font-medium">BIN Anterior</th>
                    <th className="px-4 py-2 font-medium">Novo BIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-2">
                        {log.expand?.changed_by?.name || log.expand?.changed_by?.email || 'Sistema'}
                      </td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {log.old_prefix || 'N/A'}
                      </td>
                      <td className="px-4 py-2 font-mono font-medium text-primary">
                        {log.new_prefix}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

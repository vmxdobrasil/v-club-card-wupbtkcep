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
            <History className="w-5 h-5 text-primary" /> Histórico de BINs
          </DialogTitle>
          <DialogDescription>Log de auditoria das mudanças de BIN da empresa.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              Nenhum registro encontrado.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border p-3 rounded-lg text-sm bg-card shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-primary">
                    {format(new Date(log.created), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Por:{' '}
                    {log.expand?.changed_by?.name || log.expand?.changed_by?.email || 'Sistema'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs bg-muted/50 p-2 rounded flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground text-xs block mb-1">
                        BIN Anterior
                      </span>
                      <span className="font-mono">{log.old_prefix || 'N/A'}</span>
                    </div>
                    <span className="text-primary font-bold mx-2">→</span>
                    <div className="text-right">
                      <span className="font-medium text-foreground text-xs block mb-1">
                        Novo BIN
                      </span>
                      <span className="font-mono">{log.new_prefix}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

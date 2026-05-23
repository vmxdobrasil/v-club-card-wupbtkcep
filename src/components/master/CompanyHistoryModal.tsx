import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getCompanyLogs } from '@/services/audit'
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
      getCompanyLogs(companyId)
        .then(setLogs)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, companyId])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Histórico de Alterações
          </DialogTitle>
          <DialogDescription>Log de auditoria das mudanças sensíveis da empresa.</DialogDescription>
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
                    Por: {log.expand?.user_id?.name || log.expand?.user_id?.email || 'Sistema'}
                  </div>
                </div>
                <div className="space-y-1">
                  {log.details?.bin_prefix && (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      <span className="font-medium text-foreground">BIN:</span>{' '}
                      {log.details.bin_prefix.old || 'N/A'} <span className="text-primary">→</span>{' '}
                      {log.details.bin_prefix.new}
                    </div>
                  )}
                  {log.details?.status && (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      <span className="font-medium text-foreground">Status:</span>{' '}
                      {log.details.status.old} <span className="text-primary">→</span>{' '}
                      {log.details.status.new}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

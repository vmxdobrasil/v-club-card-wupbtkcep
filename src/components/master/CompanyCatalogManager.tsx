import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  getProducts,
  getCompanyProducts,
  saveCompanyProduct,
  removeCompanyProduct,
} from '@/services/catalog'
import { Company, getCompanies } from '@/services/companies'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CompanyCatalogManager({
  company,
  open,
  onClose,
}: {
  company: Company | null
  open: boolean
  onClose: () => void
}) {
  const [available, setAvailable] = useState<any[]>([])
  const [assigned, setAssigned] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [propagate, setPropagate] = useState(false)

  const loadData = useCallback(async () => {
    if (!company) return
    setLoading(true)
    try {
      const [allProds, compProds] = await Promise.all([
        getProducts(),
        getCompanyProducts(company.id),
      ])
      const activeProducts = allProds.filter((p) => p.status === 'active')
      const assignedIds = new Set(compProds.map((cp) => cp.product_id))

      setAssigned(activeProducts.filter((p) => assignedIds.has(p.id)))
      setAvailable(activeProducts.filter((p) => !assignedIds.has(p.id)))
    } catch (error) {
      toast.error('Erro ao carregar o catálogo.')
    } finally {
      setLoading(false)
    }
  }, [company])

  useEffect(() => {
    if (open) {
      loadData()
      setPropagate(false)
    }
  }, [open, loadData])

  const handleDragStart = (e: React.DragEvent, id: string, source: 'available' | 'assigned') => {
    e.dataTransfer.setData('productId', id)
    e.dataTransfer.setData('source', source)
  }

  const handleDrop = async (e: React.DragEvent, target: 'available' | 'assigned') => {
    e.preventDefault()
    const id = e.dataTransfer.getData('productId')
    const source = e.dataTransfer.getData('source')

    if (!id || source === target || !company) return

    setLoading(true)
    try {
      if (target === 'assigned') {
        if (propagate && company.is_headquarters) {
          const branches = await getCompanies()
          const myBranches = branches.filter((b) => b.parent_company_id === company.id)
          await Promise.all(
            [company.id, ...myBranches.map((b) => b.id)].map((cid) => saveCompanyProduct(cid, id)),
          )
        } else {
          await saveCompanyProduct(company.id, id)
        }
        toast.success('Produto adicionado ao catálogo')
      } else {
        if (propagate && company.is_headquarters) {
          const branches = await getCompanies()
          const myBranches = branches.filter((b) => b.parent_company_id === company.id)
          await Promise.all(
            [company.id, ...myBranches.map((b) => b.id)].map((cid) =>
              removeCompanyProduct(cid, id),
            ),
          )
        } else {
          await removeCompanyProduct(company.id, id)
        }
        toast.success('Produto removido do catálogo')
      }
      await loadData()
    } catch (err) {
      toast.error('Erro ao atualizar catálogo')
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Catálogo - {company?.name}</DialogTitle>
          <DialogDescription>Arraste os produtos para associá-los à empresa.</DialogDescription>
        </DialogHeader>

        {company?.is_headquarters && (
          <div className="flex items-center gap-2 mb-2 p-3 bg-primary/5 border rounded-lg">
            <Switch checked={propagate} onCheckedChange={setPropagate} />
            <span className="text-sm font-medium">Propagar alterações para as filiais?</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-[300px] overflow-hidden">
          <div
            className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-muted/20"
            onDrop={(e) => handleDrop(e, 'available')}
            onDragOver={handleDragOver}
          >
            <div className="p-3 bg-muted text-sm font-bold text-center border-b">
              Produtos Disponíveis
            </div>
            <ScrollArea className="flex-1 p-3">
              {loading ? (
                <div className="text-center p-4 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  {available.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id, 'available')}
                      className="flex items-center gap-2 p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          R$ {p.base_price?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {available.length === 0 && !loading && (
                    <p className="text-xs text-center text-muted-foreground py-4">
                      Nenhum produto restante.
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          <div
            className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-primary/5 border-primary/20"
            onDrop={(e) => handleDrop(e, 'assigned')}
            onDragOver={handleDragOver}
          >
            <div className="p-3 bg-primary/10 text-sm font-bold text-center border-b border-primary/20">
              Catálogo da Empresa
            </div>
            <ScrollArea className="flex-1 p-3">
              {loading ? (
                <div className="text-center p-4 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  {assigned.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id, 'assigned')}
                      className="flex items-center gap-2 p-2 border border-primary/20 bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-primary" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-primary">R$ {p.base_price?.toFixed(2)}</div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        Ativo
                      </Badge>
                    </div>
                  ))}
                  {assigned.length === 0 && !loading && (
                    <p className="text-xs text-center text-muted-foreground py-4">
                      Arraste produtos para cá.
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

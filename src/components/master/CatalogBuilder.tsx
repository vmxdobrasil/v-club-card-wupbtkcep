import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { getCompanies, type Company } from '@/services/companies'
import { createCatalog } from '@/services/catalog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Users, GripVertical, Building } from 'lucide-react'
import { toast } from 'sonner'

export function CatalogBuilder() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [availablePartners, setAvailablePartners] = useState<any[]>([])
  const [assignedPartners, setAssignedPartners] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [catalogName, setCatalogName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(() => {})
    pb.collection('users')
      .getFullList({ filter: "role='partner'" })
      .then(setAvailablePartners)
      .catch(() => {})
  }, [])

  const handleDragStart = (e: React.DragEvent, partner: any, source: 'available' | 'assigned') => {
    e.dataTransfer.setData('partner', JSON.stringify(partner))
    e.dataTransfer.setData('source', source)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const source = e.dataTransfer.getData('source')
    if (source === 'assigned') return
    const partner = JSON.parse(e.dataTransfer.getData('partner'))
    if (!assignedPartners.find((p) => p.id === partner.id)) {
      setAssignedPartners([...assignedPartners, partner])
    }
  }

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const source = e.dataTransfer.getData('source')
    if (source === 'available') return
    const partner = JSON.parse(e.dataTransfer.getData('partner'))
    setAssignedPartners(assignedPartners.filter((p) => p.id !== partner.id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSave = async () => {
    if (!selectedCompanyId) return toast.error('Selecione uma empresa.')
    if (!catalogName) return toast.error('Digite o nome do catálogo.')
    if (assignedPartners.length === 0) return toast.error('Adicione parceiros ao catálogo.')

    setIsSaving(true)
    try {
      await createCatalog({
        name: catalogName,
        company_id: selectedCompanyId,
        partner_links: assignedPartners.map((p) => ({ id: p.id, name: p.name, email: p.email })),
        status: 'active',
      })
      toast.success('Catálogo salvo com sucesso!')
      setAssignedPartners([])
      setCatalogName('')
      setSelectedCompanyId('')
    } catch (err) {
      toast.error('Erro ao salvar catálogo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="mt-6 border-dashed border-2">
      <CardHeader>
        <CardTitle>Partner Management (Catálogos)</CardTitle>
        <CardDescription>
          Associe parceiros a empresas arrastando-os para a seleção do catálogo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Empresa Destino</label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Nome do Catálogo</label>
            <Input
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="Ex: Rede Alimentação Centro"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div
            className={`border rounded-lg p-4 transition-colors ${
              isDragging ? 'bg-muted/40 border-primary/30' : 'bg-muted/10'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDropToAvailable}
          >
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Available Partners
            </h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {availablePartners.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, 'available')}
                    onDragEnd={handleDragEnd}
                    className="flex justify-between items-center p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">
                          {p.name || p.email}
                        </span>
                        {p.name && (
                          <span className="text-[10px] text-muted-foreground mt-1">{p.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {availablePartners.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-10">
                    Nenhum parceiro encontrado.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div
            className={`border rounded-lg p-4 transition-colors ${
              isDragging
                ? 'bg-primary/10 border-primary/50 scale-[1.02]'
                : 'bg-primary/5 border-primary/20'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDropToAssigned}
          >
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" /> Catalog Selection
            </h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {assignedPartners.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[150px] text-muted-foreground border-2 border-dashed border-primary/20 rounded-lg bg-background/50">
                    <p className="text-sm font-medium">Solte os parceiros aqui</p>
                    <p className="text-xs mt-1 text-center px-4">
                      Arraste da lista ao lado para atribuí-los a este catálogo.
                    </p>
                  </div>
                ) : (
                  assignedPartners.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p, 'assigned')}
                      onDragEnd={handleDragEnd}
                      className="flex justify-between items-center p-2 border border-primary/20 bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-destructive/50"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{p.name || p.email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setAssignedPartners(assignedPartners.filter((a) => a.id !== p.id))
                        }
                      >
                        ×
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button
            onClick={handleSave}
            disabled={
              isSaving || assignedPartners.length === 0 || !selectedCompanyId || !catalogName
            }
          >
            {isSaving ? 'Salvando...' : 'Salvar Catálogo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

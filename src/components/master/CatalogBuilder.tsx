import { useState, useEffect } from 'react'
import { getCompanies, type Company } from '@/services/companies'
import { getProducts } from '@/services/catalog'
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
import { Package, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

export function CatalogBuilder() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [assignedProducts, setAssignedProducts] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [catalogName, setCatalogName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getCompanies().then(setCompanies).catch(console.error)
    getProducts().then(setAvailableProducts).catch(console.error)
  }, [])

  const handleDragStart = (e: React.DragEvent, product: any, source: 'available' | 'assigned') => {
    e.dataTransfer.setData('product', JSON.stringify(product))
    e.dataTransfer.setData('source', source)
  }

  const handleDropToAssigned = (e: React.DragEvent) => {
    e.preventDefault()
    const source = e.dataTransfer.getData('source')
    if (source === 'assigned') return
    const product = JSON.parse(e.dataTransfer.getData('product'))
    if (!assignedProducts.find((p) => p.id === product.id)) {
      setAssignedProducts([...assignedProducts, product])
    }
  }

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    const source = e.dataTransfer.getData('source')
    if (source === 'available') return
    const product = JSON.parse(e.dataTransfer.getData('product'))
    setAssignedProducts(assignedProducts.filter((p) => p.id !== product.id))
  }

  const handleSave = async () => {
    if (!selectedCompanyId) return toast.error('Selecione uma empresa.')
    if (!catalogName) return toast.error('Digite o nome do catálogo.')
    if (assignedProducts.length === 0) return toast.error('Adicione produtos ao catálogo.')

    setIsSaving(true)
    try {
      await createCatalog({
        name: catalogName,
        company_id: selectedCompanyId,
        items: assignedProducts.map((p) => ({ id: p.id, name: p.name, price: p.price })),
      })
      toast.success('Catálogo salvo com sucesso!')
      setAssignedProducts([])
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
        <CardTitle>Construtor de Catálogos</CardTitle>
        <CardDescription>
          Crie catálogos arrastando produtos para uma empresa específica
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
              placeholder="Ex: Catálogo de Natal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div
            className="border rounded-lg p-4 bg-muted/20"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropToAvailable}
          >
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Produtos Disponíveis
            </h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {availableProducts.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p, 'available')}
                    className="flex justify-between items-center p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">R$ {p.price}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div
            className="border rounded-lg p-4 bg-primary/5 border-primary/20"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropToAssigned}
          >
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              Atribuídos ao Catálogo
            </h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2 pr-4">
                {assignedProducts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">
                    Arraste os produtos para cá
                  </p>
                ) : (
                  assignedProducts.map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p, 'assigned')}
                      className="flex justify-between items-center p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-destructive/50"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() =>
                          setAssignedProducts(assignedProducts.filter((a) => a.id !== p.id))
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

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={
              isSaving || assignedProducts.length === 0 || !selectedCompanyId || !catalogName
            }
          >
            {isSaving ? 'Salvando...' : 'Salvar Catálogo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { getPartnerProducts, getCatalogs, createCatalog, updateCatalog } from '@/services/catalog'
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
import { useAuth } from '@/hooks/use-auth'

export default function PartnerCatalogsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('new')
  const [catalogName, setCatalogName] = useState('')
  const [assignedProducts, setAssignedProducts] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const loadData = () => {
    if (!user) return
    getPartnerProducts(user.id).then(setProducts).catch(console.error)
    getCatalogs()
      .then((data) => {
        const partnerCatalogs = data.filter((c: any) => c.partner_id === user.id)
        setCatalogs(partnerCatalogs)
      })
      .catch(console.error)
  }

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (selectedCatalogId === 'new') {
      setCatalogName('')
      setAssignedProducts([])
    } else {
      const cat = catalogs.find((c) => c.id === selectedCatalogId)
      if (cat) {
        setCatalogName(cat.name)
        setAssignedProducts(cat.product_links || [])
      }
    }
  }, [selectedCatalogId, catalogs])

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
    if (!catalogName) return toast.error('Digite o nome do catálogo.')
    if (assignedProducts.length === 0) return toast.error('Adicione produtos ao catálogo.')

    setIsSaving(true)
    try {
      const data = {
        name: catalogName,
        partner_id: user?.id,
        product_links: assignedProducts.map((p) => ({ id: p.id, name: p.name, price: p.price })),
        status: 'active',
      }
      if (selectedCatalogId === 'new') {
        await createCatalog(data)
        toast.success('Catálogo criado com sucesso!')
      } else {
        await updateCatalog(selectedCatalogId, data)
        toast.success('Catálogo atualizado com sucesso!')
      }
      loadData()
      setSelectedCatalogId('new')
    } catch (err) {
      toast.error('Erro ao salvar catálogo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Catálogos</h1>
        <p className="text-muted-foreground">Gerencie a vitrine de produtos para seus clientes.</p>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>Construtor Visual</CardTitle>
          <CardDescription>
            Arraste os produtos da esquerda para a direita para compor o catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Catálogo</label>
              <Select value={selectedCatalogId} onValueChange={setSelectedCatalogId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um catálogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Novo Catálogo</SelectItem>
                  {catalogs.map((c) => (
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
                placeholder="Ex: Ofertas de Verão"
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
                <Package className="w-4 h-4" /> Meus Produtos (Disponíveis)
              </h4>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {products.map((p) => (
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
                      <span className="text-xs text-muted-foreground">
                        R$ {p.price?.toFixed(2)}
                      </span>
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
                Itens no Catálogo
              </h4>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {assignedProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-10">
                      Arraste os produtos para cá
                    </p>
                  ) : (
                    assignedProducts.map((p, index) => (
                      <div
                        key={p.id + '-' + index}
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
                            setAssignedProducts(assignedProducts.filter((_, i) => i !== index))
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
              disabled={isSaving || assignedProducts.length === 0 || !catalogName}
            >
              {isSaving ? 'Salvando...' : 'Salvar Catálogo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

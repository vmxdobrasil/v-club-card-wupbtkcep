import { useState, useEffect } from 'react'
import { getCompanies, updateCompany, type Company } from '@/services/companies'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, GripVertical, Building2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { getProducts, saveCompanyProduct } from '@/services/catalog'

export function PartnerDragDropManager() {
  const [partners, setPartners] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  const loadData = () => {
    Promise.all([
      pb.collection('users').getFullList({ filter: "role='partner'" }),
      getProducts(),
      getCompanies(),
    ])
      .then(([parts, prods, comps]) => {
        setPartners(parts)
        setProducts(prods)
        setCompanies(comps)
      })
      .catch(console.error)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string, type: 'partner' | 'product') => {
    e.dataTransfer.setData('dragId', id)
    e.dataTransfer.setData('dragType', type)
  }

  const handleDrop = async (e: React.DragEvent, companyId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('dragId')
    const type = e.dataTransfer.getData('dragType')
    if (!id || !type) return

    try {
      if (type === 'partner') {
        await updateCompany(companyId, { affiliate_id: id })
        toast.success('Parceiro vinculado com sucesso!')
      } else if (type === 'product') {
        await saveCompanyProduct(companyId, id)
        toast.success('Produto adicionado ao catálogo da empresa!')
      }
      loadData()
    } catch (err) {
      toast.error('Erro ao associar.')
    }
  }

  return (
    <Card className="md:col-span-7 mt-4 border-dashed border-2">
      <CardHeader>
        <CardTitle>Gestão Visual de Parceiros e Catálogo</CardTitle>
        <CardDescription>
          Arraste parceiros ou produtos para as empresas abaixo para criar vínculos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-4">
          <div className="border rounded-lg p-3 bg-muted/20">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Parceiros
            </h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2 pr-4">
                {partners.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id, 'partner')}
                    className="flex items-center gap-2 p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{p.name || p.email}</span>
                  </div>
                ))}
                {partners.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum parceiro encontrado.</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="border rounded-lg p-3 bg-muted/20">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Produtos
            </h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2 pr-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id, 'product')}
                    className="flex items-center gap-2 p-2 border bg-card rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum produto encontrado.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="w-full md:w-2/3 border rounded-lg p-3 bg-muted/20">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Empresas Destino
          </h4>
          <ScrollArea className="h-[360px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
              {companies.map((c) => (
                <div
                  key={c.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, c.id)}
                  className="border rounded-lg p-4 bg-card shadow-sm hover:border-primary transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">BIN: {c.bin_prefix}</div>
                  </div>
                  {c.affiliate_id && (
                    <Badge variant="secondary" className="text-[10px] w-fit">
                      Parceiro: {partners.find((p) => p.id === c.affiliate_id)?.name || 'Vinculado'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Package, Trash2, Edit2 } from 'lucide-react'

export default function MasterProductsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    pb.collection('products')
      .getFullList({ filter: "deleted_at = ''" })
      .then(setProducts)
      .catch(() => toast.error('Erro ao carregar produtos'))
  }, [])

  const handleSoftDelete = async (id: string) => {
    try {
      await pb.collection('products').update(id, { deleted_at: new Date().toISOString() })
      setProducts(products.filter((p) => p.id !== id))
      toast.success('Produto movido para a lixeira')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Produtos</h2>
          <p className="text-muted-foreground mt-1">Catálogo global de produtos e serviços.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 border border-white/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm"
                >
                  {p.stock_status === 'in_stock' ? 'Em Estoque' : 'Sem Estoque'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-white drop-shadow-md line-clamp-1">{p.name}</h3>
              <p className="text-sm text-white/80 line-clamp-2 mt-1 min-h-[40px]">
                {p.description || 'Sem descrição.'}
              </p>
            </div>

            <div className="relative z-10 mt-6 flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-1">
                  Preço
                </div>
                <div
                  className="text-2xl font-mono font-bold text-slate-100 drop-shadow-md"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  R$ {p.price?.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-red-500/50 rounded-full"
                  onClick={() => handleSoftDelete(p.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  )
}

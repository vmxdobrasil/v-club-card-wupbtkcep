import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getCatalog, getCatalogItems } from '@/services/catalog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'

export default function CompanyCatalogDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [catalog, setCatalog] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    getCatalog(id).then(setCatalog).catch(console.error)
    getCatalogItems(id).then(setItems).catch(console.error)
  }, [id])

  if (!catalog) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/company/catalogs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{catalog.name}</h1>
          <p className="text-muted-foreground">{catalog.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {items.map((i) => {
          const p = i.expand?.product_id
          if (!p) return null
          const discount = Math.round((1 - p.promo_price / p.original_price) * 100)

          return (
            <Card key={i.id} className="overflow-hidden flex flex-col">
              <div className="aspect-square bg-white relative">
                {p.image ? (
                  <img
                    src={pb.files.getURL(p, p.image)}
                    alt={p.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    Sem Foto
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">
                  {p.description}
                </p>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground line-through">
                    R$ {p.original_price.toFixed(2)}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    R$ {p.promo_price.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {items.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          Este catálogo ainda não possui produtos.
        </div>
      )}
    </div>
  )
}

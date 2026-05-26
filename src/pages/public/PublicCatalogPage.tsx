import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCatalog } from '@/services/catalogs'
import { getProducts } from '@/services/products'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Share2 } from 'lucide-react'

export default function PublicCatalogPage() {
  const { id } = useParams()
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      Promise.all([getCatalog(id).catch(() => null), getProducts(id).catch(() => [])]).then(
        ([catData, prodData]) => {
          setCatalog(catData)
          setProducts(prodData)
          setLoading(false)
        },
      )
    }
  }, [id])

  useEffect(() => {
    if (catalog) {
      document.title = `${catalog.name} | ${catalog.expand?.company_id?.name || 'Catálogo'}`
      let ogTitle = document.querySelector('meta[property="og:title"]')
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      ogTitle.setAttribute('content', catalog.name)
    }
  }, [catalog])

  if (loading)
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  if (!catalog || catalog.status !== 'active') {
    return (
      <div className="flex justify-center items-center min-h-screen text-muted-foreground">
        Catálogo não encontrado ou inativo.
      </div>
    )
  }

  const company = catalog.expand?.company_id
  const shareText = `Confira nossas novas promoções: ${catalog.name}! ${window.location.href}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 shadow-sm text-center flex flex-col items-center sticky top-0 z-10">
        {company?.logo ? (
          <img
            src={pb.files.getURL(company, company.logo)}
            alt={company.name}
            className="h-12 w-auto mb-2 object-contain"
          />
        ) : (
          <h2 className="text-xl font-bold mb-1">{company?.name}</h2>
        )}
        <h1 className="text-md font-medium text-muted-foreground">{catalog.name}</h1>
      </header>

      <div className="p-4 space-y-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            {p.image && (
              <img
                src={pb.files.getURL(p, p.image)}
                alt={p.name}
                className="w-full h-48 object-cover"
              />
            )}
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                {p.promo_price > 0 ? (
                  <>
                    <span className="text-primary font-bold text-xl">
                      R$ {p.promo_price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground line-through text-sm">
                      R$ {p.original_price?.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-primary font-bold text-xl">
                    R$ {p.original_price?.toFixed(2)}
                  </span>
                )}
              </div>
              {p.stock_status === 'out_of_stock' && (
                <span className="inline-block mt-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                  Sem Estoque
                </span>
              )}
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nenhum produto neste catálogo no momento.
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto">
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar no WhatsApp
          </Button>
        </a>
      </div>
    </div>
  )
}

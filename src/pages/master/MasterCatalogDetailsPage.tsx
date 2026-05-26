import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCatalog } from '@/services/catalogs'
import { getProducts } from '@/services/products'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'

export default function MasterCatalogDetailsPage() {
  const { id } = useParams()
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      getCatalog(id).then(setCatalog)
      getProducts(id).then(setProducts)
    }
  }, [id])

  if (!catalog) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">{catalog.name}</h1>
      <p className="text-muted-foreground mb-6">Empresa: {catalog.expand?.company_id?.name}</p>

      <h2 className="text-xl font-semibold mb-4">Produtos</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {products.map((p) => (
          <Card key={p.id}>
            {p.image && (
              <img
                src={pb.files.getURL(p, p.image)}
                alt={p.name}
                className="w-full h-32 object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <CardTitle className="text-lg leading-tight">{p.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
              <p className="font-bold text-primary">
                R$ {p.promo_price > 0 ? p.promo_price : p.original_price}
              </p>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <p className="text-muted-foreground col-span-4 p-4 border border-dashed rounded text-center">
            Nenhum produto cadastrado neste catálogo.
          </p>
        )}
      </div>
    </div>
  )
}

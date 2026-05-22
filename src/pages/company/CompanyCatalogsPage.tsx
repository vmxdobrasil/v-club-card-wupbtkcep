import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCatalogs, getCatalogItems } from '@/services/catalog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'

export default function CompanyCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    Promise.all([getCatalogs(true), getCatalogItems()])
      .then(([cats, items]) => {
        setCatalogs(cats)
        const c: Record<string, number> = {}
        items.forEach((i: any) => {
          c[i.catalog_id] = (c[i.catalog_id] || 0) + 1
        })
        setCounts(c)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Catálogos de Ofertas</h1>
      <p className="text-muted-foreground">
        Confira os catálogos disponíveis para os seus colaboradores.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {catalogs.map((cat) => (
          <Link
            key={cat.id}
            to={`/company/catalogs/${cat.id}`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="aspect-video w-full bg-muted relative">
                {cat.cover_image ? (
                  <img
                    src={pb.files.getURL(cat, cat.cover_image)}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                <Badge className="absolute top-2 right-2">{counts[cat.id] || 0} itens</Badge>
              </div>
              <CardHeader className="p-4 flex-1">
                <CardTitle className="text-lg line-clamp-1">{cat.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {cat.description || 'Sem descrição'}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
        {catalogs.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhum catálogo ativo no momento.
          </div>
        )}
      </div>
    </div>
  )
}

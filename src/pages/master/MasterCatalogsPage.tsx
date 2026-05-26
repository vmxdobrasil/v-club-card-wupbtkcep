import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCatalogs } from '@/services/catalogs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MasterCatalogsPage() {
  const [catalogs, setCatalogs] = useState<any[]>([])

  useEffect(() => {
    getCatalogs().then(setCatalogs)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Catálogos (Master)</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {catalogs.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Empresa: {c.expand?.company_id?.name}
              </p>
              <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge>
              <Link
                to={`/master/catalogs/${c.id}`}
                className="text-blue-500 hover:underline block mt-4 text-sm font-medium"
              >
                Ver detalhes do catálogo
              </Link>
            </CardContent>
          </Card>
        ))}
        {catalogs.length === 0 && (
          <p className="text-muted-foreground">Nenhum catálogo encontrado.</p>
        )}
      </div>
    </div>
  )
}

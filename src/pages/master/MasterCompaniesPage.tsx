import { useEffect, useState, useCallback } from 'react'
import { getCompanies, type Company } from '@/services/companies'
import { useRealtime } from '@/hooks/use-realtime'
import { CompanyManagement } from '@/components/master/CompanyManagement'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function MasterCompaniesPage({
  defaultTab = 'companies',
}: {
  defaultTab?: 'companies' | 'bins'
}) {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setError(null)
    setLoading(true)
    getCompanies()
      .then(setCompanies)
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar as empresas. Verifique sua conexão ou permissões.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('companies', () => {
    getCompanies().then(setCompanies).catch(console.error)
  })

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user?.role !== 'master') {
    return (
      <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>Você não tem permissão para acessar esta seção.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[50vh] space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadData} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CompanyManagement companies={companies} defaultTab={defaultTab} />
    </div>
  )
}

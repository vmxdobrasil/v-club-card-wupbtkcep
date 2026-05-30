import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const { user, isAuthenticated, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Avoid redirect loops by only redirecting if explicitly authenticated and not loading
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'master') navigate('/master', { replace: true })
      else if (user.role === 'company') navigate('/company', { replace: true })
      else if (user.role === 'partner') navigate('/partner', { replace: true })
      else if (user.role === 'holder') navigate('/holder', { replace: true })
    }
  }, [isAuthenticated, user, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    const { error } = await signIn(email, password)
    setIsLoggingIn(false)
    if (error) {
      toast({
        title: 'Erro de Autenticação',
        description: 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando...
      </div>
    )
  }

  // Se já estiver autenticado e o redirecionamento ainda não disparou, exibe estado de carregamento
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Redirecionando para o painel...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full p-6 flex justify-between items-center bg-white shadow-sm border-b">
        <div className="text-2xl font-bold text-blue-600">V Club Card</div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-12 max-w-6xl mx-auto">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Gestão Inteligente para o Seu Cartão
          </h1>
          <p className="text-xl text-gray-600">
            A plataforma completa de cartão private label e co-branded para sua empresa. Aumente a
            fidelidade e as vendas de forma simples e segura.
          </p>
        </div>

        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-gray-900">Acessar Conta</CardTitle>
              <CardDescription>Insira suas credenciais para acessar o painel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base mt-2"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full p-6 text-center text-gray-500 text-sm bg-white border-t">
        &copy; {new Date().getFullYear()} V Club Card. Todos os direitos reservados.
      </footer>
    </div>
  )
}

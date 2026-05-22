import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export default function Index() {
  const { signIn, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isActivating, setIsActivating] = useState(false)
  const [activationStep, setActivationStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(
        `/${user.role === 'holder' ? 'holder' : user.role === 'master' ? 'master' : user.role === 'company' ? 'company' : 'partner'}`,
      )
    }
  }, [isAuthenticated, user, navigate])

  const handleDemoLogin = async (role: 'master' | 'company' | 'partner' | 'holder') => {
    const profiles = {
      master: { email: 'valterpmendonca@gmail.com', path: '/master' },
      company: { email: 'rh@techsolutions.com', path: '/company' },
      partner: { email: 'loja@farmacia.com', path: '/partner' },
      holder: { email: 'joao@techsolutions.com', path: '/holder' },
    }

    const { error } = await signIn(profiles[role].email, 'Skip@Pass')
    if (error) {
      toast({ title: 'Erro', description: 'Credenciais inválidas.', variant: 'destructive' })
    }
  }

  const handleLogin = async () => {
    const { error } = await signIn(email, password)
    if (error) {
      toast({ title: 'Erro', description: 'Credenciais inválidas.', variant: 'destructive' })
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A192F] overflow-hidden p-4">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C5A059] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" />

      <div className="z-10 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20 shadow-xl">
            <span className="text-3xl font-bold italic text-white">V</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            V Club <span className="text-[#C5A059]">Card</span>
          </h1>
          <p className="text-slate-400 mt-2">O ecossistema completo de crédito inteligente.</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
          {!isActivating ? (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Bem-vindo</CardTitle>
                <CardDescription className="text-slate-300">
                  Acesse sua conta ou ative seu cartão.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 text-slate-300">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger
                      value="activate"
                      onClick={() => setIsActivating(true)}
                      className="data-[state=active]:bg-white/20 data-[state=active]:text-white"
                    >
                      Ativar Cartão
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                        <a href="#" className="text-xs text-[#C5A059] hover:underline">
                          Esqueceu?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white"
                      />
                    </div>
                    <Button
                      className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-[#0A192F] font-bold"
                      onClick={handleLogin}
                    >
                      Entrar
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex-col gap-4 border-t border-white/10 pt-6 mt-2">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  Modo Demonstração
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/20 hover:text-white"
                    onClick={() => handleDemoLogin('master')}
                  >
                    Master (VMX)
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/20 hover:text-white"
                    onClick={() => handleDemoLogin('company')}
                  >
                    Empresa (RH)
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/20 hover:text-white"
                    onClick={() => handleDemoLogin('partner')}
                  >
                    Parceiro
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/20 hover:text-white border-[#C5A059]/50 text-[#C5A059]"
                    onClick={() => handleDemoLogin('holder')}
                  >
                    Portador
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Ativação</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActivating(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>

              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full ${step <= activationStep ? 'bg-[#C5A059]' : 'bg-slate-700'}`}
                  />
                ))}
              </div>

              {activationStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <ShieldCheck className="w-12 h-12 text-[#C5A059] mb-4" />
                  <h3 className="text-lg font-medium">Confirme seus dados</h3>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="000.000.000-00"
                      className="bg-slate-900/50 border-slate-700 text-white"
                    />
                  </div>
                  <Button
                    className="w-full bg-[#C5A059] text-[#0A192F] mt-4"
                    onClick={() => setActivationStep(2)}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {activationStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <Smartphone className="w-12 h-12 text-[#C5A059] mb-4" />
                  <h3 className="text-lg font-medium">Validação Facial</h3>
                  <p className="text-sm text-slate-400">
                    Precisamos garantir que é você. Posicione seu rosto no centro.
                  </p>
                  <div className="aspect-video bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center relative overflow-hidden">
                    <div className="w-32 h-40 border-2 border-dashed border-[#C5A059]/50 rounded-[50%] animate-pulse" />
                  </div>
                  <Button
                    className="w-full bg-[#C5A059] text-[#0A192F] mt-4"
                    onClick={() => setActivationStep(3)}
                  >
                    Capturar
                  </Button>
                </div>
              )}

              {activationStep === 3 && (
                <div className="space-y-4 animate-fade-in text-center py-6">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Cartão Ativado!</h3>
                  <p className="text-sm text-slate-400">
                    Seu V Club Card digital já está pronto para uso.
                  </p>
                  <Button
                    className="w-full bg-emerald-500 text-white hover:bg-emerald-600 mt-6"
                    onClick={() => handleDemoLogin('holder')}
                  >
                    Acessar Wallet
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

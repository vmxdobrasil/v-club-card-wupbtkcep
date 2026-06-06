import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center animate-fade-in">
      <div className="bg-muted p-6 rounded-full mb-6 text-muted-foreground shadow-sm">
        <FileSearch className="w-16 h-16" />
      </div>
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Página Não Encontrada</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        O conteúdo que você está procurando não existe, foi removido ou você não tem permissão para
        acessá-lo.
      </p>
      <Button asChild size="lg" className="shadow-md">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { HardHat } from 'lucide-react'

export default function Login() {
  const { login } = useAppContext()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const user = login(username, password)
      setLoading(false)
      if (user) {
        toast.success(`Bem-vindo, ${user.name}!`)
        if (user.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/minha-lista')
        }
      } else {
        toast.error('Usuário ou senha inválidos. Tente novamente.')
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <Card className="w-full max-w-md relative z-10 shadow-elevation animate-fade-in-up border-0 shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-slate-900 dark:bg-slate-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg">
            <HardHat className="text-amber-500 w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hardwork
          </CardTitle>
          <CardDescription>Plataforma de Gestão de Engenheiros</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 pt-4 rounded-b-lg border-t">
          <p className="font-medium mb-1 text-slate-600">Credenciais para teste:</p>
          <p>
            Mestre: <span className="font-mono bg-slate-200 px-1 rounded">eu</span> /{' '}
            <span className="font-mono bg-slate-200 px-1 rounded">123456</span>
          </p>
          <p className="mt-1">
            Admin: <span className="font-mono bg-slate-200 px-1 rounded">admin</span> /{' '}
            <span className="font-mono bg-slate-200 px-1 rounded">123456</span>
          </p>
          <p className="mt-1">
            User: <span className="font-mono bg-slate-200 px-1 rounded">teste</span> /{' '}
            <span className="font-mono bg-slate-200 px-1 rounded">123456</span>
          </p>
        </div>
      </Card>
    </div>
  )
}

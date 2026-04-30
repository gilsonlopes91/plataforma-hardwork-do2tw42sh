import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/app-context'
import { useAuth } from '@/hooks/use-auth'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { HardHat } from 'lucide-react'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

export default function Login() {
  const { login } = useAppContext()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const user = await login(loginEmail, loginPassword)
    setLoading(false)

    if (user) {
      toast.success(`Bem-vindo, ${user.name}!`)
      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/minha-lista')
      }
    } else {
      toast.error('E-mail ou senha inválidos. Tente novamente.')
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regPassword !== regConfirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await signUp(regName, regEmail, regPassword)
    setLoading(false)

    if (error) {
      const fieldErrors = extractFieldErrors(error)
      if (fieldErrors.email) {
        toast.error(`E-mail: ${fieldErrors.email}`)
      } else {
        toast.error(getErrorMessage(error))
      }
    } else {
      toast.success('Conta criada com sucesso!')
      navigate('/minha-lista')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <Card className="w-full max-w-md relative z-10 shadow-elevation animate-fade-in-up border-0 shadow-2xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="mx-auto bg-slate-900 dark:bg-slate-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg">
            <HardHat className="text-amber-500 w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hardwork
          </CardTitle>
          <CardDescription>Plataforma de Gestão de Engenheiros</CardDescription>
        </CardHeader>

        <Tabs defaultValue="login" className="w-full">
          <div className="px-6 pt-2 pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="login"
            className="m-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="exemplo@hardwork.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="******"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </CardFooter>
            </form>
            <div className="px-6 pb-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 pt-4 rounded-b-lg border-t mt-4">
              <p className="font-medium mb-1 text-slate-600 dark:text-slate-400">
                Credenciais para teste:
              </p>
              <p>
                Admin:{' '}
                <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">
                  admin@hardwork.com
                </span>{' '}
                /{' '}
                <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">
                  Skip@2026
                </span>
              </p>
              <p className="mt-1">
                User:{' '}
                <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">
                  teste@hardwork.com
                </span>{' '}
                /{' '}
                <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">
                  Skip@2026
                </span>
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="register"
            className="m-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <form onSubmit={handleRegisterSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome Completo</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="João da Silva"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="exemplo@hardwork.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="******"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Confirmar Senha</Label>
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    placeholder="******"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900"
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Criar Conta'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

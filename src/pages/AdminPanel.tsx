import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getEngineersCount,
  getUserSelections,
  getUsers,
  createUserRecord,
  updateUserRole,
} from '@/services/api'
import { UserSelection, User, Role } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, HardHat, FileSpreadsheet, Activity, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'
import { useAppContext } from '@/context/app-context'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export default function AdminPanel() {
  const { currentUser } = useAppContext()
  const navigate = useNavigate()

  const [selections, setSelections] = useState<UserSelection[]>([])
  const [totalEngineers, setTotalEngineers] = useState(0)
  const [users, setUsers] = useState<User[]>([])

  const [filterUser, setFilterUser] = useState('ALL')
  const [filterName, setFilterName] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      toast.error('Acesso Negado: Apenas administradores podem acessar esta página.')
      navigate('/')
    }
  }, [currentUser, navigate])

  const loadData = async () => {
    try {
      const [s, count, u] = await Promise.all([
        getUserSelections(),
        getEngineersCount(),
        getUsers(),
      ])
      setSelections(s)
      setTotalEngineers(count)
      setUsers(u)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      loadData()
    }
  }, [currentUser])

  useRealtime('user_selections', loadData)
  useRealtime('engineers', loadData)
  useRealtime('users', loadData)

  if (!currentUser || currentUser.role !== 'ADMIN') return null

  const filteredEntries = selections.filter((entry) => {
    if (filterUser !== 'ALL' && entry.user_id !== filterUser) return false
    if (filterStatus !== 'ALL' && entry.esta_conosco !== filterStatus) return false

    const eng = entry.expand?.engineer_id
    if (filterName && eng && !eng.nome_completo.toLowerCase().includes(filterName.toLowerCase()))
      return false
    return true
  })

  const getStatusColor = (status: string) => {
    if (status === 'Sim') return 'bg-green-500 text-white'
    if (status === 'Não') return 'bg-red-500 text-white'
    if (status === 'Talvez') return 'bg-amber-500 text-white'
    return 'bg-slate-200 text-slate-800'
  }

  const totalSim = selections.filter((e) => e.esta_conosco === 'Sim').length

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    try {
      await createUserRecord(newUserName, newUserEmail)
      toast.success('Usuário criado com sucesso. Um e-mail de configuração de senha foi enviado.')
      setIsDialogOpen(false)
      setNewUserName('')
      setNewUserEmail('')
      loadData()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (fieldErrors.email) {
        toast.error(`E-mail inválido ou já em uso: ${fieldErrors.email}`)
      } else {
        toast.error(getErrorMessage(err) || 'Erro ao criar usuário.')
      }
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUserRole(userId, newRole)
      toast.success('Permissão atualizada com sucesso.')
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar permissão.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h2>
        <p className="text-slate-500 mt-1">Visão global de todas as listas e gestão de usuários.</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Gestão de Acessos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-none border-none shadow-elevation">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-500">Engenheiros na Base</CardTitle>
                <HardHat className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalEngineers}</div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-none shadow-elevation">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-500">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-none shadow-elevation">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-500">Está Conosco "Sim"</CardTitle>
                <Activity className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSim}</div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-none shadow-elevation">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-500">Total em Listas</CardTitle>
                <FileSpreadsheet className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{selections.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-none shadow-elevation">
            <CardHeader className="border-b bg-white pb-4">
              <CardTitle>Monitoramento Global</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-slate-500">Usuário</label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-slate-500">Está Conosco</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                      <SelectItem value="Talvez">Talvez</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2] space-y-1">
                  <label className="text-xs text-slate-500">Buscar</label>
                  <Input
                    placeholder="Buscar engenheiro..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Usuário Responsável</TableHead>
                      <TableHead>Engenheiro</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Está Conosco</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="text-right">Última Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhuma seleção encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {entry.expand?.user_id?.name || 'Desconhecido'}
                          </TableCell>
                          <TableCell>
                            {entry.expand?.engineer_id?.nome_completo || 'Desconhecido'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.entrou_em_contato}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'font-medium border-none',
                                getStatusColor(entry.esta_conosco),
                              )}
                            >
                              {entry.esta_conosco}
                            </Badge>
                          </TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {entry.observacoes || '-'}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            {new Date(entry.updated).toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="shadow-sm border-none shadow-elevation">
            <CardHeader className="border-b bg-white pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários do Sistema</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Gerencie os acessos à plataforma.</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateUser}>
                    <DialogHeader>
                      <DialogTitle>Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Cadastre um novo usuário. Ele receberá um e-mail para definir a senha.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Nome Completo"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isCreatingUser}>
                        {isCreatingUser ? 'Salvando...' : 'Salvar Usuário'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Data de Criação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || '-'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(val: Role) => handleRoleChange(u.id, val)}
                              disabled={u.id === currentUser.id}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums text-slate-500">
                            {u.created ? new Date(u.created).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

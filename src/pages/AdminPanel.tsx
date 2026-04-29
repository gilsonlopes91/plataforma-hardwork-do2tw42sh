import { useState, useEffect } from 'react'
import { getEngineers, getUserSelections, getUsers } from '@/services/api'
import { Engineer, UserSelection, User } from '@/types'
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
import { Users, HardHat, FileSpreadsheet, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminPanel() {
  const [selections, setSelections] = useState<UserSelection[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [filterUser, setFilterUser] = useState('ALL')
  const [filterName, setFilterName] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const loadData = async () => {
    try {
      const [s, e, u] = await Promise.all([getUserSelections(), getEngineers(), getUsers()])
      setSelections(s)
      setEngineers(e)
      setUsers(u)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('user_selections', loadData)
  useRealtime('engineers', loadData)
  useRealtime('users', loadData)

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Painel Administrativo</h2>
        <p className="text-slate-500 mt-1">Visão global de todas as listas e atividades.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-none border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-slate-500">Engenheiros na Base</CardTitle>
            <HardHat className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{engineers.length}</div>
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
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.expand?.user_id?.name}</TableCell>
                    <TableCell>{entry.expand?.engineer_id?.nome_completo}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

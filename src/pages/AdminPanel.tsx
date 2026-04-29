import { useState } from 'react'
import { useAppContext } from '@/context/app-context'
import { Status } from '@/types'
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

export default function AdminPanel() {
  const { users, engineers, listEntries } = useAppContext()
  const [filterUser, setFilterUser] = useState('ALL')
  const [filterName, setFilterName] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const filteredEntries = listEntries.filter((entry) => {
    if (filterUser !== 'ALL' && entry.userId !== filterUser) return false
    if (filterStatus !== 'ALL' && entry.status !== filterStatus) return false

    const eng = engineers.find((e) => e.id === entry.engineerId)
    if (filterName && eng && !eng.name.toLowerCase().includes(filterName.toLowerCase()))
      return false

    return true
  })

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Sim':
        return 'bg-green-500 text-white border-none'
      case 'Não':
        return 'bg-red-500 text-white border-none'
      case 'Talvez':
        return 'bg-amber-500 text-white border-none'
      default:
        return 'bg-slate-200 text-slate-800 border-none'
    }
  }

  const totalSim = listEntries.filter((e) => e.status === 'Sim').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Painel Administrativo
        </h2>
        <p className="text-slate-500 mt-1">Visão global de todas as listas e atividades.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Engenheiros na Base
            </CardTitle>
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
              <HardHat className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{engineers.length}</div>
            <p className="text-xs text-slate-500 mt-1">Importados via planilha</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Usuários Ativos</CardTitle>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
            <p className="text-xs text-slate-500 mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Status "Sim"</CardTitle>
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-full">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSim}</div>
            <p className="text-xs text-slate-500 mt-1">Engenheiros confirmados</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none shadow-elevation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total em Listas</CardTitle>
            <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-full">
              <FileSpreadsheet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{listEntries.length}</div>
            <p className="text-xs text-slate-500 mt-1">Adições somadas globalmente</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-none shadow-elevation">
        <CardHeader className="border-b bg-white dark:bg-slate-950 rounded-t-xl pb-4">
          <CardTitle>Monitoramento de Listas Globais</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Filtrar Usuário
              </label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 h-10">
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os usuários</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Filtrar Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 h-10">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                  <SelectItem value="Talvez">Talvez</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[2] space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Buscar Engenheiro
              </label>
              <Input
                placeholder="Buscar por nome..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 h-10"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[200px]">Usuário Responsável</TableHead>
                  <TableHead>Engenheiro</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[200px]">Observação</TableHead>
                  <TableHead className="w-[160px] text-right">Data da Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                      Nenhum registro encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => {
                    const user = users.find((u) => u.id === entry.userId)
                    const eng = engineers.find((e) => e.id === entry.engineerId)
                    return (
                      <TableRow
                        key={entry.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <TableCell className="font-medium">{user?.name}</TableCell>
                        <TableCell>{eng?.name}</TableCell>
                        <TableCell>
                          <Badge className={cn('font-medium', getStatusColor(entry.status))}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-[250px] truncate text-slate-600 dark:text-slate-400"
                          title={entry.observation}
                        >
                          {entry.observation || '-'}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                          {new Date(entry.lastActionDate).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

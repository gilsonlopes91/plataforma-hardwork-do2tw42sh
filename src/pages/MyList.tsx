import { useState, useEffect } from 'react'
import { useAppContext } from '@/context/app-context'
import { Engineer, UserSelection } from '@/types'
import {
  getEngineers,
  getUserSelections,
  createUserSelection,
  updateUserSelection,
  deleteUserSelection,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Eye, Trash2, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

export default function MyList() {
  const { currentUser } = useAppContext()
  const [search, setSearch] = useState('')
  const [openCombo, setOpenCombo] = useState(false)
  const [selectedEngDetails, setSelectedEngDetails] = useState<Engineer | null>(null)

  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [myList, setMyList] = useState<UserSelection[]>([])

  const loadData = async () => {
    if (!currentUser) return
    try {
      const [engs, sels] = await Promise.all([getEngineers(), getUserSelections(currentUser.id)])
      setEngineers(engs)
      setMyList(sels)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUser])
  useRealtime('user_selections', loadData)

  const handleAdd = async (engineerId: string) => {
    if (!currentUser) return
    try {
      await createUserSelection(currentUser.id, engineerId)
      toast.success('Engenheiro adicionado à sua lista!')
      loadData()
    } catch (e) {
      toast.error('Erro ao adicionar engenheiro.')
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await deleteUserSelection(id)
      toast.success('Removido da lista.')
      loadData()
    } catch (e) {
      toast.error('Erro ao remover.')
    }
  }

  const handleUpdate = async (id: string, data: Partial<UserSelection>) => {
    try {
      await updateUserSelection(id, data)
      toast.success('Atualizado com sucesso!')
      loadData()
    } catch (e) {
      toast.error('Erro ao atualizar.')
    }
  }

  const availableEngineers = engineers.filter(
    (eng) => !myList.some((e) => e.engineer_id === eng.id),
  )

  const filteredMyList = myList.filter((entry) => {
    const eng = entry.expand?.engineer_id
    if (!eng) return false
    return eng.nome_completo.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Minha Lista</h2>
          <p className="text-slate-500 mt-1">
            Gerencie os engenheiros selecionados para o seu acompanhamento.
          </p>
        </div>

        <Popover open={openCombo} onOpenChange={setOpenCombo}>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              className="w-full md:w-[300px] justify-between bg-amber-500 hover:bg-amber-600 text-white"
            >
              Adicionar Engenheiro...
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full md:w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar por nome..." />
              <CommandList>
                <CommandEmpty>Nenhum engenheiro encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableEngineers.map((eng) => (
                    <CommandItem
                      key={eng.id}
                      value={eng.nome_completo}
                      onSelect={() => {
                        handleAdd(eng.id)
                        setOpenCombo(false)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4 text-amber-500" />
                      {eng.nome_completo}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-sm border-0 shadow-elevation">
        <CardHeader className="pb-3 border-b bg-white rounded-t-xl flex flex-col md:flex-row justify-between gap-4">
          <CardTitle>Engenheiros Selecionados</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Filtrar na minha lista..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Está Conosco</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Última Ação</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMyList.map((entry) => {
                  const eng = entry.expand?.engineer_id
                  if (!eng) return null
                  return (
                    <TableRow key={entry.id} className="group hover:bg-slate-50/80">
                      <TableCell className="font-medium flex items-center gap-2">
                        {eng.nome_completo}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-blue-600"
                          onClick={() => setSelectedEngDetails(eng)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.entrou_em_contato}
                          onValueChange={(v) =>
                            handleUpdate(entry.id, { entrou_em_contato: v as any })
                          }
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.esta_conosco}
                          onValueChange={(v) => handleUpdate(entry.id, { esta_conosco: v as any })}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                            <SelectItem value="Talvez">Talvez</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          defaultValue={entry.observacoes}
                          placeholder="Nota..."
                          className="h-8 min-w-[150px]"
                          onBlur={(e) => {
                            if (e.target.value !== entry.observacoes)
                              handleUpdate(entry.id, { observacoes: e.target.value })
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                        {new Date(entry.updated).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemove(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedEngDetails}
        onOpenChange={(val) => !val && setSelectedEngDetails(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Engenheiro</DialogTitle>
          </DialogHeader>
          {selectedEngDetails && (
            <div className="grid grid-cols-2 gap-4 py-4 bg-slate-50 p-6 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">Nome</p>
                <p className="text-sm font-semibold">{selectedEngDetails.nome_completo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cidade</p>
                <p className="text-sm font-semibold">{selectedEngDetails.cidade}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Título</p>
                <p className="text-sm font-semibold">{selectedEngDetails.titulo_}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">E-mail</p>
                <p className="text-sm font-semibold">{selectedEngDetails.e_mail}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState } from 'react'
import { useAppContext } from '@/context/app-context'
import { Engineer, Status } from '@/types'
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Eye, Trash2, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MyList() {
  const { currentUser, engineers, listEntries, addToList, updateEntry, removeEntry } =
    useAppContext()
  const [search, setSearch] = useState('')
  const [openCombo, setOpenCombo] = useState(false)
  const [selectedEngDetails, setSelectedEngDetails] = useState<Engineer | null>(null)

  const myList = listEntries.filter((e) => e.userId === currentUser?.id)

  const availableEngineers = engineers.filter((eng) => !myList.some((e) => e.engineerId === eng.id))

  const filteredMyList = myList.filter((entry) => {
    const eng = engineers.find((e) => e.id === entry.engineerId)
    if (!eng) return false
    return eng.name.toLowerCase().includes(search.toLowerCase())
  })

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Sim':
        return 'bg-green-500 hover:bg-green-600 text-white border-none'
      case 'Não':
        return 'bg-red-500 hover:bg-red-600 text-white border-none'
      case 'Talvez':
        return 'bg-amber-500 hover:bg-amber-600 text-white border-none'
      default:
        return 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-none'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Minha Lista
          </h2>
          <p className="text-slate-500 mt-1">
            Gerencie os engenheiros selecionados para o seu acompanhamento.
          </p>
        </div>

        <Popover open={openCombo} onOpenChange={setOpenCombo}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              aria-expanded={openCombo}
              className="w-full md:w-[300px] justify-between bg-amber-500 hover:bg-amber-600 text-white"
            >
              Adicionar Engenheiro...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full md:w-[300px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Buscar na base geral..." />
              <CommandList>
                <CommandEmpty>Nenhum engenheiro encontrado.</CommandEmpty>
                <CommandGroup>
                  {availableEngineers.map((eng) => (
                    <CommandItem
                      key={eng.id}
                      value={eng.name}
                      onSelect={() => {
                        addToList(eng.id)
                        setOpenCombo(false)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4 text-amber-500" />
                      {eng.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="shadow-sm border-0 shadow-elevation">
        <CardHeader className="pb-3 border-b bg-white dark:bg-slate-950 rounded-t-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Engenheiros Selecionados</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Filtrar por nome na minha lista..."
                className="pl-9 h-9 bg-slate-50 dark:bg-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMyList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Nenhum engenheiro encontrado
              </p>
              <p className="text-sm mt-1">Use o botão acima para adicionar da base central.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead className="w-[120px]">Planilha</TableHead>
                    <TableHead className="w-[160px]">Status</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="w-[140px] text-right">Última Ação</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMyList.map((entry) => {
                    const eng = engineers.find((e) => e.id === entry.engineerId)
                    if (!eng) return null

                    return (
                      <TableRow
                        key={entry.id}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-colors"
                      >
                        <TableCell className="font-medium">{eng.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEngDetails(eng)}
                            className="h-8 flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">Ver</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.status}
                            onValueChange={(val) =>
                              updateEntry(entry.id, val as Status, entry.observation)
                            }
                          >
                            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 p-1 focus:ring-0 shadow-none w-fit">
                              <Badge className={cn('cursor-pointer', getStatusColor(entry.status))}>
                                {entry.status}
                              </Badge>
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
                            defaultValue={entry.observation}
                            placeholder="Adicionar nota..."
                            className="h-8 text-sm bg-transparent border-transparent hover:border-input focus:bg-background transition-all min-w-[200px]"
                            onBlur={(e) => {
                              if (e.target.value !== entry.observation) {
                                updateEntry(entry.id, entry.status, e.target.value)
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') e.currentTarget.blur()
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500 tabular-nums">
                          {new Date(entry.lastActionDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => removeEntry(entry.id)}
                            title="Remover da lista"
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
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedEngDetails}
        onOpenChange={(val) => !val && setSelectedEngDetails(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Planilha Mestra</DialogTitle>
          </DialogHeader>
          {selectedEngDetails && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 py-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg mt-2">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">Nome Completo</p>
                <p className="text-sm font-semibold">{selectedEngDetails.name}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">CREA</p>
                <p className="text-sm font-semibold">{selectedEngDetails.crea}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">Telefone</p>
                <p className="text-sm font-semibold">{selectedEngDetails.phone}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">Função</p>
                <p className="text-sm font-semibold">{selectedEngDetails.role}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">Cidade</p>
                <p className="text-sm font-semibold">{selectedEngDetails.city}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 font-medium mb-1">Estado</p>
                <p className="text-sm font-semibold">{selectedEngDetails.state}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

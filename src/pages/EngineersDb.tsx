import { useState, useEffect } from 'react'
import { getEngineers, getUserSelections, createUserSelection } from '@/services/api'
import { Engineer } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  UploadCloud,
  FileSpreadsheet,
  Search,
  Info,
  Download,
  Trash2,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useRealtime } from '@/hooks/use-realtime'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function EngineersDb() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showDeleteAll, setShowDeleteAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mySelections, setMySelections] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const data = await getEngineers(search)
      setEngineers(data.items)
      setTotalCount(data.totalItems)

      if (user?.id) {
        const sels = await getUserSelections(user.id)
        setMySelections(new Set(sels.map((s) => s.engineer_id)))
      }
    } catch (err) {
      toast.error('Erro ao carregar engenheiros')
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(delay)
  }, [search, user?.id])

  useRealtime('engineers', loadData)
  useRealtime('user_selections', loadData)

  const handleAddToMyList = async (engId: string) => {
    if (!user?.id) return
    setIsAdding(engId)
    try {
      await createUserSelection(user.id, engId)
      toast.success('Engenheiro adicionado à sua lista!')
      setMySelections((prev) => new Set(prev).add(engId))
    } catch (err: any) {
      toast.error(err.response?.message || 'Erro ao adicionar à lista.')
    } finally {
      setIsAdding(null)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await pb.send('/backend/v1/import-engineers/template', { method: 'GET' })
      const blob = new Blob([res.template], {
        type: 'text/csv;charset=utf-8;',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Template_Engenheiros.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Erro ao baixar template')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const result = event.target?.result as string | undefined
      if (!result) {
        toast.error('Erro ao ler conteúdo do arquivo.')
        setIsUploading(false)
        return
      }
      try {
        const res = await pb.send('/backend/v1/import-engineers', {
          method: 'POST',
          body: JSON.stringify({ payload: result }),
        })
        setImportResult(res)
        if (res.failed > 0) {
          toast.warning(`Importação finalizada: ${res.success} salvos, ${res.failed} falharam.`)
        } else {
          toast.success(`${res.success} registros importados com sucesso!`)
        }
        loadData()
      } catch (err: any) {
        toast.error(err.response?.message || 'Erro ao processar o arquivo.')
      } finally {
        setIsUploading(false)
        e.target.value = ''
      }
    }
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo selecionado.')
      setIsUploading(false)
    }
    reader.readAsText(file)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(engineers.map((e) => e.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const allSelected = engineers.length > 0 && engineers.every((e) => selectedIds.has(e.id))
  const someSelected = selectedIds.size > 0 && !allSelected

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true)
      await pb.send('/backend/v1/engineers/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      toast.success(`${selectedIds.size} registro(s) excluído(s) com sucesso`)
      setSelectedIds(new Set())
      loadData()
    } catch (err: any) {
      toast.error(err.response?.message || 'Erro ao excluir registros')
    } finally {
      setIsDeleting(false)
      setShowBulkDelete(false)
    }
  }

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true)
      await pb.send('/backend/v1/engineers/all', {
        method: 'DELETE',
      })
      toast.success('Todos os registros foram excluídos com sucesso')
      setSelectedIds(new Set())
      loadData()
    } catch (err: any) {
      toast.error(err.response?.message || 'Erro ao excluir registros')
    } finally {
      setIsDeleting(false)
      setShowDeleteAll(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Banco de Engenheiros
        </h2>
        <p className="text-slate-500 mt-1">Gerencie a base central de engenheiros.</p>
      </div>

      {isAdmin && (
        <>
          <Alert className="bg-blue-50/50 border-blue-200 text-blue-900 shadow-sm">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-950 font-semibold text-lg ml-2">
              Guia de Upload e Integridade de Dados
            </AlertTitle>
            <AlertDescription className="mt-3 text-blue-800 space-y-4 ml-2">
              <p className="leading-relaxed">
                A importação de uma nova planilha popula a base central de{' '}
                <strong>engenheiros</strong>. Siga as instruções abaixo para evitar erros durante o
                processo:
              </p>

              <ul className="list-disc list-inside space-y-2 marker:text-blue-500">
                <li>
                  O arquivo deve ser obrigatoriamente no formato <strong>.csv</strong> (exportado da
                  sua <strong>PLANILHA ENG CIVIL.xlsx</strong>) e separado por ponto e vírgula (
                  <strong>;</strong>).
                </li>
                <li>
                  A coluna{' '}
                  <code className="bg-blue-100 px-1.5 py-0.5 rounded text-sm font-mono">
                    nome_completo
                  </code>{' '}
                  é <strong>obrigatória</strong> para todos os registros.
                </li>
                <li>
                  As 9 colunas exigidas são: <strong>numero_formatado</strong>,{' '}
                  <strong>nome_salvo</strong>, <strong>nome_publico</strong>,{' '}
                  <strong>nome_completo</strong>, <strong>e_mail</strong>, <strong>titulo_</strong>,{' '}
                  <strong>cidade</strong>, <strong>inspetoria</strong> e{' '}
                  <strong>status_2026</strong>.
                </li>
              </ul>

              <Button onClick={handleDownloadTemplate} variant="outline" className="mt-2 bg-white">
                <Download className="w-4 h-4 mr-2" /> Baixar Template (.csv)
              </Button>
            </AlertDescription>
          </Alert>

          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <UploadCloud className="h-5 w-5" />
                Importar Dados
              </CardTitle>
              <CardDescription>
                Faça upload do arquivo CSV para atualizar a base (Upsert ativo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 mb-2 text-blue-400" />
                    )}
                    <p className="mb-2 text-sm text-slate-600">
                      <span className="font-semibold text-blue-600">Clique para fazer upload</span>{' '}
                      ou arraste o arquivo
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {importResult && (
                <Alert
                  className={`mt-4 ${importResult.failed > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}
                >
                  <AlertTitle
                    className={importResult.failed > 0 ? 'text-amber-900' : 'text-green-900'}
                  >
                    Resultado da Importação
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-green-800">
                        <strong>Sucesso:</strong> {importResult.success} registros
                        criados/atualizados.
                      </span>
                      <span className="text-amber-800">
                        <strong>Falhas:</strong> {importResult.failed} registros não processados.
                      </span>
                      {importResult.errors.length > 0 && (
                        <div className="mt-3 max-h-40 overflow-y-auto text-xs bg-white p-2 rounded border border-amber-200">
                          {importResult.errors.map((err, i) => (
                            <div key={i} className="text-red-600 mb-1">
                              {err}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="shadow-sm border-none shadow-elevation">
        <CardHeader className="pb-3 border-b bg-white flex flex-col md:flex-row justify-between gap-4 rounded-t-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <CardTitle className="whitespace-nowrap">
              Base de Dados Completa{' '}
              <span className="text-slate-400 text-sm ml-2 font-normal">
                ({totalCount} registros)
              </span>
            </CardTitle>
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedIds.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionados ({selectedIds.size})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowDeleteAll(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Tudo
                </Button>
              </div>
            )}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome ou cidade..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-[50px] text-center">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(c) => handleSelectAll(c === true)}
                        aria-label="Selecionar todos"
                      />
                    </TableHead>
                  )}
                  <TableHead>NÚMERO FORMATADO</TableHead>
                  <TableHead>NOME SALVO</TableHead>
                  <TableHead>NOME PÚBLICO</TableHead>
                  <TableHead className="min-w-[200px]">NOME COMPLETO</TableHead>
                  <TableHead>E-MAIL</TableHead>
                  <TableHead>TÍTULO</TableHead>
                  <TableHead>CIDADE</TableHead>
                  <TableHead>INSPETORIA</TableHead>
                  <TableHead>STATUS 2026</TableHead>
                  <TableHead className="text-right">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 11 : 10}
                      className="text-center py-8 text-slate-500"
                    >
                      Nenhum engenheiro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  engineers.map((eng) => (
                    <TableRow key={eng.id} className="hover:bg-slate-50/50">
                      {isAdmin && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIds.has(eng.id)}
                            onCheckedChange={(c) => handleSelectRow(eng.id, c === true)}
                            aria-label={`Selecionar ${eng.nome_completo}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>{eng.numero_formatado}</TableCell>
                      <TableCell>{eng.nome_salvo}</TableCell>
                      <TableCell>{eng.nome_publico}</TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {eng.nome_completo}
                      </TableCell>
                      <TableCell>{eng.e_mail}</TableCell>
                      <TableCell>{eng.titulo_}</TableCell>
                      <TableCell>{eng.cidade}</TableCell>
                      <TableCell>{eng.inspetoria}</TableCell>
                      <TableCell>{eng.status_2026}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handleAddToMyList(eng.id)}
                          disabled={mySelections.has(eng.id) || isAdding === eng.id}
                        >
                          {mySelections.has(eng.id) ? (
                            'Adicionado'
                          ) : isAdding === eng.id ? (
                            'Adicionando...'
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" /> Lista
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registros selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{selectedIds.size}</strong> engenheiro(s)? Esta
              ação também removerá as seleções de listas associadas a eles e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleBulkDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Atenção: Exclusão em Massa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-700">
              Esta ação é <strong>irreversível</strong>. Deseja realmente apagar{' '}
              <strong>todos os registros</strong> do banco de dados de engenheiros? Todas as listas
              e seleções de usuários também serão apagadas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteAll()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir Tudo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

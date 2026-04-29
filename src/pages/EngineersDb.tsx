import { useState, useEffect } from 'react'
import { getEngineers } from '@/services/api'
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
import { UploadCloud, FileSpreadsheet, Search, Info, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useRealtime } from '@/hooks/use-realtime'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'

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

  const loadData = async () => {
    try {
      const data = await getEngineers(search)
      setEngineers(data.items)
      setTotalCount(data.totalItems)
    } catch (err) {
      toast.error('Erro ao carregar engenheiros')
    }
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(delay)
  }, [search])

  useRealtime('engineers', loadData)

  const handleDownloadTemplate = async () => {
    try {
      const res = await pb.send('/backend/v1/import-engineers/template', { method: 'GET' })
      const bstr = atob(res.template)
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Template_Engenheiros.xlsx'
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
      const base64 = (event.target?.result as string).split(',')[1]
      try {
        const res = await pb.send('/backend/v1/import-engineers', {
          method: 'POST',
          body: JSON.stringify({ payload: base64 }),
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
    reader.readAsDataURL(file)
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
                  O arquivo deve ser obrigatoriamente no formato <strong>.xlsx</strong>.
                </li>
                <li>
                  A coluna{' '}
                  <code className="bg-blue-100 px-1.5 py-0.5 rounded text-sm font-mono">
                    nome_completo
                  </code>{' '}
                  é <strong>obrigatória</strong> para todos os registros.
                </li>
                <li>
                  Os nomes das colunas devem ser exatos. Utilize o botão abaixo para baixar um
                  modelo com as colunas já formatadas corretamente.
                </li>
              </ul>

              <Button onClick={handleDownloadTemplate} variant="outline" className="mt-2 bg-white">
                <Download className="w-4 h-4 mr-2" /> Baixar Template (.xlsx)
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
                Faça upload do arquivo Excel para atualizar a base (Upsert ativo).
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
                    accept=".xlsx"
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
          <CardTitle>
            Base de Dados Completa{' '}
            <span className="text-slate-400 text-sm ml-2 font-normal">
              ({totalCount} registros)
            </span>
          </CardTitle>
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
                  <TableHead>Número</TableHead>
                  <TableHead>Num Corrigido</TableHead>
                  <TableHead>Num Formatado</TableHead>
                  <TableHead>Nome Salvo</TableHead>
                  <TableHead>Nome Público</TableHead>
                  <TableHead className="min-w-[200px]">Nome Completo</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Inspetoria</TableHead>
                  <TableHead>Status 2026</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                      Nenhum engenheiro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  engineers.map((eng) => (
                    <TableRow key={eng.id} className="hover:bg-slate-50/50">
                      <TableCell>{eng.numero}</TableCell>
                      <TableCell>{eng.numero_corrigido}</TableCell>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

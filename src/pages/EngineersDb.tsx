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
import { UploadCloud, FileSpreadsheet, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { useRealtime } from '@/hooks/use-realtime'

export default function EngineersDb() {
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [totalCount, setTotalCount] = useState(0)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      // Import requires backend implementation to process Excel properly
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.info(`O processamento do arquivo "${file.name}" requer integração no backend.`)
    } catch (err) {
      toast.error('Erro ao processar o arquivo.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
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

      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <UploadCloud className="h-5 w-5" />
            Importar Dados
          </CardTitle>
          <CardDescription>Faça upload do arquivo Excel para atualizar a base.</CardDescription>
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
                  <span className="font-semibold text-blue-600">Clique para fazer upload</span> ou
                  arraste o arquivo
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
        </CardContent>
      </Card>

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

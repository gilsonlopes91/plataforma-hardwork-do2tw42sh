import { useState } from 'react'
import { useAppContext } from '@/context/app-context'
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

export default function EngineersDb() {
  const { engineers, importEngineers } = useAppContext()
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    setTimeout(() => {
      const newEngs = [
        {
          id: `e${Date.now()}_1`,
          name: 'Engenheiro Adicionado ' + Math.floor(Math.random() * 100),
          crea: `${Math.floor(Math.random() * 90000) + 10000}/UF`,
          phone: '(11) 90000-0000',
          role: 'Engenheiro Civil',
          city: 'São Paulo',
          state: 'SP',
        },
        {
          id: `e${Date.now()}_2`,
          name: 'Arquiteta Adicionada ' + Math.floor(Math.random() * 100),
          crea: `${Math.floor(Math.random() * 90000) + 10000}/UF`,
          phone: '(21) 90000-0000',
          role: 'Arquiteto',
          city: 'Rio de Janeiro',
          state: 'RJ',
        },
      ]
      importEngineers([...engineers, ...newEngs])
      setIsUploading(false)
      toast.success(
        `Planilha "${file.name}" importada com sucesso! ${newEngs.length} registros adicionados.`,
      )
      e.target.value = ''
    }, 1500)
  }

  const filteredEngineers = engineers.filter(
    (eng) =>
      eng.name.toLowerCase().includes(search.toLowerCase()) ||
      eng.crea.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Banco de Engenheiros
        </h2>
        <p className="text-slate-500 mt-1">Gerencie a base central importada da Planilha Mestra.</p>
      </div>

      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <UploadCloud className="h-5 w-5" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Faça upload do arquivo{' '}
            <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">
              PLANILHA-ENG-CIVIL.xlsx
            </code>{' '}
            para atualizar a base central do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 dark:border-blue-800 border-dashed rounded-lg cursor-pointer bg-white dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                ) : (
                  <FileSpreadsheet className="w-8 h-8 mb-2 text-blue-400" />
                )}
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Clique para fazer upload
                  </span>{' '}
                  ou arraste o arquivo
                </p>
                <p className="text-xs text-slate-400">Somente arquivos Excel (.xlsx)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none shadow-elevation">
        <CardHeader className="pb-3 border-b bg-white dark:bg-slate-950 rounded-t-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <CardTitle>
            Base de Dados Completa{' '}
            <span className="text-slate-400 text-sm ml-2 font-normal">
              ({engineers.length} registros)
            </span>
          </CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome ou CREA..."
              className="pl-9 h-9 bg-slate-50 dark:bg-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-900 shadow-sm z-10">
                <TableRow>
                  <TableHead className="font-semibold">Nome Completo</TableHead>
                  <TableHead className="font-semibold">CREA</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                  <TableHead className="font-semibold">Função</TableHead>
                  <TableHead className="font-semibold">Localidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEngineers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhum engenheiro encontrado na base.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEngineers.map((eng) => (
                    <TableRow
                      key={eng.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {eng.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {eng.crea}
                      </TableCell>
                      <TableCell className="tabular-nums text-slate-600 dark:text-slate-400">
                        {eng.phone}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {eng.role}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {eng.city} - {eng.state}
                      </TableCell>
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

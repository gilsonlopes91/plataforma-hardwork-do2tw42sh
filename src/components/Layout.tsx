import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAppContext } from '@/context/app-context'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function Layout() {
  const { currentUser, logout } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  if (!currentUser) {
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />
    }
    return <Outlet />
  }

  if (currentUser && location.pathname === '/') {
    return <Navigate to={currentUser.role === 'ADMIN' ? '/admin' : '/minha-lista'} replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between bg-white dark:bg-slate-950 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="font-bold text-xl text-slate-900 dark:text-white md:hidden">Hardwork</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {currentUser.name}
              </span>
              <span className="text-xs text-slate-500">
                {currentUser.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] relative overflow-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

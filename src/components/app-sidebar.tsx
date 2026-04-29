import { Link, useLocation } from 'react-router-dom'
import { List, LayoutDashboard, Database, HardHat } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAppContext } from '@/context/app-context'

export function AppSidebar() {
  const { currentUser } = useAppContext()
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-1.5 rounded-md">
            <HardHat className="text-white w-5 h-5" />
          </div>
          <h2 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Hardwork
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/minha-lista'}>
                  <Link to="/minha-lista">
                    <List />
                    <span>Minha Lista</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {currentUser?.role === 'ADMIN' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/admin'}>
                      <Link to="/admin">
                        <LayoutDashboard />
                        <span>Painel Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === '/banco-engenheiros'}
                    >
                      <Link to="/banco-engenheiros">
                        <Database />
                        <span>Banco de Engenheiros</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

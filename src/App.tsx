import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/context/app-context'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import MyList from '@/pages/MyList'
import AdminPanel from '@/pages/AdminPanel'
import EngineersDb from '@/pages/EngineersDb'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Login />} />
            <Route path="/minha-lista" element={<MyList />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/banco-engenheiros" element={<EngineersDb />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AppProvider>
  </BrowserRouter>
)

export default App

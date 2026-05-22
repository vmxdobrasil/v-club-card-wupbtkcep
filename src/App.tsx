import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import MasterDashboard from './pages/master/MasterDashboard'
import CompanyDashboard from './pages/company/CompanyDashboard'
import HolderDashboard from './pages/holder/HolderDashboard'
import PartnerDashboard from './pages/partner/PartnerDashboard'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/master" element={<MasterDashboard />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/holder" element={<HolderDashboard />} />
          <Route path="/partner" element={<PartnerDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App

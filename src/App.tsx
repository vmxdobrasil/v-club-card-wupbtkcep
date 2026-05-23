import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import MasterDashboard from './pages/master/MasterDashboard'
import MasterCompaniesPage from './pages/master/MasterCompaniesPage'
import MasterPartnersPage from './pages/master/MasterPartnersPage'
import MasterProductsPage from './pages/master/MasterProductsPage'
import MasterCatalogsPage from './pages/master/MasterCatalogsPage'
import MasterCatalogDetailsPage from './pages/master/MasterCatalogDetailsPage'
import CompanyDashboard from './pages/company/CompanyDashboard'
import CompanyCatalogsPage from './pages/company/CompanyCatalogsPage'
import CompanyCatalogDetailsPage from './pages/company/CompanyCatalogDetailsPage'
import HolderDashboard from './pages/holder/HolderDashboard'
import PartnerDashboard from './pages/partner/PartnerDashboard'
import PartnerProductsPage from './pages/partner/PartnerProductsPage'
import PartnerCatalogsPage from './pages/partner/PartnerCatalogsPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/master" element={<MasterDashboard />} />
            <Route
              path="/master/companies"
              element={<MasterCompaniesPage defaultTab="companies" />}
            />
            <Route path="/master/bin" element={<MasterCompaniesPage defaultTab="bins" />} />
            <Route path="/master/partners" element={<MasterPartnersPage />} />
            <Route path="/master/products" element={<MasterProductsPage />} />
            <Route path="/master/catalogs" element={<MasterCatalogsPage />} />
            <Route path="/master/catalogs/:id" element={<MasterCatalogDetailsPage />} />
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/catalogs" element={<CompanyCatalogsPage />} />
            <Route path="/company/catalogs/:id" element={<CompanyCatalogDetailsPage />} />
            <Route path="/holder" element={<HolderDashboard />} />
            <Route path="/partner" element={<PartnerDashboard />} />
            <Route path="/partner/products" element={<PartnerProductsPage />} />
            <Route path="/partner/catalogs" element={<PartnerCatalogsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from '@/components/Layout'
import { MasterLayout } from '@/components/MasterLayout'
import { DashboardLayout } from '@/components/DashboardLayout'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import MasterDashboard from '@/pages/master/MasterDashboard'
import MasterCompaniesPage from '@/pages/master/MasterCompaniesPage'
import MasterPartnersPage from '@/pages/master/MasterPartnersPage'
import MasterProductsPage from '@/pages/master/MasterProductsPage'
import MasterCatalogsPage from '@/pages/master/MasterCatalogsPage'
import MasterCatalogDetailsPage from '@/pages/master/MasterCatalogDetailsPage'
import CompanyDashboard from '@/pages/company/CompanyDashboard'
import CompanyCatalogsPage from '@/pages/company/CompanyCatalogsPage'
import CompanyCatalogDetailsPage from '@/pages/company/CompanyCatalogDetailsPage'
import CompanyAIAgentPage from '@/pages/company/CompanyAIAgentPage'
import PublicCatalogPage from '@/pages/public/PublicCatalogPage'
import HolderDashboard from '@/pages/holder/HolderDashboard'
import PartnerDashboard from '@/pages/partner/PartnerDashboard'
import PartnerProductsPage from '@/pages/partner/PartnerProductsPage'
import PartnerCatalogsPage from '@/pages/partner/PartnerCatalogsPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/catalog/:slug" element={<PublicCatalogPage />} />

            <Route path="/master" element={<MasterLayout />}>
              <Route index element={<MasterDashboard />} />
              <Route path="companies" element={<MasterCompaniesPage defaultTab="companies" />} />
              <Route path="bin" element={<MasterCompaniesPage defaultTab="bins" />} />
              <Route path="partners" element={<MasterPartnersPage />} />
              <Route path="products" element={<MasterProductsPage />} />
              <Route path="catalogs" element={<MasterCatalogsPage />} />
              <Route path="catalogs/:id" element={<MasterCatalogDetailsPage />} />
            </Route>

            <Route path="/bin" element={<MasterLayout />}>
              <Route index element={<MasterCompaniesPage defaultTab="bins" />} />
            </Route>
            <Route path="/partners" element={<MasterLayout />}>
              <Route index element={<MasterPartnersPage />} />
            </Route>
            <Route path="/products" element={<MasterLayout />}>
              <Route index element={<MasterProductsPage />} />
            </Route>
            <Route path="/catalogs/:id" element={<MasterLayout />}>
              <Route index element={<MasterCatalogDetailsPage />} />
            </Route>

            <Route path="/company" element={<DashboardLayout role="company" />}>
              <Route index element={<CompanyDashboard />} />
              <Route path="catalogs" element={<CompanyCatalogsPage />} />
              <Route path="catalogs/:id" element={<CompanyCatalogDetailsPage />} />
              <Route path="ai-agent" element={<CompanyAIAgentPage />} />
            </Route>

            <Route path="/holder" element={<DashboardLayout role="holder" />}>
              <Route index element={<HolderDashboard />} />
            </Route>

            <Route path="/partner" element={<DashboardLayout role="partner" />}>
              <Route index element={<PartnerDashboard />} />
              <Route path="products" element={<PartnerProductsPage />} />
              <Route path="catalogs" element={<PartnerCatalogsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App

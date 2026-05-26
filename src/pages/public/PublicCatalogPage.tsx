import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getCatalogBySlug, Catalog } from '@/services/catalogs'
import { Product } from '@/services/products'
import { Company } from '@/services/companies'
import { Button } from '@/components/ui/button'
import { Share2, MessageCircle, Link as LinkIcon, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import { AIWidget } from '@/components/AIWidget'

export default function PublicCatalogPage() {
  const { slug } = useParams()
  const [catalog, setCatalog] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (slug) {
      getCatalogBySlug(slug)
        .then((res) => setCatalog(res))
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }
  }, [slug])

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading catalog...
      </div>
    )
  if (error || !catalog || catalog.status !== 'active')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
        <h2 className="text-2xl font-bold mb-2">Catalog not found</h2>
        <p>This catalog may have been removed or is currently inactive.</p>
      </div>
    )

  const company: Company = catalog.expand?.company_id
  const products: Product[] = catalog.expand?.product_ids || []

  const shareUrl = window.location.href
  const shareText = `Check out our new catalog: ${catalog.title}!`

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  const pbUrl = import.meta.env.VITE_POCKETBASE_URL

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-28">
      {/* Header Banner */}
      <div className="relative w-full h-[28vh] md:h-[40vh] bg-slate-900 overflow-hidden">
        {catalog.banner && (
          <img
            src={`${pbUrl}/api/files/catalogs/${catalog.id}/${catalog.banner}`}
            alt="Banner"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4">
            {catalog.title}
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90 max-w-2xl animate-in fade-in slide-in-from-bottom-6">
            {catalog.description}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {company?.logo ? (
              <img
                src={`${pbUrl}/api/files/companies/${company.id}/${company.logo}`}
                alt={company.name}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-white object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white shadow-md bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                {company?.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company?.name}</h2>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {company?.category}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Button
              variant="outline"
              className="rounded-full shadow-sm"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
                  '_blank',
                )
              }
            >
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              className="rounded-full shadow-sm"
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                  '_blank',
                )
              }
            >
              <Facebook className="w-4 h-4 mr-2 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" className="rounded-full shadow-sm" onClick={copyLink}>
              <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-700">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {p.image ? (
                  <img
                    src={`${pbUrl}/api/files/products/${p.id}/${p.image}`}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm border">
                  {p.category}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-extrabold text-lg text-primary">${p.price.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-dashed">
              <PackageOpenIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">No products available in this catalog.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Widget */}
      <AIWidget companyId={company?.id} catalogId={catalog.id} />
    </div>
  )
}

function PackageOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-9" />
      <path d="M15.17 2.38a2 2 0 0 0-2.34 0l-7.26 5.4a2 2 0 0 0-.82 1.62v7.2a2 2 0 0 0 1.18 1.83l6.09 3.05a2 2 0 0 0 1.78 0l6.1-3.05a2 2 0 0 0 1.17-1.83v-7.2a2 2 0 0 0-.82-1.62Z" />
      <path d="m20 10.5-8.5-4" />
      <path d="M4 10.5 12.5 6" />
    </svg>
  )
}

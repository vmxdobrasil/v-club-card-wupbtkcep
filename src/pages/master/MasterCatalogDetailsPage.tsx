import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCatalog, updateCatalog, Catalog } from '@/services/catalogs'
import { getProducts, Product } from '@/services/products'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'

export default function MasterCatalogDetailsPage() {
  const { id } = useParams()
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([getCatalog(id), getProducts()])
        .then(([c, p]) => {
          setCatalog(c)
          setSelected(c.product_ids || [])
          setProducts(p.filter((x) => x.company_id === c.company_id))
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleToggle = (productId: string) => {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId],
    )
  }

  const handleSave = async () => {
    if (!catalog) return
    setSaving(true)
    try {
      const formData = new FormData()
      selected.forEach((pid) => formData.append('product_ids', pid))
      if (selected.length === 0) formData.append('product_ids', '') // allow clearing

      await updateCatalog(catalog.id, formData as any)
      toast.success('Catalog selections updated successfully.')
    } catch (e: any) {
      toast.error('Error updating catalog selections.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!catalog) return <div>Catalog not found.</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link to="/master/catalogs">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{catalog.title}</h1>
          <p className="text-gray-500 text-sm">Select products to include in this catalog.</p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> Save Selection ({selected.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => {
          const isSelected = selected.includes(p.id)
          return (
            <div
              key={p.id}
              className={`border rounded-xl p-4 bg-white shadow-sm flex items-start space-x-3 transition-colors cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}`}
              onClick={() => handleToggle(p.id)}
            >
              <Checkbox
                id={`chk-${p.id}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(p.id)}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="space-y-1.5 flex-1 leading-none">
                <label
                  htmlFor={`chk-${p.id}`}
                  className="font-semibold text-gray-900 cursor-pointer block"
                >
                  {p.name}
                </label>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-primary">${p.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border rounded-xl border-dashed">
            No products found for this company. Please add products to the inventory first.
          </div>
        )}
      </div>
    </div>
  )
}

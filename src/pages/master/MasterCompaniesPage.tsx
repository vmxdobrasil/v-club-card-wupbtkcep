import { useState, useEffect } from 'react'
import { getCompanies, Company } from '@/services/companies'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function MasterCompaniesPage({ defaultTab }: { defaultTab: string }) {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    getCompanies().then(setCompanies)
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Companies Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Viewing context:{' '}
          <span className="font-semibold text-primary uppercase">{defaultTab}</span>
        </p>
      </div>
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>BIN Prefix</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.logo ? (
                    <img
                      src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/companies/${c.id}/${c.logo}?thumb=100x100`}
                      alt="logo"
                      className="w-8 h-8 rounded-full border bg-gray-50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center text-xs font-bold text-gray-500">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-bold text-gray-900">{c.name}</TableCell>
                <TableCell>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium uppercase">
                    {c.category || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">{c.bin_prefix}</TableCell>
                <TableCell>{c.commission_rate}%</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

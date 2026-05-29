/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <img
            src="/whatsapp-image-2026-05-29-at-11.30.19-98680.jpeg"
            alt="Logo"
            className="h-10 w-auto object-contain rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://img.usecurling.com/i?q=vclub&color=blue&shape=fill'
            }}
          />
        </div>
      </header>
      <div className="flex-1 w-full max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  )
}

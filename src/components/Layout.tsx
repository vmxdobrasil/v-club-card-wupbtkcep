import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-background text-foreground">
      <Outlet />
    </div>
  )
}

export default Layout

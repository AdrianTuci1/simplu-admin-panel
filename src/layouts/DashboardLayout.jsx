import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { signOutRedirect } from '../auth/OidcProvider'
import { UserAPI, PaymentAPI } from '../lib/api'
import { FiFileText, FiCreditCard, FiLogOut } from 'react-icons/fi'
import Cookies from 'js-cookie'

const navItems = [
  { to: '/', label: 'Acasă', icon: '🏠' },
  { to: '/servicii', label: 'Servicii', icon: '⚙️' },
  { to: '/facturi', label: 'Facturi', icon: '🧾' },
]

export default function DashboardLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [rightPanel, setRightPanel] = useState('user') // 'user' | 'payments'
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    console.log('👤 DashboardLayout: Loading user data...')
    
    UserAPI.me()
      .then((u) => {
        if (!mounted) return
        console.log('✅ DashboardLayout: User loaded successfully:', u?.email)
        setUser(u)
      })
      .catch((error) => {
        if (!mounted) return
        console.error('❌ DashboardLayout: Failed to load user:', error)
      })
    return () => { mounted = false }
  }, [])

  function openRightPanel(type) {
    setRightPanel(type)
    setRightSidebarOpen(true)
    if (type === 'payments') {
      setInvoicesLoading(true)
      PaymentAPI.getInvoices()
        .then((list) => setInvoices(Array.isArray(list) ? list : []))
        .catch(() => setInvoices([]))
        .finally(() => setInvoicesLoading(false))
    }
  }

  function closeRightPanel() {
    setRightSidebarOpen(false)
  }

  const initials = (() => {
    const name = user?.firstName || user?.name || user?.email || ''
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0 || !parts[0]) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  })()

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[260px] bg-muted/30 border-r border-border flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={signOutRedirect}
            className="w-full justify-start gap-2"
          >
            <span>🚪</span>
            Delogare
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Deschide meniul</span>
                ☰
              </Button>
              <h2 className="text-lg font-medium text-muted-foreground">Dashboard</h2>
            </div>
            <div className="relative flex items-center gap-1 sm:gap-2">
              {/* Eliminăm butonul de delogare din navbar; se face din meniul utilizator */}
              <div className="ml-2 relative">
                <button type="button" onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {initials}
                  </div>
                  <div className="hidden md:block leading-tight text-left">
                    <div className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || 'Utilizator')}</div>
                    <div className="text-xs text-muted-foreground">{user?.email || ''}</div>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => { setUserMenuOpen(false); navigate('/profil') }}
                    >
                      Datele mele
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => { setUserMenuOpen(false); signOutRedirect() }}
                    >
                      <FiLogOut className="h-4 w-4" /> Ieși din cont
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>

    {/* Right Sidebar Overlay */}
    {rightSidebarOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={closeRightPanel}
      />
    )}

    {/* Right Sidebar */}
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-[260px] border-l border-border bg-muted/30 transition-transform duration-200 ease-in-out ${
        rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h4 className="font-medium">
          {rightPanel === 'user' ? 'Date utilizator' : 'Plăți rapide'}
        </h4>
        <Button variant="ghost" size="sm" onClick={closeRightPanel}>Închide</Button>
      </div>

      <div className="h-full overflow-auto p-4">
        {rightPanel === 'user' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">{initials}</div>
              <div>
                <div className="text-sm font-medium">{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || 'Utilizator')}</div>
                <div className="text-xs text-muted-foreground">{user?.email || ''}</div>
              </div>
            </div>
            <div className="grid gap-2">
              <Button variant="outline" onClick={() => { navigate('/profil'); closeRightPanel() }}>Deschide profil</Button>
              <Button variant="destructive" onClick={signOutRedirect}>Ieși din cont</Button>
            </div>
          </div>
        )}

        {rightPanel === 'payments' && (
          <div className="space-y-4">
            {invoicesLoading ? (
              <p className="text-sm text-muted-foreground">Se încarcă...</p>
            ) : (
              <>
                <h5 className="text-sm font-medium">Facturi neachitate</h5>
                <ul className="space-y-2">
                  {invoices.filter((i) => i.status !== 'paid').slice(0, 5).map((inv) => (
                    <li key={inv.id} className="rounded-md border p-2 text-sm">
                      <div className="font-medium">{inv.number} • {inv.total / 100} {inv.currency?.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">{inv.status}</div>
                    </li>
                  ))}
                  {invoices.filter((i) => i.status !== 'paid').length === 0 && (
                    <li className="text-xs text-muted-foreground">Nu ai facturi neachitate</li>
                  )}
                </ul>
                <div className="pt-2">
                  <Button className="w-full" onClick={() => { navigate('/plati'); closeRightPanel() }}>Mergi la plăți</Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
    </div>
  )
}


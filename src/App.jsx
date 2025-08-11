import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/Home'
import Services from './pages/Services'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import Invoices from './pages/Invoices'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'servicii', element: <Services /> },
      { path: 'plati', element: <Payments /> },
      { path: 'facturi', element: <Invoices /> },
      { path: 'profil', element: <Profile /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

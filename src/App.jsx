import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { SettingsProvider } from './SettingsContext'
import { DrawProvider } from './DrawContext'
import Layout from './Layout'
import GroupDraw from './pages/GroupDraw'
import GroupResult from './pages/GroupResult'
import GroupExport from './pages/GroupExport'
import IndividualDraw from './pages/IndividualDraw'
import OrderDraw from './pages/OrderDraw'
import './css/App.css'

const router = createBrowserRouter([
  {
    element: (
      <SettingsProvider>
        <DrawProvider>
          <Layout />
        </DrawProvider>
      </SettingsProvider>
    ),
    children: [
      { path: '/', element: <Navigate to="/group" replace /> },
      { path: '/group', element: <GroupDraw /> },
      { path: '/group/result', element: <GroupResult /> },
      { path: '/group/export', element: <GroupExport /> },
      { path: '/individual', element: <IndividualDraw /> },
      { path: '/order', element: <OrderDraw /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}

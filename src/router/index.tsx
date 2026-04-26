import { createBrowserRouter, Navigate } from 'react-router-dom'
import { FormPage } from '@/pages/FormPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// El municipio viaja en el path param — URLs bookmarkeables y navegables
// /formulario/:municipalityId → ej. /formulario/11001 (Bogotá)

export const router = createBrowserRouter([
  {
    path: '/formulario/:municipalityId',
    element: <FormPage />,
  },
  {
    path: '/',
    // Redirect temporal a Bogotá — se reemplaza por selector de municipio en Phase 5
    element: <Navigate to="/formulario/11001" replace />,
  },
  {
    path: '/not-found',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/not-found" replace />,
  },
])

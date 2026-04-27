import { createBrowserRouter, Navigate } from 'react-router-dom'
import { FormPage } from '@/pages/FormPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// El municipio viaja como query param `c` (código del municipio, ej. NIT).
// Ejemplo: /ICA?c=8909842656 → MUNICIPIO DE YONDÓ.
//
// Se prefirió query string sobre path param porque el código no es opaco
// estructuralmente: facilita cambiar de municipio sin reescribir la URL,
// y deja el path libre para futuras secciones (/ICA/historial, /ICA/admin).

// Código de prueba en dev (BD de desarrollo). Se elimina cuando exista
// el selector de municipio (Phase 5).
const DEV_MUNICIPALITY_CODE = '8909842656'

export const router = createBrowserRouter([
  {
    path: '/ICA',
    element: <FormPage />,
  },
  {
    path: '/',
    element: <Navigate to={`/ICA?c=${DEV_MUNICIPALITY_CODE}`} replace />,
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

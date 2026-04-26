import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'
import { env } from '@/env'

// Composition root — único lugar donde se ensamblan los providers
// El orden importa: QueryClient antes de Router para que las páginas
// puedan usar hooks de React Query desde el primer render

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {env.isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App

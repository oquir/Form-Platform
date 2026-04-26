export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Municipio no encontrado
        </h1>
        <p className="mt-2 text-gray-500">
          El código de municipio ingresado no es válido.
        </p>
      </div>
    </main>
  )
}

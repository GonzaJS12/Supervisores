import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL?.trim().replace(/\/$/, '')

  if (mode === 'production' && !apiUrl) {
    throw new Error(
      'VITE_API_URL es obligatorio para el build de producción.',
    )
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
  }
})
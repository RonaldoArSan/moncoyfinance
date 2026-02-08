/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produção: empacotamento standalone para facilitar deploy (Docker/Serverless)
  // Ativado somente quando STANDALONE=true para evitar problemas de symlink no Windows local
  ...(process.env.STANDALONE === 'true' ? { output: 'standalone' } : {}),

  // eslint configuration removida - use `next lint` diretamente
  // Para configurar eslint, use o comando: next lint --max-warnings 0

  // Transpila pacotes que usam o JSX transform antigo
  transpilePackages: ['react-day-picker', 'react-big-calendar'],

  typescript: {
    // Mantido por enquanto; ideal corrigir erros e desabilitar isso mais tarde
    ignoreBuildErrors: true,
  },
  images: {
    // Ajuste conforme sua infra de imagens; manter "true" evita otimização em runtime
    unoptimized: true,
  },
}

export default nextConfig

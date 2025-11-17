/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produção: empacotamento standalone para facilitar deploy (Docker/Serverless)
  // Ativado somente quando STANDALONE=true para evitar problemas de symlink no Windows local
  ...(process.env.STANDALONE === 'true' ? { output: 'standalone' } : {}),
  eslint: {
    // Mantido por enquanto para evitar que o build quebre; ideal revisar e remover depois
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mantido por enquanto; ideal corrigir erros e desabilitar isso mais tarde
    ignoreBuildErrors: true,
  },
  images: {
    // Otimização de imagens desabilitada temporariamente para compatibilidade com Radix UI Avatar
    unoptimized: true,
    // Domínios remotos permitidos (formato antigo para compatibilidade)
    domains: ['jxpgiqmwugsqpvrftmhl.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jxpgiqmwugsqpvrftmhl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig

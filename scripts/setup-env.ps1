#!/usr/bin/env pwsh
# Script para configurar environment variables no MoncoyFinance

Write-Host "`n🔧 MONCOYFINANCE - Configuração de Environment Variables`n" -ForegroundColor Cyan

# Verificar se .env.local já existe
if (Test-Path ".env.local") {
    Write-Host "⚠️  Arquivo .env.local já existe!`n" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "`n✅ Mantendo arquivo existente. Use 'code .env.local' para editar.`n" -ForegroundColor Green
        exit
    }
}

Write-Host "📝 Vamos configurar suas variáveis de ambiente...`n" -ForegroundColor Green

# Função para ler input com valor padrão
function Read-HostWithDefault {
    param (
        [string]$Prompt,
        [string]$Default = ""
    )
    
    if ($Default) {
        $userInput = Read-Host "$Prompt [$Default]"
        if ([string]::IsNullOrWhiteSpace($userInput)) {
            return $Default
        }
        return $userInput
    } else {
        return Read-Host $Prompt
    }
}

# Supabase
Write-Host "📦 SUPABASE (Banco de Dados)`n" -ForegroundColor Cyan
Write-Host "   Encontre em: https://supabase.com/dashboard > Settings > API`n"
$supabaseUrl = Read-Host "   Supabase URL"
$supabaseKey = Read-Host "   Supabase Anon Key"

# OpenAI
Write-Host "`n🤖 OPENAI (Inteligência Artificial)`n" -ForegroundColor Cyan
Write-Host "   Encontre em: https://platform.openai.com/api-keys`n"
$openaiKey = Read-Host "   OpenAI API Key"

# Stripe
Write-Host "`n💳 STRIPE (Pagamentos)`n" -ForegroundColor Cyan
Write-Host "   Encontre em: https://dashboard.stripe.com/test/apikeys`n"
$stripePublic = Read-Host "   Stripe Publishable Key (pk_test_...)"
$stripeSecret = Read-Host "   Stripe Secret Key (sk_test_...)"

Write-Host "`n   Webhook Secret (opcional - deixe vazio se não tiver)`n"
$stripeWebhook = Read-Host "   Stripe Webhook Secret (whsec_...)"

# Site URL
Write-Host "`n🌐 SITE URL`n" -ForegroundColor Cyan
$siteUrl = Read-HostWithDefault "   Site URL" "http://localhost:3000"

# Criar arquivo .env.local
Write-Host "`n📄 Criando arquivo .env.local...`n" -ForegroundColor Yellow

$envContent = @"
# =============================================================================
# MONCOYFINANCE - VARIÁVEIS DE AMBIENTE
# =============================================================================
# Gerado automaticamente em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# =============================================================================

# -----------------------------------------------------------------------------
# SUPABASE (Banco de Dados e Autenticação)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseKey

# -----------------------------------------------------------------------------
# OPENAI (Inteligência Artificial)
# -----------------------------------------------------------------------------
OPENAI_API_KEY=$openaiKey

# -----------------------------------------------------------------------------
# STRIPE (Pagamentos e Assinaturas)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublic
STRIPE_SECRET_KEY=$stripeSecret
"@

if (![string]::IsNullOrWhiteSpace($stripeWebhook)) {
    $envContent += "`nSTRIPE_WEBHOOK_SECRET=$stripeWebhook"
}

$envContent += @"

# -----------------------------------------------------------------------------
# URLs DO SITE
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=$siteUrl

# =============================================================================
# NOTAS
# =============================================================================
# - NUNCA commite este arquivo no Git
# - Para produção, use keys de produção do Stripe (pk_live_... e sk_live_...)
# - Variáveis com NEXT_PUBLIC_ são expostas no navegador
# - Após alterações, reinicie o servidor: npm run dev
# =============================================================================
"@

# Salvar arquivo
Set-Content -Path ".env.local" -Value $envContent

Write-Host "✅ Arquivo .env.local criado com sucesso!`n" -ForegroundColor Green

# Verificar se está tudo OK
$allFilled = $true
if ([string]::IsNullOrWhiteSpace($supabaseUrl)) { $allFilled = $false }
if ([string]::IsNullOrWhiteSpace($supabaseKey)) { $allFilled = $false }
if ([string]::IsNullOrWhiteSpace($openaiKey)) { $allFilled = $false }
if ([string]::IsNullOrWhiteSpace($stripePublic)) { $allFilled = $false }
if ([string]::IsNullOrWhiteSpace($stripeSecret)) { $allFilled = $false }

if ($allFilled) {
    Write-Host "✅ Todas as variáveis obrigatórias foram preenchidas!`n" -ForegroundColor Green
    Write-Host "📋 Próximos passos:`n" -ForegroundColor Cyan
    Write-Host "   1. Verifique o arquivo .env.local"
    Write-Host "   2. Reinicie o servidor: npm run dev"
    Write-Host "   3. Teste as funcionalidades`n"
} else {
    Write-Host "⚠️  Algumas variáveis não foram preenchidas!`n" -ForegroundColor Yellow
    Write-Host "   Edite o arquivo .env.local para adicionar as chaves faltantes.`n"
}

Write-Host "📚 Para ajuda completa, veja: docs/GUIA-ENVIRONMENT-KEYS.md`n" -ForegroundColor Cyan

# Perguntar se quer abrir o arquivo
$openFile = Read-Host "Deseja abrir o arquivo .env.local agora? (S/n)"
if ($openFile -ne "n" -and $openFile -ne "N") {
    code .env.local
}

Write-Host "`n✨ Configuração concluída!`n" -ForegroundColor Green

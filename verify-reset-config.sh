#!/bin/bash

# Script de verificação de configuração de Reset de Senha
# Execute: chmod +x verify-reset-config.sh && ./verify-reset-config.sh

echo "🔍 Verificando configuração de Reset de Senha..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar variáveis de ambiente
echo "📋 1. Verificando variáveis de ambiente (.env)..."

if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env encontrado"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
        SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configurada: ${SUPABASE_URL:0:40}..."
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL não encontrada"
    fi
    
    if grep -q "NEXT_PUBLIC_SITE_URL" .env; then
        SITE_URL=$(grep "NEXT_PUBLIC_SITE_URL" .env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SITE_URL configurada: $SITE_URL"
    else
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_SITE_URL não encontrada (pode causar problemas)"
    fi
else
    echo -e "${RED}✗${NC} Arquivo .env não encontrado!"
fi

echo ""

# Verificar arquivos críticos
echo "📁 2. Verificando arquivos críticos..."

files=(
    "app/forgot-password/page.tsx"
    "app/reset-password/page.tsx"
    "app/auth/callback/route.ts"
    "components/auth-provider.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file não encontrado!"
    fi
done

echo ""

# Verificar configuração em forgot-password
echo "🔧 3. Verificando forgot-password/page.tsx..."

if grep -q "redirectTo.*reset-password" app/forgot-password/page.tsx; then
    echo -e "${GREEN}✓${NC} redirectTo aponta para /reset-password"
else
    echo -e "${RED}✗${NC} redirectTo NÃO aponta para /reset-password"
    echo -e "${YELLOW}  ➜${NC} Deve ser: redirectTo: '\${window.location.origin}/reset-password'"
fi

echo ""

# Verificar configuração em reset-password
echo "🔧 4. Verificando reset-password/page.tsx..."

if grep -q "token.*searchParams.get" app/reset-password/page.tsx; then
    echo -e "${GREEN}✓${NC} Processa parâmetro 'token' da URL"
else
    echo -e "${RED}✗${NC} NÃO processa parâmetro 'token'"
fi

if grep -q "verifyOtp" app/reset-password/page.tsx; then
    echo -e "${GREEN}✓${NC} Usa verifyOtp() para validar token"
else
    echo -e "${RED}✗${NC} NÃO usa verifyOtp()"
fi

echo ""

# Verificar auth-provider
echo "🔧 5. Verificando auth-provider.tsx..."

if grep -q "/reset-password.*skipping" components/auth-provider.tsx; then
    echo -e "${GREEN}✓${NC} AuthProvider não redireciona em /reset-password"
else
    echo -e "${YELLOW}⚠${NC} AuthProvider pode estar redirecionando usuários"
fi

echo ""

# Resumo de configuração do Supabase
echo "📝 6. Configurações necessárias no Supabase Dashboard:"
echo ""
echo "   Site URL:"
echo "   https://moncoyfinance.com"
echo ""
echo "   Redirect URLs (adicionar):"
echo "   https://moncoyfinance.com/reset-password"
echo "   http://localhost:3000/reset-password"
echo ""
echo "   Email Template (Reset Password):"
echo '   <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">Redefinir Senha</a>'
echo ""

# Teste de conectividade
echo "🌐 7. Testando conectividade com Supabase..."

if command -v curl &> /dev/null; then
    if [ ! -z "$SUPABASE_URL" ]; then
        if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL" | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✓${NC} Supabase acessível"
        else
            echo -e "${YELLOW}⚠${NC} Não foi possível acessar Supabase"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} curl não disponível para teste"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure o Email Template no Supabase Dashboard"
echo "2. Configure as Redirect URLs no Supabase Dashboard"
echo "3. Verifique variáveis de ambiente na Vercel"
echo "4. Faça redeploy na Vercel"
echo "5. Solicite um NOVO link de reset de senha"
echo "6. Teste o fluxo completo"
echo ""
echo "📖 Consulte: CHECKLIST-RESET-PASSWORD.md"
echo ""

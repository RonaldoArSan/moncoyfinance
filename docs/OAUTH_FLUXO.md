# Fluxo do OAuth e Onde Configurar o Nome

## Como Funciona o Login com Google

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DO OAUTH DO GOOGLE                      │
└─────────────────────────────────────────────────────────────────┘

1. Usuário clica em "Continuar com Google"
   │
   ├──> App Next.js chama: supabase.auth.signInWithOAuth()
   │
   └──> Supabase redireciona para: Google OAuth
                                    │
                                    ▼
        ┌───────────────────────────────────────────────┐
        │  TELA DE CONSENTIMENTO DO GOOGLE              │
        │                                               │
        │  🔴 AQUI APARECE O NOME DA APLICAÇÃO         │
        │     "Prosseguir para [NOME]"                 │
        │                                               │
        │  Este nome vem de:                           │
        │  → Google Cloud Console                       │
        │  → Tela de Consentimento OAuth               │
        │  → Campo "Nome do aplicativo"                │
        └───────────────────────────────────────────────┘
                                    │
                                    ▼
        Usuário seleciona conta e autoriza
                                    │
                                    ▼
        Google redireciona de volta para Supabase
                                    │
                                    ▼
        Supabase processa token e redireciona para App
                                    │
                                    ▼
        Usuário logado na aplicação Moncoy Finance
```

## Onde o Nome é Configurado

### ❌ NÃO é no código da aplicação
- O código apenas chama `supabase.auth.signInWithOAuth()`
- Não há parâmetro para definir o nome no código

### ❌ NÃO é no Dashboard do Supabase
- O Supabase apenas faz a ponte entre sua app e o Google
- A tela de consentimento é do Google, não do Supabase

### ✅ É no Google Cloud Console
```
Google Cloud Console
  └─> APIs e Serviços
      └─> Tela de consentimento OAuth
          └─> Nome do aplicativo: "Moncoy Finance" ← AQUI!
```

## Configurações Relacionadas

### No Google Cloud Console
| Configuração | Onde Aparece | Recomendação |
|--------------|--------------|--------------|
| Nome do aplicativo | "Prosseguir para [NOME]" | **Moncoy Finance** |
| Logotipo do aplicativo | Ícone ao lado do nome | Logo do Moncoy (opcional) |
| Link da página inicial | Link clicável | https://moncoyfinance.com |

### No Supabase Dashboard
| Configuração | Propósito | Recomendação |
|--------------|-----------|--------------|
| Site URL | Redirect após login | `https://seudominio.com` |
| Redirect URLs | URLs permitidas | `https://seudominio.com/**` |

## Perguntas Frequentes

### P: Por que aparece a URL do Supabase?
**R:** Porque no Google Cloud Console, o campo "Nome do aplicativo" está vazio ou preenchido com a URL padrão.

### P: Posso mudar isso no código?
**R:** Não. O nome da tela de consentimento é configurado no Google Cloud Console.

### P: Preciso ter um domínio próprio?
**R:** Não. Você pode usar o subdomínio do Supabase e apenas mudar o nome exibido no Google Cloud Console.

### P: Quanto tempo leva para a mudança aparecer?
**R:** Geralmente é imediato, mas pode levar até 24 horas para propagar completamente.

## Resumo

Para mudar de:
- ❌ "Prosseguir para dxdbpppymxfiojszrmir.supabase.co"

Para:
- ✅ "Prosseguir para Moncoy Finance"

**Você precisa:**
1. Acessar o Google Cloud Console
2. Ir em "Tela de consentimento OAuth"
3. Editar o campo "Nome do aplicativo"
4. Salvar as alterações

**Tempo estimado:** 5 minutos  
**Custo:** Gratuito  
**Requer código:** Não

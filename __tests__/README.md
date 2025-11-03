# 🧪 Estrutura de Testes - MoncoyFinance

## 📁 Organização

```
__tests__/
├── components/          # Testes de componentes React
│   ├── ai-status-card.test.tsx
│   └── auth-guards.test.tsx
├── contexts/            # Testes de Context API
│   └── user-plan-context.test.tsx
├── hooks/               # Testes de hooks customizados
│   └── use-ai.test.tsx
├── lib/                 # Testes de bibliotecas e APIs
│   ├── ai-limits.test.ts
│   └── api.test.ts
└── utils/               # Utilitários de teste
    └── test-utils.tsx   # Helpers para rendering com providers
```

## 🚀 Como Executar

### Executar todos os testes
```bash
pnpm test
```

### Executar em modo watch (desenvolvimento)
```bash
pnpm test:watch
```

### Gerar relatório de cobertura
```bash
pnpm test:coverage
```

### Executar em CI
```bash
pnpm test:ci
```

## 📋 Testes Implementados

### ✅ Sistema de IA e Limites

#### `ai-limits.test.ts`
- ✅ Verificação de limites por plano (Basic, Pro, Premium)
- ✅ Reset automático semanal (Basic/Pro) e mensal (Premium)
- ✅ Incremento de contador de uso
- ✅ Integração com API server-side
- ✅ Tratamento de erros quando limite atingido

**Cobertura:**
- Função `checkAILimitLocal()`: Cálculo de limites local
- Função `incrementAIUsageLocal()`: Incremento local
- API `/api/ai/usage`: Chamadas GET e POST
- Edge cases: Reset de período, limite atingido, contador zerado

#### `use-ai.test.tsx`
- ✅ Período de aprendizado de 22 dias (plano Basic)
- ✅ Bloqueio de IA antes dos 22 dias
- ✅ Liberação após 22 dias
- ✅ Verificação de limites antes de análise
- ✅ Incremento automático após sucesso
- ✅ Toast de aviso quando próximo do limite
- ✅ Tratamento de erros de API

**Cobertura:**
- Hook `useAI()`: Estados e loading
- Função `analyzeTransactions()`: Fluxo completo
- Função `refreshUsage()`: Recarregamento
- Validação por plano: Basic, Pro, Premium

### ✅ Componentes

#### `ai-status-card.test.tsx`
- ✅ Display de countdown de 22 dias (Basic)
- ✅ Exibição de perguntas restantes
- ✅ Diferentes formatos por plano (semanal/mensal)
- ✅ Estado de loading
- ✅ Alerta quando limite atingido
- ✅ Data de reset

**Cobertura:**
- Component `AIStatusCard`: Todos os estados
- Integração com `useAI` hook
- Integração com `useUserPlan` context
- UI condicional por plano

#### `auth-guards.test.tsx`
- ✅ `UserGuard`: Proteção de rotas de usuário
- ✅ `AdminGuard`: Proteção de rotas admin
- ✅ `PublicGuard`: Rotas públicas (login/register)
- ✅ Redirecionamentos corretos
- ✅ Loading states
- ✅ Verificação de admin via email

**Cobertura:**
- Guards de autenticação: 3 tipos
- Redirecionamentos: 6 cenários
- Loading states: 3 cenários

### ✅ Contexts

#### `user-plan-context.test.tsx`
- ✅ Features por plano (Basic, Pro, Premium)
- ✅ Verificação de disponibilidade de features
- ✅ Upgrade de plano via Stripe
- ✅ Comparação entre planos
- ✅ Modelos de IA por tier
- ✅ Limites de perguntas por tier
- ✅ Níveis de suporte

**Cobertura:**
- Context `UserPlanProvider`: Todos os planos
- Função `isFeatureAvailable()`: Validação
- Função `upgradeToProfessional()`: Stripe checkout
- Comparação entre tiers: 3 cenários

### ✅ APIs

#### `api.test.ts`
- ✅ `userApi.getCurrentUser()`: Busca usuário autenticado
- ✅ `userApi.createUserProfile()`: Criação de perfil
- ✅ `userApi.updateUser()`: Atualização de dados
- ✅ `transactionsApi.getTransactions()`: Listagem
- ✅ `transactionsApi.createTransaction()`: Criação
- ✅ `transactionsApi.updateTransaction()`: Edição
- ✅ `transactionsApi.deleteTransaction()`: Exclusão
- ✅ Tratamento de erros de autenticação

**Cobertura:**
- User API: 3 funções
- Transactions API: 5 funções
- Autenticação: 2 cenários de erro
- Supabase mocks: Integração completa

## 🛠️ Utilitários de Teste

### `test-utils.tsx`

Fornece helpers para facilitar testes:

#### Mock Data
```typescript
import { mockUser, mockTransaction, mockGoal, mockInvestment } from '@/__tests__/utils/test-utils'

// Usar dados mockados em testes
const user = mockUser // Usuário básico
const proUser = mockProUser // Usuário Pro
const premiumUser = mockPremiumUser // Usuário Premium
const adminUser = mockAdminUser // Admin
```

#### Render com Providers
```typescript
import { render } from '@/__tests__/utils/test-utils'

// Renderiza com todos os providers necessários
render(<MyComponent />, { initialUser: mockUser })
```

## 📊 Cobertura de Código

### Meta de Cobertura
- **Statements**: > 70%
- **Branches**: > 65%
- **Functions**: > 70%
- **Lines**: > 70%

### Áreas Cobertas
- ✅ Sistema de IA (limites, tracking, modelos)
- ✅ Autenticação (guards, redirects)
- ✅ Planos de usuário (features, upgrades)
- ✅ APIs principais (user, transactions)
- ✅ Componentes críticos

### Áreas Pendentes
- ⏳ Goals API
- ⏳ Investments API
- ⏳ Commitments API
- ⏳ Reports generation
- ⏳ Notification system
- ⏳ Stripe webhooks
- ⏳ Server actions

## 🔧 Configuração

### Jest Config (`jest.config.ts`)
- **Environment**: jsdom (para testes de React)
- **Coverage**: v8 provider
- **Setup**: `jest.setup.ts` carregado automaticamente
- **Module mapper**: Suporte para alias `@/`
- **Test match**: Arquivos `.test.ts(x)` e `.spec.ts(x)`

### Setup Global (`jest.setup.ts`)
- ✅ Jest-DOM matchers
- ✅ Mock de Next.js router
- ✅ Mock de Supabase client
- ✅ Variáveis de ambiente de teste

## 🎯 Boas Práticas

### 1. Organize por Feature
```typescript
describe('Feature Name', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

### 2. Use Mocks Consistentes
```typescript
// Sempre use os mocks de test-utils
import { mockUser } from '@/__tests__/utils/test-utils'

// Evite criar novos objetos mock inline
```

### 3. Teste Casos de Erro
```typescript
it('should handle error when API fails', async () => {
  // Simule erro
  mockAPI.mockRejectedValueOnce(new Error('API Error'))
  
  // Verifique tratamento
  await expect(fn()).rejects.toThrow('API Error')
})
```

### 4. Limpe Mocks Entre Testes
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

### 5. Teste Estados de Loading
```typescript
it('should show loading state', () => {
  const { result } = renderHook(() => useMyHook())
  
  expect(result.current.loading).toBe(true)
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
})
```

## 📝 Convenções de Nomenclatura

### Arquivos de Teste
- `[nome-do-arquivo].test.ts(x)`: Testes unitários
- `[nome-do-arquivo].spec.ts(x)`: Testes de integração (futuro)

### Describes
- **Feature level**: Nome da feature ou componente
- **Function level**: Nome da função sendo testada
- **Scenario level**: Contexto específico ("when user is admin", etc.)

### Tests (it/test)
- Começar com "should"
- Ser específico sobre o comportamento esperado
- Exemplo: `'should display countdown for users within 22-day period'`

## 🚨 Troubleshooting

### Erro: "Cannot find module '@/...'"
**Solução**: Verifique se o `moduleNameMapper` no `jest.config.ts` está correto:
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### Erro: "window is not defined"
**Solução**: Use `jsdom` environment:
```typescript
testEnvironment: 'jsdom'
```

### Mock não está funcionando
**Solução**: Certifique-se de que o mock está antes do import:
```typescript
jest.mock('@/lib/api') // Deve vir antes
import { myFunction } from '@/lib/api' // Import depois
```

### Testes muito lentos
**Solução**: Use `--maxWorkers` para limitar paralelismo:
```bash
pnpm test --maxWorkers=2
```

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎓 Próximos Passos

1. **Expandir cobertura**
   - Adicionar testes para Goals API
   - Adicionar testes para Investments API
   - Adicionar testes para Server Actions

2. **Testes de Integração**
   - Fluxos completos de usuário
   - Integração com Stripe (mocked)
   - Integração com OpenAI (mocked)

3. **Testes E2E** (futuro)
   - Playwright ou Cypress
   - Testes de fluxos críticos
   - Testes em múltiplos navegadores

4. **Performance Testing**
   - Testes de performance de hooks
   - Testes de memory leaks
   - Benchmarks de componentes

---

**Última atualização**: 24 de outubro de 2025  
**Versão**: 1.0

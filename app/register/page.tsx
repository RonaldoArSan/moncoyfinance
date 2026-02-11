"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Mail, Lock, Chrome, User, Phone, Building2, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PhoneInput } from "@/components/ui/phone-input"
import { useAuth } from "@/components/auth-provider"

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "personal" as "personal" | "business",
    plan: "basic" as "basic" | "professional",
    openaiKey: "",
  })
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading, signUp, signInWithGoogle } = useAuth()

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setPaymentSuccess(true)
      setFormData(prev => ({ ...prev, plan: "professional" }))
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (formData.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    const result = await signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      plan: formData.plan,
      openaiKey: formData.openaiKey || undefined
    })
    
    if (result.success) {
      alert("Conta criada com sucesso! Verifique seu email para confirmar.")
      router.push("/login")
    } else {
      setError(result.error || "Erro ao criar conta")
    }
  }

  const handleGoogleRegister = async () => {
    setError("")
    
    const result = await signInWithGoogle()
    
    if (!result.success) {
      setError(result.error || "Erro ao registrar com Google")
    }
    // Google OAuth will redirect automatically on success
  }

  const nextStep = () => {
    setError("")
    
    if (step === 1) {
      // Validate step 1
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Preencha todos os campos")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem")
        return
      }
      if (formData.password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres")
        return
      }
    }
    
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Moncoy</h1>
          <p className="text-muted-foreground">Crie sua conta e comece a gerenciar suas finanças</p>
        </div>

        <Card className="shadow-lg border-0 bg-background/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 && "Criar conta"}
              {step === 2 && "Tipo de conta"}
              {step === 3 && "Configurações"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Preencha seus dados básicos"}
              {step === 2 && "Escolha o tipo de conta e plano"}
              {step === 3 && "Configure suas preferências"}
            </CardDescription>

            {/* Progress indicator */}
            <div className="flex justify-center space-x-2 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {paymentSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                ✅ Pagamento confirmado! Complete seu cadastro para acessar.
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {step === 1 && (
              <>
                {/* Google Register Button */}
                <Button
                  variant="outline"
                  className="w-full h-11 bg-transparent"
                  onClick={handleGoogleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Chrome className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Conectando..." : "Continuar com Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou preencha os dados</span>
                  </div>
                </div>

                {/* Basic Info Form */}
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-10"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <PhoneInput
                        id="phone"
                        value={formData.phone}
                        onChange={(formatted) => handleInputChange("phone", formatted)}
                        className="pl-10"
                        
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11">
                    Continuar
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {paymentSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Plano Ativo</h4>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">Plano Profissional - Pago</span>
                    </div>
                  </div>
                )}
                
                {!paymentSuccess && (
                  <div className="space-y-3">
                    <Label>Escolha seu plano</Label>
                    <div className="space-y-3">
                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.plan === "basic" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleInputChange("plan", "basic")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Plano Básico</h3>
                                <Badge variant="secondary">Gratuito</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Funcionalidades essenciais de gestão financeira
                              </p>
                            </div>
                            {formData.plan === "basic" && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.plan === "professional" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleInputChange("plan", "professional")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Plano Profissional</h3>
                                <Badge variant="default">R$ 29,99/mês</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                IA, análise de comprovantes e recursos avançados
                              </p>
                            </div>
                            {formData.plan === "professional" && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Account Type */}
                <div className="space-y-3">
                  <Label>Tipo de conta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={formData.accountType === "personal" ? "default" : "outline"}
                      className="h-20 flex-col"
                      onClick={() => handleInputChange("accountType", "personal")}
                    >
                      <User className="h-6 w-6 mb-2" />
                      <span>Pessoal</span>
                    </Button>
                    <Button
                      variant={formData.accountType === "business" ? "default" : "outline"}
                      className="h-20 flex-col"
                      onClick={() => handleInputChange("accountType", "business")}
                    >
                      <Building2 className="h-6 w-6 mb-2" />
                      <span>Empresarial</span>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                {formData.plan === "professional" && (
                  <div className="space-y-2">
                    <Label htmlFor="openaiKey">Chave API OpenAI (Opcional)</Label>
                    <Input
                      id="openaiKey"
                      type="password"
                      placeholder="sk-..."
                      value={formData.openaiKey}
                      onChange={(e) => handleInputChange("openaiKey", e.target.value)}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Necessária para funcionalidades de IA. Pode ser adicionada depois nas configurações.
                    </p>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo da conta</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nome:</span> {formData.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span> {formData.email}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Tipo:</span>{" "}
                      {formData.accountType === "personal" ? "Pessoal" : "Empresarial"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Plano:</span>{" "}
                      {formData.plan === "basic" ? "Básico (Gratuito)" : paymentSuccess ? "Profissional (Pago)" : "Profissional (R$ 29,99/mês)"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link href={paymentSuccess ? "/login?payment=success" : "/login"} className="text-primary hover:underline">
                  Fazer login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Ao criar uma conta, você concorda com nossos</p>
          <div className="space-x-4">
            <Link href="/terms" className="hover:underline">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}

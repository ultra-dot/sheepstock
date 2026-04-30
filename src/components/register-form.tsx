"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { register } from "@/app/actions/auth"
import { useActionState, useState } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // @ts-ignore - Ignore type error for useActionState in Next.js 14/15 if types are lagging
  const [state, formAction, isPending] = useActionState(register, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className={cn("grid h-screen w-full lg:grid-cols-2 overflow-hidden bg-white", className)} {...props}>
      {/* Left Side: Editorial Content Shell */}
      <div className="relative hidden lg:flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-zinc-900">
        {/* Background Image Placeholder */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/image/background-login.png')` }}
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#012D1D]/90 via-[#012D1D]/20 to-transparent" />

        {/* Back Arrow */}
        <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-20 text-white/70 hover:text-white cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full max-w-[500px] mx-auto w-full pt-10">
          {/* SheepStock Title */}
          <h2 className="text-[#BDF525] text-2xl font-bold mb-3 tracking-wide font-sans">
            SheepStock
          </h2>
          
          {/* Main Headline */}
          <h1 className="text-white text-4xl lg:text-5xl leading-[1.15] font-bold mb-4 font-sans">
            Keamanan Data<br/>Terjamin
          </h1>
          
          {/* Description */}
          <p className="text-white/90 text-sm font-medium leading-relaxed font-sans mb-8 max-w-[480px]">
            Infrastruktur digital kami dibangun untuk menjaga privasi dan integritas data peternakan Anda dengan standar enkripsi militer.
          </p>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex items-center justify-center p-6 bg-white overflow-y-auto relative z-10">
        <div className="w-full max-w-[360px] mx-auto">
          {/* Welcome Text */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-[#1E1E1E] mb-1 font-sans">
              Daftar Akun Peternak
            </h1>
            <p className="text-[#1E1E1E]/60 text-xs font-sans">
              Lengkapi identitas resmi Anda untuk akses penuh
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {state.error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                Nama Lengkap*
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Naufal Riyadi"
                required
                className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl px-4 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                Email*
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                required
                className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl px-4 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                Kata Sandi*
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  required
                  className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl pl-4 pr-10 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="passwordConfirm" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                Konfirmasi*
              </label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="**********"
                  required
                  className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl pl-4 pr-10 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <Button 
                type="submit" 
                disabled={isPending}
                className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer"
              >
                {isPending ? "Memproses..." : "Buat Akun"}
              </Button>
            </div>
            
            <div className="flex justify-center items-center gap-1 mt-4">
              <span className="text-[#1E1E1E]/80 text-xs font-sans">
                Sudah punya akun?
              </span>
              <Link href="/login" className="text-[#4E6B03] font-bold text-xs hover:underline font-sans cursor-pointer">
                Masuk di sini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

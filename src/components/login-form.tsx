"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/app/actions/auth"
import { useActionState, useState } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // @ts-ignore - Ignore type error for useActionState in Next.js 14/15 if types are lagging
  const [state, formAction, isPending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  // Show loading overlay when form is submitting (server action handles redirect)
  if (isPending) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-5">
        <div className="flex items-center gap-3 mb-2">
          <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-11 h-11 object-contain" />
          <span className="text-2xl font-extrabold text-[#054431] tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>SheepStock</span>
        </div>
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Mempersiapkan dashboard...</p>
          <p className="text-xs text-slate-400 mt-1">Harap tunggu sebentar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid h-screen w-full lg:grid-cols-2 overflow-hidden", className)} {...props}>
      {/* Left Side: Editorial Content Shell */}
      <div className="relative hidden lg:flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-zinc-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/image/background-login.png')` }}
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

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
            Digitalizing the<br/>Pastoral<br/>Landscape.
          </h1>
          
          {/* Description */}
          <p className="text-white/90 text-sm font-medium leading-relaxed font-sans mb-8">
            Kelola peternakan Anda dengan presisi teknologi<br/>modern. Akses data kesehatan, silsilah, dan performa<br/>ternak dalam satu genggaman.
          </p>

          {/* Stats Cards */}
          <div className="flex gap-3">
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 w-[140px] border border-white/5 flex flex-col justify-center">
              <div className="text-[#BDF525] text-xl font-bold mb-1">10k+</div>
              <div className="text-white/70 text-[10px] font-bold uppercase tracking-wider leading-tight">Peternak<br/>Terdaftar</div>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 w-[140px] border border-white/5 flex flex-col justify-center">
              <div className="text-[#BDF525] text-xl font-bold mb-1">98%</div>
              <div className="text-white/70 text-[10px] font-bold uppercase tracking-wider leading-tight mt-1">Efisiensi Pakan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto">
          {/* Welcome Text */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-[#1E1E1E] mb-1 font-sans">
              Selamat Datang!
            </h1>
            <p className="text-[#1E1E1E]/60 text-xs font-sans">
              Masuk ke dashboard anda
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
              <label htmlFor="email" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                Username or Email
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
                Kata Sandi
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
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-[10px] font-bold text-[#4E6B03] hover:underline font-sans cursor-pointer">
                Lupa Password?
              </Link>
            </div>

            <div className="flex justify-center mt-2">
              <Button 
                type="submit" 
                disabled={isPending}
                className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer"
              >
                {isPending ? "Memproses..." : "Masuk ke Dashboard"}
              </Button>
            </div>
            
            <div className="relative flex items-center py-2 mt-2">
              <div className="flex-grow border-t border-[#D9D9D9]"></div>
              <span className="flex-shrink-0 mx-3 text-[#A3A3A3] text-[9px] font-bold tracking-wider font-sans uppercase">
                Atau Masuk Dengan
              </span>
              <div className="flex-grow border-t border-[#D9D9D9]"></div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                className="h-[40px] w-[130px] rounded-full bg-[#F3F4F6] border-0 hover:bg-[#E5E7EB] flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.14H2.21V16.99C4.01 20.57 7.7 23 12 23Z" fill="#34A853"/>
                  <path d="M5.88 14.14C5.66 13.48 5.54 12.76 5.54 12C5.54 11.24 5.66 10.52 5.88 9.86V7.01H2.21C1.47 8.49 1.05 10.18 1.05 12C1.05 13.82 1.47 15.51 2.21 16.99L5.88 14.14Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.03L19.36 3.87C17.46 2.1 14.97 1 12 1C7.7 1 4.01 3.43 2.21 7.01L5.88 9.86C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                <span className="text-[#1E1E1E] font-bold text-[13px] font-sans">Google</span>
              </Button>
            </div>

            <div className="flex justify-center items-center gap-1 mt-4">
              <span className="text-[#1E1E1E]/80 text-xs font-sans">
                Belum punya akun?
              </span>
              <Link href="/register" className="text-[#4E6B03] font-bold text-xs hover:underline font-sans cursor-pointer">
                Daftar Sekarang
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

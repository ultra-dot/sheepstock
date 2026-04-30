"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/app/actions/auth"
import { useActionState } from "react"
import { AlertCircle, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // @ts-ignore
  const [state, formAction, isPending] = useActionState(forgotPassword, null)

  return (
    <div className={cn("grid h-screen w-full lg:grid-cols-2 overflow-hidden", className)} {...props}>
      {/* Left Side: Same branding as login */}
      <div className="relative hidden lg:flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/image/background-login.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        <Link href="/login" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-20 text-white/70 hover:text-white cursor-pointer transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>

        <div className="relative z-10 flex flex-col justify-center h-full max-w-[500px] mx-auto w-full pt-10">
          <h2 className="text-[#BDF525] text-2xl font-bold mb-3 tracking-wide font-sans">
            SheepStock
          </h2>
          <h1 className="text-white text-4xl lg:text-5xl leading-[1.15] font-bold mb-4 font-sans">
            Lupa Password?<br/>Tenang, Kami<br/>Bantu.
          </h1>
          <p className="text-white/90 text-sm font-medium leading-relaxed font-sans mb-8">
            Masukkan email yang terdaftar dan kami akan<br/>mengirimkan link untuk mengatur ulang kata sandi Anda.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto">

          {/* Success State */}
          {state?.success ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-[#1E1E1E] font-sans">
                Email Terkirim!
              </h1>
              <p className="text-[#1E1E1E]/60 text-sm font-sans leading-relaxed">
                Kami sudah mengirimkan link reset password ke <span className="font-bold text-[#1E1E1E]">{state.email}</span>. Silakan cek inbox atau folder spam Anda.
              </p>
              <Link href="/login">
                <Button className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer mt-2">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-amber-600" />
                </div>
                <h1 className="text-xl font-bold text-[#1E1E1E] mb-1 font-sans">
                  Reset Password
                </h1>
                <p className="text-[#1E1E1E]/60 text-xs font-sans">
                  Masukkan email yang terdaftar di akun Anda
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
                    Email
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

                <div className="flex justify-center mt-2">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer"
                  >
                    {isPending ? "Mengirim..." : "Kirim Link Reset"}
                  </Button>
                </div>

                <div className="flex justify-center items-center gap-1 mt-4">
                  <ArrowLeft className="w-3 h-3 text-[#4E6B03]" />
                  <Link href="/login" className="text-[#4E6B03] font-bold text-xs hover:underline font-sans cursor-pointer">
                    Kembali ke Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

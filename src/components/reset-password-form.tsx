"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/app/actions/auth"
import { useActionState, useState } from "react"
import { AlertCircle, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // @ts-ignore
  const [state, formAction, isPending] = useActionState(resetPassword, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className={cn("grid h-screen w-full lg:grid-cols-2 overflow-hidden", className)} {...props}>
      {/* Left Side */}
      <div className="relative hidden lg:flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/image/background-login.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        <div className="relative z-10 flex flex-col justify-center h-full max-w-[500px] mx-auto w-full pt-10">
          <h2 className="text-[#BDF525] text-2xl font-bold mb-3 tracking-wide font-sans">
            SheepStock
          </h2>
          <h1 className="text-white text-4xl lg:text-5xl leading-[1.15] font-bold mb-4 font-sans">
            Atur Ulang<br/>Kata Sandi<br/>Anda.
          </h1>
          <p className="text-white/90 text-sm font-medium leading-relaxed font-sans mb-8">
            Buat kata sandi baru yang kuat untuk<br/>melindungi akun peternakan Anda.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-[360px] mx-auto">

          {state?.success ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-[#1E1E1E] font-sans">
                Password Berhasil Diubah!
              </h1>
              <p className="text-[#1E1E1E]/60 text-sm font-sans leading-relaxed">
                Kata sandi Anda telah diperbarui. Silakan masuk kembali dengan kata sandi baru Anda.
              </p>
              <Link href="/login">
                <Button className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer mt-2">
                  Masuk ke Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-xl font-bold text-[#1E1E1E] mb-1 font-sans">
                  Buat Password Baru
                </h1>
                <p className="text-[#1E1E1E]/60 text-xs font-sans">
                  Masukkan kata sandi baru untuk akun Anda
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
                  <label htmlFor="password" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                      className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl pl-4 pr-10 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="passwordConfirm" className="text-[10px] font-bold text-[#1E1E1E] uppercase tracking-wide font-sans ml-1">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Ketik ulang kata sandi"
                      required
                      minLength={6}
                      className="h-[44px] bg-[#EBEFEF] border-0 rounded-xl pl-4 pr-10 text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60 focus:outline-none cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="h-[42px] w-[240px] rounded-full bg-[#003B26] hover:bg-[#002F1D] text-white text-sm font-bold shadow-sm font-sans transition-all cursor-pointer"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Password Baru"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

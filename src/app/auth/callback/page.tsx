"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Memverifikasi kredensial Anda...")

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get("code")
      const next = searchParams.get("next") || "/dashboard"

      if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
          setStatus("success")
          setMessage("Autentikasi berhasil! Mengalihkan...")
          
          // Small delay for smooth transition
          setTimeout(() => {
            router.push(next)
          }, 1500)
        } else {
          console.error("Auth error:", error)
          setStatus("error")
          setMessage("Gagal melakukan autentikasi. Link mungkin sudah kadaluarsa.")
        }
      } else {
        // No code, maybe already logged in or direct access
        router.push("/dashboard")
      }
    }

    exchangeCode()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-8 h-8 invert brightness-0" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">SheepStock</h1>
        </div>

        {/* Status Indicator */}
        <div className="mb-8">
          {status === "loading" && (
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-t-4 border-emerald-600 animate-spin" />
            </div>
          )}
          
          {status === "success" && (
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          )}

          {status === "error" && (
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center animate-in zoom-in duration-500">
              <AlertCircle className="w-10 h-10 text-rose-600" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">
            {status === "loading" ? "Menghubungkan Sesi" : status === "success" ? "Berhasil" : "Akses Ditolak"}
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Button for Error */}
        {status === "error" && (
          <button 
            onClick={() => router.push("/login")}
            className="mt-8 px-8 py-3 bg-[#054431] text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-900/20 hover:bg-[#043325] transition-all"
          >
            Kembali ke Login
          </button>
        )}

        {/* Branding Footer */}
        <div className="mt-20 pt-8 border-t border-slate-100 w-full">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            © MitraTani Farm Management
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

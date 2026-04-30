"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resendVerification } from "@/app/actions/auth"
import Link from "next/link"
import { Mail, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const MAX_ATTEMPTS = 3
const COOLDOWN_SECONDS = 30
const LOCKOUT_MINUTES = 15

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const router = useRouter()
    const supabase = createClient()

    const [cooldown, setCooldown] = useState(0)
    const [attempts, setAttempts] = useState(0)
    const [lockedUntil, setLockedUntil] = useState<number | null>(null)
    const [lockoutRemaining, setLockoutRemaining] = useState(0)
    const [isResending, setIsResending] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [isVerified, setIsVerified] = useState(false)

    // Listen for auth state changes to detect if user verified from email link (same browser)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setIsVerified(true)
                // Wait a bit to show the success message, then redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard')
                }, 2000)
            }
        })
        
        return () => subscription.unsubscribe()
    }, [supabase, router])

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [cooldown])

    // Lockout timer
    useEffect(() => {
        if (!lockedUntil) return
        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
            setLockoutRemaining(remaining)
            if (remaining <= 0) {
                setLockedUntil(null)
                setAttempts(0)
                setLockoutRemaining(0)
                clearInterval(timer)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [lockedUntil])

    const handleResend = useCallback(async () => {
        if (!email || cooldown > 0 || isResending || lockedUntil) return

        if (attempts >= MAX_ATTEMPTS) {
            setLockedUntil(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
            setMessage({ type: "error", text: `Terlalu banyak percobaan. Coba lagi dalam ${LOCKOUT_MINUTES} menit.` })
            return
        }

        setIsResending(true)
        setMessage(null)

        try {
            const result = await resendVerification(email)
            if (result.error) {
                setMessage({ type: "error", text: result.error })
            } else {
                setMessage({ type: "success", text: "Email verifikasi berhasil dikirim ulang!" })
                setAttempts((prev) => prev + 1)
                setCooldown(COOLDOWN_SECONDS)
            }
        } catch {
            setMessage({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." })
        } finally {
            setIsResending(false)
        }
    }, [email, cooldown, isResending, lockedUntil, attempts])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`
    }

    const isDisabled = cooldown > 0 || isResending || !!lockedUntil

    // Mask email for display
    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + b.replace(/./g, "•") + c)
        : ""

    return (
        <div className="grid h-screen w-full lg:grid-cols-2 overflow-hidden bg-white">
            {/* Left Side: Editorial Content Shell */}
            <div className="relative hidden lg:flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-zinc-900">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/assets/image/background-login.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#012D1D]/90 via-[#012D1D]/20 to-transparent" />

                <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-20 text-white/70 hover:text-white cursor-pointer transition-colors">
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
                        Keamanan Data<br/>Terjamin
                    </h1>
                    <p className="text-white/90 text-sm font-medium leading-relaxed font-sans mb-8 max-w-[480px]">
                        Infrastruktur digital kami dibangun untuk menjaga privasi dan integritas data peternakan Anda dengan standar enkripsi militer.
                    </p>
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="flex items-center justify-center p-6 bg-white overflow-y-auto relative z-10">
                <div className="w-full max-w-[360px] mx-auto">
                    {/* Welcome Text */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#EBEFEF] flex items-center justify-center relative">
                                {isVerified ? (
                                    <CheckCircle2 className="w-9 h-9 text-[#054431]" />
                                ) : (
                                    <>
                                        <Mail className="w-9 h-9 text-[#054431]" />
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#BDF525] rounded-full flex items-center justify-center border-2 border-white">
                                            <span className="w-2 h-2 bg-[#054431] rounded-full animate-ping" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <h1 className="text-xl font-bold text-[#1E1E1E] mb-2 font-sans">
                            {isVerified ? "Email Berhasil Diverifikasi!" : "Verifikasi Email Anda"}
                        </h1>
                        <p className="text-[#1E1E1E]/60 text-xs font-sans leading-relaxed">
                            {isVerified ? "Mengarahkan Anda ke dashboard..." : "Kami telah mengirimkan link verifikasi ke"}
                        </p>
                        {!isVerified && maskedEmail && (
                            <p className="text-[#054431] text-sm font-bold mt-1">{maskedEmail}</p>
                        )}
                    </div>

                    {!isVerified && (
                        <>
                            {message && (
                                <div className={`p-3 rounded-xl mb-6 flex items-center gap-2 text-sm ${
                                    message.type === "success" 
                                        ? "bg-emerald-50 text-[#054431] border border-emerald-100" 
                                        : "bg-red-50 text-red-600 border border-red-100"
                                }`}>
                                    {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                    <span className="font-medium text-xs">{message.text}</span>
                                </div>
                            )}

                            <div className="bg-[#EBEFEF] rounded-xl p-4 mb-6">
                                <div className="space-y-3">
                                    {[
                                        "Buka inbox email Anda",
                                        "Klik link verifikasi di email",
                                        "Halaman ini akan otomatis terupdate"
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white text-[#054431] flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                                {i + 1}
                                            </div>
                                            <p className="text-xs font-medium text-[#1E1E1E]/70">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleResend}
                                disabled={isDisabled}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                    isDisabled
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-[#054431] border border-[#054431]/20 hover:bg-gray-50 cursor-pointer shadow-sm"
                                }`}
                            >
                                <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                                {lockedUntil
                                    ? `Coba lagi dalam ${formatTime(lockoutRemaining)}`
                                    : cooldown > 0
                                        ? `Kirim ulang dalam ${formatTime(cooldown)}`
                                        : isResending
                                            ? "Mengirim..."
                                            : "Kirim Ulang Email Verifikasi"
                                }
                            </button>

                            {attempts > 0 && !lockedUntil && (
                                <p className="text-center text-[10px] text-[#1E1E1E]/40 mt-3 font-medium">
                                    {attempts} dari {MAX_ATTEMPTS} percobaan digunakan
                                </p>
                            )}

                            <div className="relative flex items-center my-6">
                                <div className="flex-grow border-t border-[#D9D9D9]"></div>
                                <span className="flex-shrink-0 mx-3 text-[#A3A3A3] text-[9px] font-bold tracking-wider font-sans uppercase">atau</span>
                                <div className="flex-grow border-t border-[#D9D9D9]"></div>
                            </div>

                            <div className="flex justify-center items-center gap-1 mt-4">
                                <span className="text-[#1E1E1E]/80 text-xs font-sans">
                                    Sudah verifikasi?
                                </span>
                                <Link href="/login" className="text-[#4E6B03] font-bold text-xs hover:underline font-sans cursor-pointer">
                                    Masuk di sini
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-500 animate-spin" />
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}

import Link from "next/link";
import { Play, CheckCircle2, MapPin, Mail, Phone, Activity, LineChart, Smartphone, ArrowRight, QrCode, TrendingUp, ClipboardList, LayoutDashboard, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return (
        <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
            {/* NAVBAR */}
            <nav className="absolute top-0 left-0 w-full z-50">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-9 h-9 object-contain brightness-0 invert" />
                        <span className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>SheepStock</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-white font-semibold text-sm">
                        <a href="#fitur" className="hover:text-emerald-200 transition">Fitur</a>
                        <a href="#harga" className="hover:text-emerald-200 transition">Harga</a>
                        <a href="#tentang" className="hover:text-emerald-200 transition">Tentang Kami</a>
                        <a href="#kontak" className="hover:text-emerald-200 transition">Kontak</a>
                    </div>
                    {user ? (
                        <Link href="/dashboard" className="px-6 py-2.5 text-sm bg-[#012d1d]/90 hover:bg-[#012d1d] text-white rounded-full font-bold transition shadow-lg flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" /> Buka Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="px-6 py-2.5 text-sm bg-[#012d1d]/90 hover:bg-[#012d1d] text-white rounded-full font-bold transition shadow-lg">
                            Sign in
                        </Link>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative h-screen max-h-[1080px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img src="/assets/image/bg-landingpage.png" alt="" className="w-full h-full object-cover" />
                </div>
                {/* Green Gradient Overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(217,217,217,0.7) 4%, rgba(46,95,76,0.7) 55%, rgba(34,81,72,0.75) 96%)' }}></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end pb-14 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.2rem] font-semibold text-white leading-[1.05] mb-8 max-w-4xl" style={{ fontFamily: "'Poppins', sans-serif", textShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>
                        Digitalisasi<br/>Peternakan Anda<br/>Dengan<br/>
                        <span style={{ backgroundImage: 'linear-gradient(90deg, #054431 0%, #0DAA7B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SheepStock</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-14">
                        <Link href="/register" className="px-8 py-4 bg-[#054431] hover:bg-[#065a40] text-white rounded-full font-bold text-sm transition shadow-xl shadow-black/20">
                            Mulai Sekarang
                        </Link>
                        <button className="flex items-center gap-3 group">
                            <span className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-white/70 transition">
                                <Play className="w-3.5 h-3.5 fill-white/90 text-white/90" />
                            </span>
                            <span className="text-white/90 font-medium text-sm">Watch Demo</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">2.4K+</p>
                            <p className="text-xs text-white/50">Sheep Tracked</p>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">98%</p>
                            <p className="text-xs text-white/50">ADG Accuracy</p>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">12</p>
                            <p className="text-xs text-white/50">Active Pens</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURE HIGHLIGHT */}
            <section id="fitur" className="py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1000px] mx-auto grid lg:grid-cols-2 gap-8">
                    {/* LEFT: Text + 2x2 Cards */}
                    <div className="flex flex-col">
                        <span className="inline-block w-fit px-4 py-1 bg-[#054431] rounded-full text-xs font-bold text-white mb-4 uppercase tracking-widest">Transparansi Digital</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold leading-[1.1] mb-3 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Kurangi Risiko &amp; Tingkatkan Akuntabilitas</h2>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            SheepStock memberdayakan peternak modern dengan alat pengambilan keputusan berbasis data. Melalui sistem ketertelusuran yang ketat dan transparansi operasional, kami membantu Anda meminimalkan risiko kerugian dan membangun kepercayaan pasar yang lebih kuat.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: QrCode, title: "Pelacakan Ternak Kode QR", desc: "Identitas digital unik untuk setiap individu ternak dalam satu pindaian." },
                                { icon: TrendingUp, title: "Pelacakan Penggemukan & ADG", desc: "Pantau rata-rata pertambahan berat harian secara presisi dan otomatis." },
                                { icon: ClipboardList, title: "Log Operasional", desc: "Pencatatan riwayat pakan, vaksinasi, dan mutasi tanpa celah manipulasi." },
                                { icon: LayoutDashboard, title: "Dashboard Real-time", desc: "Visualisasi kesehatan bisnis peternakan Anda kapan saja dan di mana saja." },
                            ].map((f, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition hover:shadow-md">
                                    <div className="w-8 h-8 bg-emerald-800 text-white rounded-lg flex items-center justify-center mb-2"><f.icon className="w-4 h-4" /></div>
                                    <h3 className="text-xs font-extrabold mb-1 text-slate-900">{f.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Image + CTA */}
                    <div className="flex flex-col items-end justify-between gap-5">
                        <img src="/assets/image/banner-lp-2.png" alt="Farm" className="rounded-2xl shadow-lg object-cover w-full aspect-[4/3]" />
                        <Link href="#harga" className="inline-flex items-center gap-2 px-6 py-3 bg-[#054431] hover:bg-[#065a40] text-white rounded-full font-bold text-sm shadow-lg transition">
                            Pelajari Lebih Lanjut
                        </Link>
                    </div>
                </div>
            </section>

            {/* BANNER */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/assets/image/banner-lp-1.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-[#1B4332]/85"></div>
                <div className="relative z-10 max-w-3xl mx-auto text-center px-4 py-14">
                    <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 italic" style={{ fontFamily: "'Poppins', sans-serif" }}>Data-Driven Decisions for Modern Fattening &amp; Breeding.</h2>
                    <p className="text-sm text-white/60 mb-6 max-w-lg mx-auto leading-relaxed">Bergabunglah dengan ratusan peternakan yang telah menggunakan SheepStock untuk meningkatkan hasil produksi dan menekan pemborosan melalui wawasan data yang nyata.</p>
                    <Link href="/register" className="inline-block px-7 py-3 border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/10 transition">Mulai Sekarang</Link>
                </div>
            </section>


            {/* PRICING */}
            <section id="harga" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto">
                <div className="text-center mb-10 mt-6">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Pilih Paket Yang Sesuai Untuk Peternakan Anda</h2>
                    <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">Kelola hewan ternak Anda dengan presisi digital. Dari peternakan mandiri hingga industri skala besar.</p>
                </div>
                <div className="grid lg:grid-cols-3 gap-6 items-center">
                    {/* Free */}
                    <div className="bg-white rounded-[2rem] p-7 border border-slate-200 shadow-sm flex flex-col h-[420px]">
                        <h3 className="text-xl font-bold mb-1 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Gratis</h3>
                        <p className="text-sm text-slate-400 mb-6">Ideal untuk pemula dan peternak hobi.</p>
                        <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>IDR 0</span><span className="text-sm text-slate-400"> / Selamanya</span></div>
                        <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Hingga 5 ekor ternak</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Pencatatan dasar</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Dukungan komunitas</li>
                        </ul>
                        <Link href="/register" className="block w-full py-2.5 rounded-full border border-slate-900 text-center font-bold text-sm hover:bg-slate-50 transition text-slate-900 mt-auto">Coba Gratis</Link>
                    </div>
                    {/* Pro */}
                    <div className="bg-[#054431] rounded-[2rem] p-8 shadow-2xl flex flex-col relative h-[460px] z-10 scale-100 lg:scale-[1.05]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#C5FF33] text-[#054431] font-extrabold rounded-full text-xs tracking-wide border-4 border-white">PALING POPULER</div>
                        <h3 className="text-2xl font-bold text-[#C5FF33] mb-1 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Profesional</h3>
                        <p className="text-sm text-emerald-50/70 mb-6">Solusi lengkap untuk peternak ambisius.</p>
                        <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-extrabold text-white leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>IDR 150.000</span><span className="text-sm text-emerald-50/70"> / Bulan</span></div>
                        <ul className="space-y-3 mb-6 flex-1 text-sm text-emerald-50/90">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C5FF33] shrink-0" /> Hingga 100 ekor ternak</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C5FF33] shrink-0" /> Analitik kesehatan AI</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C5FF33] shrink-0" /> Pelacakan QR Code</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C5FF33] shrink-0" /> Dukungan Prioritas 24/7</li>
                        </ul>
                        <Link href="/register" className="block w-full py-2.5 rounded-full bg-[#C5FF33] text-center font-bold text-sm text-[#054431] hover:bg-[#b0eb20] transition mt-auto shadow-lg">Coba Gratis</Link>
                    </div>
                    {/* Enterprise */}
                    <div className="bg-white rounded-[2rem] p-7 border border-slate-200 shadow-sm flex flex-col h-[420px]">
                        <h3 className="text-xl font-bold mb-1 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Enterprise</h3>
                        <p className="text-sm text-slate-400 mb-6">Kapasitas industri untuk operasional masif.</p>
                        <div className="flex items-baseline gap-1 mb-6"><span className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Hubungi Kami</span></div>
                        <ul className="space-y-3 mb-6 flex-1 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Ternak tak terbatas</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Integrasi kustom (API)</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated Account Manajer</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> On-site Training &amp; Setup</li>
                        </ul>
                        <a href="#kontak" className="block w-full py-2.5 rounded-full bg-slate-50 text-center font-bold text-sm text-slate-900 hover:bg-slate-100 transition mt-auto">Hubungi Kami</a>
                    </div>
                </div>
            </section>

            {/* TESTIMONIAL */}
            <section id="tentang" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1000px] mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Apa Kata Mereka</h2>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">Peternak dari seluruh Indonesia telah merasakan manfaat SheepStock untuk operasional mereka.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            {
                                quote: "SheepStock mengubah cara saya melihat ternak. Dulu hanya perasaan, sekarang semuanya berdasarkan data akurat.",
                                name: "Bapak Slamet Rahardjo",
                                role: "Peternak Mandiri, Bogor",
                                img: "https://images.unsplash.com/photo-1595844730298-b960ff88fee6?w=200&q=60",
                                stars: 5,
                            },
                            {
                                quote: "Fitur pelacakan QR sangat membantu kami mengidentifikasi ternak secara cepat. Efisiensi operasional naik drastis.",
                                name: "Ibu Ratna Dewi",
                                role: "Manajer Peternakan, Bandung",
                                img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=60",
                                stars: 5,
                            },
                            {
                                quote: "Dashboard real-time membantu saya memantau kesehatan ternak dari mana saja. Sangat direkomendasikan!",
                                name: "Bapak Hendra Wijaya",
                                role: "Owner CV Ternak Jaya, Surabaya",
                                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=60",
                                stars: 5,
                            },
                        ].map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col">
                                {/* Quote icon */}
                                <svg className="w-8 h-8 text-emerald-100 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-3">{Array.from({length: t.stars}).map((_, j) => <svg key={j} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}</div>
                                {/* Quote */}
                                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">&ldquo;{t.quote}&rdquo;</p>
                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                                        <p className="text-xs text-slate-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section id="kontak" className="py-20 bg-[#ffffff]">
                <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Hubungi Kami</h2>
                        <p className="text-sm text-slate-500 max-w-lg mx-auto">Punya pertanyaan atau ingin konsultasi? Isi formulir di bawah dan tim kami akan menghubungi Anda dalam 24 jam.</p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-6">
                        {/* LEFT: Info + Map */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* Info Cards */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 mb-0.5">Email</p>
                                        <p className="text-sm text-slate-500">info@sheepstock.cloud</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><Phone className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 mb-0.5">Telepon</p>
                                        <p className="text-sm text-slate-500">+62 21 1234 5678</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><MapPin className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 mb-0.5">Kantor Pusat</p>
                                        <p className="text-sm text-slate-500">Dramaga, Kabupaten Bogor, Jawa Barat</p>
                                    </div>
                                </div>
                            </div>
                            {/* Map */}
                            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-1 min-h-[200px]">
                                <iframe
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=106.7150%2C-6.5750%2C106.7450%2C-6.5450&layer=mapnik&marker=-6.5604%2C106.7277"
                                    className="w-full h-full min-h-[200px] border-0"
                                    loading="lazy"
                                    title="Lokasi SheepStock"
                                ></iframe>
                            </div>
                        </div>

                        {/* RIGHT: Form */}
                        <div className="lg:col-span-3 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Kirim Pesan</h3>
                            <p className="text-sm text-slate-400 mb-6">Kami siap membantu kebutuhan peternakan Anda.</p>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5 text-slate-700">Nama Awal</label>
                                        <input type="text" placeholder="Naufal" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5 text-slate-700">Nama Akhir</label>
                                        <input type="text" placeholder="Riyadi" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-slate-700">Alamat Email</label>
                                    <input type="email" placeholder="naufal@gmail.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-slate-700">Jumlah Ternak</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none">
                                        <option>Kurang dari 100</option>
                                        <option>100 - 500</option>
                                        <option>500+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 text-slate-700">Pesan</label>
                                    <textarea rows={3} placeholder="Ceritakan tentang operasional Anda..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"></textarea>
                                </div>
                                <button type="button" className="w-full py-3 bg-[#054431] text-white rounded-xl font-bold text-sm hover:bg-[#065a40] transition shadow-lg">Kirim Pesan</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative bg-[#0B1F17] overflow-hidden">
                {/* Subtle gradient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Newsletter / CTA Strip */}
                <div className="relative z-10 border-b border-white/5">
                    <div className="max-w-[1100px] mx-auto px-6 md:px-12 lg:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Siap Memulai Digitalisasi?</h3>
                            <p className="text-sm text-white/40">Bergabung dengan ribuan peternak modern di seluruh Indonesia.</p>
                        </div>
                        <Link href="/register" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0B1F17] rounded-full font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 shrink-0">
                            Daftar Gratis →
                        </Link>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-12 lg:px-16 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        {/* Brand Column */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4">
                                <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-9 h-9 object-contain brightness-0 invert" />
                                <span className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>SheepStock</span>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-[260px]">
                                Platform manajemen peternakan digital terdepan untuk operasional yang lebih efisien dan transparan.
                            </p>
                            {/* Social Icons */}
                            <div className="flex items-center gap-3">
                                {[
                                    { label: "Instagram", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" },
                                    { label: "YouTube", path: "M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" },
                                    { label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" },
                                ].map((social) => (
                                    <a key={social.label} href="#" aria-label={social.label} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 flex items-center justify-center text-white/40 hover:text-emerald-400 transition-all duration-300">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={social.path} /></svg>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5">Navigasi</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: "Beranda", href: "#" },
                                    { label: "Fitur", href: "#fitur" },
                                    { label: "Harga", href: "#harga" },
                                    { label: "Tentang Kami", href: "#tentang" },
                                    { label: "Kontak", href: "#kontak" },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-sm text-white/35 hover:text-emerald-400 transition-colors duration-200">{link.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5">Produk</h4>
                            <ul className="space-y-3">
                                {[
                                    "Dashboard",
                                    "Manajemen Ternak",
                                    "Pelacakan QR Code",
                                    "Analitik Kesehatan",
                                    "Manajemen Pakan",
                                ].map((item) => (
                                    <li key={item}>
                                        <span className="text-sm text-white/35 hover:text-emerald-400 transition-colors duration-200 cursor-default">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5">Kontak</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="text-sm text-white/70">info@sheepstock.cloud</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Telepon</p>
                                        <p className="text-sm text-white/70">+62 21 1234 5678</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Alamat</p>
                                        <p className="text-sm text-white/70">Dramaga, Kab. Bogor,<br />Jawa Barat</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-10 border-t border-white/5">
                    <div className="max-w-[1100px] mx-auto px-6 md:px-12 lg:px-16 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p className="text-xs text-white/25">&copy; 2026 SheepStock. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}

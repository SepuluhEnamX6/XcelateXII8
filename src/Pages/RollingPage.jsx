import { useState, useEffect } from "react"
import AOS from "aos"
import "aos/dist/aos.css"

const pesertaDidik = [
	{ noAbsen: 1,  nama: "Aneila",    jenisKelamin: "wanita" },
	{ noAbsen: 2,  nama: "Angel",     jenisKelamin: "wanita" },
	{ noAbsen: 3,  nama: "Marlev",    jenisKelamin: "pria" },
	{ noAbsen: 4,  nama: "Anisa",     jenisKelamin: "wanita" },
	{ noAbsen: 5,  nama: "Hanan",     jenisKelamin: "wanita" },
	{ noAbsen: 6,  nama: "Artha",     jenisKelamin: "wanita" },
	{ noAbsen: 7,  nama: "Lyta",      jenisKelamin: "wanita" },
	{ noAbsen: 8,  nama: "Aurel",     jenisKelamin: "wanita" },
	{ noAbsen: 9,  nama: "Nasihah",   jenisKelamin: "wanita" },
	{ noAbsen: 10, nama: "Erni",      jenisKelamin: "wanita" },
	{ noAbsen: 11, nama: "Frida",     jenisKelamin: "wanita" },
	{ noAbsen: 12, nama: "Gea",       jenisKelamin: "wanita" },
	{ noAbsen: 13, nama: "Jagad",     jenisKelamin: "pria" },
	{ noAbsen: 14, nama: "Jihan",     jenisKelamin: "wanita" },
	{ noAbsen: 15, nama: "Nida",      jenisKelamin: "wanita" },
	{ noAbsen: 16, nama: "Mila",      jenisKelamin: "wanita" },
	{ noAbsen: 17, nama: "Desta",     jenisKelamin: "pria" },
	{ noAbsen: 18, nama: "Yosha",     jenisKelamin: "pria" },
	{ noAbsen: 19, nama: "Nabila",    jenisKelamin: "wanita" },
	{ noAbsen: 20, nama: "Hanun",     jenisKelamin: "wanita" },
	{ noAbsen: 21, nama: "Hana",      jenisKelamin: "wanita" },
	{ noAbsen: 22, nama: "Vanda",     jenisKelamin: "wanita" },
	{ noAbsen: 23, nama: "Nana",      jenisKelamin: "wanita" },
	{ noAbsen: 24, nama: "Ailsa",     jenisKelamin: "wanita" },
	{ noAbsen: 25, nama: "Nasywa",    jenisKelamin: "wanita" },
	{ noAbsen: 26, nama: "Riha",      jenisKelamin: "wanita" },
	{ noAbsen: 27, nama: "Naura",     jenisKelamin: "wanita" },
	{ noAbsen: 28, nama: "Niki",      jenisKelamin: "wanita" },
	{ noAbsen: 29, nama: "Nimas",     jenisKelamin: "wanita" },
	{ noAbsen: 30, nama: "Rani",      jenisKelamin: "wanita" },
	{ noAbsen: 31, nama: "Janez",     jenisKelamin: "wanita" },
	{ noAbsen: 32, nama: "Nufa",      jenisKelamin: "wanita" },
	{ noAbsen: 33, nama: "Shellyana", jenisKelamin: "wanita" },
	{ noAbsen: 34, nama: "Hestu",     jenisKelamin: "wanita" },
	{ noAbsen: 35, nama: "Syahra",    jenisKelamin: "wanita" },
	{ noAbsen: 36, nama: "Tiara",     jenisKelamin: "wanita" },
]

function shuffleArray(array) {
	const arr = [...array]
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[arr[i], arr[j]] = [arr[j], arr[i]]
	}
	return arr
}

function acakTempat(peserta) {
	const pria = shuffleArray(peserta.filter((p) => p.jenisKelamin === "pria"))
	const wanita = shuffleArray(peserta.filter((p) => p.jenisKelamin === "wanita"))

	const pasangan = []
	while (pria.length >= 2) pasangan.push({ jenis: "pria", siswa: [pria.pop(), pria.pop()] })
	while (wanita.length >= 2) pasangan.push({ jenis: "wanita", siswa: [wanita.pop(), wanita.pop()] })

	const sisa = [...pria, ...wanita]
	if (sisa.length === 2) pasangan.push({ jenis: "campur", siswa: shuffleArray(sisa) })
	else if (sisa.length === 1) pasangan.push({ jenis: sisa[0].jenisKelamin, siswa: [sisa[0]] })

	return shuffleArray(pasangan).map((p, i) => ({ nomorMeja: i + 1, ...p }))
}

function downloadHasil(hasil) {
	const lines = hasil.map((m) => {
		const names = m.siswa.map((s) => `${s.nama} (${s.noAbsen})`).join(" & ")
		return `Meja ${m.nomorMeja}: ${names}`
	})
	const blob = new Blob([lines.join("\n")], { type: "text/plain" })
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = "hasil_tempat_duduk_XII8.txt"
	a.click()
	URL.revokeObjectURL(url)
}

export default function RollingPage() {
	const [hasil, setHasil] = useState([])
	const [sudahAcak, setSudahAcak] = useState(false)
	const [animating, setAnimating] = useState(false)

	useEffect(() => {
		AOS.init()
		AOS.refresh()
	}, [])

	function handleAcak() {
		setAnimating(true)
		setSudahAcak(false)
		setTimeout(() => {
			setHasil(acakTempat(pesertaDidik))
			setSudahAcak(true)
			setAnimating(false)
			setTimeout(() => {
				document.getElementById("hasil-section")?.scrollIntoView({ behavior: "smooth" })
			}, 100)
		}, 600)
	}

	const glassCard = {
		background: "rgba(255,255,255,0.07)",
		border: "1px solid rgba(255,255,255,0.1)",
		backdropFilter: "blur(10px)",
		WebkitBackdropFilter: "blur(10px)",
		boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
	}

	return (
		<div
			className="min-h-screen px-4 py-12 md:px-[8%]"
			style={{ background: "#1e1e1e", fontFamily: '"Poppins", sans-serif' }}>

			{/* Header */}
			<div className="text-center mb-12" data-aos="fade-up" data-aos-duration="600">
				<h1 className="text-3xl md:text-5xl font-semibold text-white mb-3" id="Glow">
					Rolling Tempat Duduk
				</h1>
				<p style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm md:text-base max-w-xl mx-auto">
					Pengacak tempat duduk kelas XII 8 secara adil dan otomatis
				</p>

				<button
					onClick={handleAcak}
					disabled={animating}
					className="mt-8 px-10 py-4 rounded-full text-white font-semibold text-base transition-all duration-300"
					style={{
						background: animating
							? "rgba(224,107,213,0.4)"
							: "linear-gradient(135deg, #e06bd5, #4b39c6)",
						boxShadow: animating ? "none" : "0 0 20px rgba(224,107,213,0.5)",
						border: "none",
						cursor: animating ? "not-allowed" : "pointer",
					}}>
					{animating ? "Mengacak..." : "🎲 Acak Tempat Duduk"}
				</button>
			</div>

			{/* Tabel daftar siswa */}
			<div className="rounded-3xl p-6 mb-10" style={glassCard} data-aos="fade-up" data-aos-duration="700">
				<h2 className="text-white text-xl font-semibold mb-5" id="Glow">
					Daftar Siswa Kelas XII 8
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
						<thead>
							<tr>
								{["No. Absen", "Nama", "Jenis Kelamin"].map((h) => (
									<th
										key={h}
										className="text-left px-4 py-3 font-semibold"
										style={{
											background: "rgba(224,107,213,0.2)",
											color: "#e06bd5",
											borderBottom: "1px solid rgba(255,255,255,0.1)",
										}}>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{pesertaDidik.map((s, i) => (
								<tr
									key={s.noAbsen}
									style={{
										background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.03)",
										borderBottom: "1px solid rgba(255,255,255,0.05)",
									}}>
									<td className="px-4 py-3 text-white">{s.noAbsen}</td>
									<td className="px-4 py-3 text-white">{s.nama}</td>
									<td className="px-4 py-3">
										<span
											className="px-3 py-1 rounded-full text-xs font-medium"
											style={
												s.jenisKelamin === "pria"
													? { background: "rgba(58,130,200,0.2)", color: "#7ab3e8", border: "1px solid rgba(58,130,200,0.3)" }
													: { background: "rgba(224,107,213,0.2)", color: "#e06bd5", border: "1px solid rgba(224,107,213,0.3)" }
											}>
											{s.jenisKelamin === "pria" ? "Laki-laki" : "Perempuan"}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Hasil acak */}
			{sudahAcak && (
				<div id="hasil-section" data-aos="fade-up" data-aos-duration="500">
					<div className="rounded-3xl p-6" style={glassCard}>
						<div className="flex justify-between items-center mb-6 flex-wrap gap-3">
							<h2 className="text-white text-xl font-semibold" id="Glow">
								Hasil Pengacakan
							</h2>
							<div className="flex gap-2">
								<button
									onClick={handleAcak}
									className="px-4 py-2 rounded-xl text-sm text-white"
									style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}>
									🔄 Acak Ulang
								</button>
								<button
									onClick={() => downloadHasil(hasil)}
									className="px-4 py-2 rounded-xl text-sm font-medium"
									style={{
										background: "linear-gradient(135deg, #e06bd5, #4b39c6)",
										border: "none",
										color: "white",
									}}>
									⬇ Unduh
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
							{hasil.map((meja) => (
								<div
									key={meja.nomorMeja}
									className="rounded-2xl p-4"
									style={{
										background:
											meja.jenis === "pria"
												? "rgba(58,130,200,0.12)"
												: meja.jenis === "wanita"
												? "rgba(224,107,213,0.12)"
												: "rgba(110,231,183,0.1)",
										border:
											meja.jenis === "pria"
												? "1px solid rgba(58,130,200,0.25)"
												: meja.jenis === "wanita"
												? "1px solid rgba(224,107,213,0.25)"
												: "1px solid rgba(110,231,183,0.2)",
									}}>
									<p
										className="text-sm font-semibold mb-2"
										style={{
											color:
												meja.jenis === "pria" ? "#7ab3e8"
												: meja.jenis === "wanita" ? "#e06bd5"
												: "#6ee7b7",
										}}>
										Meja {meja.nomorMeja}
									</p>
									{meja.siswa.map((s) => (
										<div
											key={s.noAbsen}
											className="flex items-center gap-2 mt-1">
											<span
												className="text-xs px-2 py-0.5 rounded-full"
												style={{
													background: "rgba(255,255,255,0.1)",
													color: "rgba(255,255,255,0.5)",
												}}>
												{s.noAbsen}
											</span>
											<span className="text-white text-sm">{s.nama}</span>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Back button */}
			<div className="text-center mt-10">
				<a
					href="/"
					className="text-sm"
					style={{ color: "rgba(255,255,255,0.3)" }}>
					← Kembali ke halaman utama
				</a>
			</div>
		</div>
	)
}

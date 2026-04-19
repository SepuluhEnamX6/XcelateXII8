import { useState, useEffect, useRef } from "react"
import AOS from "aos"
import { supabase } from "../supabaseClient"

const AVATAR_COLORS = [
	["#e06bd5", "#4b39c6"],
	["#4b39c6", "#e06bd5"],
	["#686e9d", "#e06bd5"],
	["#e06bd5", "#686e9d"],
	["#575c84", "#e06bd5"],
	["#4b39c6", "#686e9d"],
]

const BULAN_ID = {
	"Januari": 1, "Februari": 2, "Maret": 3, "April": 4,
	"Mei": 5, "Juni": 6, "Juli": 7, "Agustus": 8,
	"September": 9, "Oktober": 10, "November": 11, "Desember": 12,
}

function isBirthdayToday(tanggalLahir) {
	if (!tanggalLahir) return false
	const parts = tanggalLahir.trim().split(" ")
	if (parts.length < 2) return false
	const day = parseInt(parts[0])
	const month = BULAN_ID[parts[1]]
	if (!day || !month) return false
	const today = new Date()
	return today.getDate() === day && (today.getMonth() + 1) === month
}

function getInitials(nama) {
	return nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function getFotoUrl(absen) {
	let fileName = `${absen}.JPG`
	if (absen === 2) fileName = "99.JPG"
	if (absen === 3) fileName = "98.JPG"

	const { data } = supabase.storage
		.from("foto-siswa")
		.getPublicUrl(fileName)

	return data.publicUrl
}

async function preloadFotos(dataSiswa) {
	const map = {}
	await Promise.all(
		dataSiswa.map(
			(siswa) =>
				new Promise((resolve) => {
					const url = getFotoUrl(siswa.absen)
					const img = new Image()
					img.onload = () => {
						map[siswa.absen] = url
						resolve()
					}
					img.onerror = () => resolve()
					img.src = url
				})
		)
	)
	return map
}

async function downloadFoto(siswa, fotoSrc) {
	if (fotoSrc) {
		try {
			const res = await fetch(fotoSrc)
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement("a")
			link.href = url
			link.download = `foto_${siswa.nama.replace(/ /g, "_")}.JPG`
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch (err) {
			console.error("Gagal download:", err)
		}
		return
	}

	const canvas = document.createElement("canvas")
	canvas.width = 500
	canvas.height = 600
	const ctx = canvas.getContext("2d")

	if (siswa.almarhumah) {
		const grad = ctx.createLinearGradient(0, 0, 500, 600)
		grad.addColorStop(0, "#3a3a3a")
		grad.addColorStop(1, "#1a1a1a")
		ctx.fillStyle = grad
		ctx.fillRect(0, 0, 500, 600)
		ctx.strokeStyle = "rgba(200,185,100,0.5)"
		ctx.lineWidth = 6
		ctx.strokeRect(3, 3, 494, 594)
	} else {
		const colors = AVATAR_COLORS[siswa.absen % AVATAR_COLORS.length]
		const grad = ctx.createLinearGradient(0, 0, 500, 600)
		grad.addColorStop(0, colors[0])
		grad.addColorStop(1, colors[1])
		ctx.fillStyle = grad
		ctx.fillRect(0, 0, 500, 600)
	}

	const overlay = ctx.createLinearGradient(0, 300, 0, 600)
	overlay.addColorStop(0, "rgba(30,30,30,0)")
	overlay.addColorStop(1, "rgba(30,30,30,0.7)")
	ctx.fillStyle = overlay
	ctx.fillRect(0, 0, 500, 600)

	ctx.beginPath()
	ctx.arc(250, 175, 110, 0, Math.PI * 2)
	ctx.fillStyle = "rgba(255,255,255,0.15)"
	ctx.fill()

	if (siswa.almarhumah) {
		ctx.font = "40px sans-serif"
		ctx.textAlign = "center"
		ctx.fillStyle = "rgba(200,185,100,0.8)"
		ctx.fillText("🌹", 250, 80)
	}

	ctx.fillStyle = "white"
	ctx.font = "bold 76px sans-serif"
	ctx.textAlign = "center"
	ctx.textBaseline = "middle"
	ctx.fillText(getInitials(siswa.nama), 250, 175)

	ctx.font = "bold 24px sans-serif"
	ctx.fillStyle = "white"
	const namaDisplay = siswa.nama.length > 24 ? siswa.nama.slice(0, 24) + "…" : siswa.nama
	ctx.fillText(namaDisplay, 250, 330)

	if (siswa.almarhumah) {
		ctx.font = "italic 15px sans-serif"
		ctx.fillStyle = "rgba(200,185,100,0.9)"
		ctx.fillText("Almarhumah — Selalu di hati kami", 250, 358)
	}

	ctx.font = "17px sans-serif"
	ctx.fillStyle = "rgba(255,255,255,0.7)"
	ctx.fillText(`No. Absen: ${siswa.absen}`, 250, siswa.almarhumah ? 390 : 368)

	ctx.font = "13px sans-serif"
	ctx.fillStyle = "rgba(255,255,255,0.35)"
	ctx.fillText("XII 8 — XCELATE", 250, 575)

	const link = document.createElement("a")
	link.download = `foto_${siswa.nama.replace(/ /g, "_")}.JPG`
	link.href = canvas.toDataURL()
	link.click()
}

function KartuSiswa({ siswa, fotoSrc }) {
	const [clickCount, setClickCount] = useState(0)
	const [toastMsg, setToastMsg] = useState("")
	const resetTimer = useRef(null)
	const MAX_CLICK = 5
	const progress = Math.min((clickCount / MAX_CLICK) * 100, 100)
	const colors = AVATAR_COLORS[siswa.absen % AVATAR_COLORS.length]

	const isAlmarhumah = siswa.almarhumah === true
	const isBirthday = !isAlmarhumah && isBirthdayToday(siswa.tanggal_lahir)

	function tampilToast(msg) {
		setToastMsg(msg)
		setTimeout(() => setToastMsg(""), 1500)
	}

	function handleFotoClick() {
		const newCount = clickCount + 1
		clearTimeout(resetTimer.current)
		resetTimer.current = setTimeout(() => setClickCount(0), 3000)
		if (newCount >= MAX_CLICK) {
			downloadFoto(siswa, fotoSrc)
			tampilToast("Download berhasil!")
			setClickCount(0)
			clearTimeout(resetTimer.current)
		} else {
			setClickCount(newCount)
			tampilToast(`${newCount}/${MAX_CLICK} klik untuk download`)
		}
	}

	const cardStyle = isAlmarhumah
		? {
			background: "rgba(60,55,40,0.55)",
			border: "1px solid rgba(200,185,100,0.35)",
			backdropFilter: "blur(10px)",
			WebkitBackdropFilter: "blur(10px)",
			boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
		}
		: isBirthday
		? {
			background: "rgba(255,220,50,0.08)",
			border: "2px solid rgba(255,215,0,0.65)",
			backdropFilter: "blur(10px)",
			WebkitBackdropFilter: "blur(10px)",
			boxShadow: "0 0 24px rgba(255,215,0,0.35), 0 4px 30px rgba(0,0,0,0.2)",
			animation: "birthdayPulse 2s ease-in-out infinite",
		}
		: {
			background: "rgba(255,255,255,0.07)",
			border: "1px solid rgba(255,255,255,0.1)",
			backdropFilter: "blur(10px)",
			WebkitBackdropFilter: "blur(10px)",
			boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
		}

	const avatarStyle = isAlmarhumah
		? {
			background: "linear-gradient(135deg, #4a4a4a, #2a2a2a)",
			boxShadow: "0 0 18px rgba(200,185,100,0.3)",
			border: "2px solid rgba(200,185,100,0.4)",
		}
		: isBirthday
		? {
			background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
			boxShadow: "0 0 22px rgba(255,215,0,0.65)",
			border: "3px solid rgba(255,215,0,0.85)",
		}
		: {
			background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
			boxShadow: `0 0 18px ${colors[0]}55`,
			border: "2px solid rgba(255,255,255,0.15)",
		}

	return (
		<>
			{/* Inject keyframes sekali via style tag — tidak masalah render ulang */}
			<style>{`
				@keyframes birthdayPulse {
					0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.3), 0 4px 30px rgba(0,0,0,0.2); }
					50%       { box-shadow: 0 0 38px rgba(255,215,0,0.65), 0 4px 30px rgba(0,0,0,0.2); }
				}
			`}</style>

			<div
				className="relative flex flex-col items-center p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105"
				style={cardStyle}
			>
				{/* Badge nomor absen */}
				<div
					className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded-full"
					style={
						isAlmarhumah
							? { background: "rgba(200,185,100,0.2)", border: "1px solid rgba(200,185,100,0.5)", color: "#c8b964" }
							: isBirthday
							? { background: "rgba(255,215,0,0.2)", border: "1px solid rgba(255,215,0,0.6)", color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.8)" }
							: { background: "rgba(224,107,213,0.2)", border: "1px solid rgba(224,107,213,0.4)", color: "#e06bd5", textShadow: "0 0 8px rgba(224,107,213,0.8)" }
					}
				>
					{siswa.absen}
				</div>

				{/* Badge kanan atas: 🎂 atau 🌹 */}
				{isBirthday && (
					<div
						className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
						style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.5)", color: "#ffd700", fontSize: "13px" }}
					>
						🎂
					</div>
				)}
				{isAlmarhumah && (
					<div
						className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
						style={{ background: "rgba(200,185,100,0.15)", border: "1px solid rgba(200,185,100,0.4)", color: "#c8b964", fontSize: "10px" }}
					>
						🌹
					</div>
				)}

				{/* Avatar / foto */}
				<div
					onClick={handleFotoClick}
					className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer select-none mb-3 mt-2 overflow-hidden"
					style={avatarStyle}
					title="Klik 5x untuk download foto"
				>
					{fotoSrc ? (
						<img
							src={fotoSrc}
							alt={siswa.nama}
							className="w-full h-full object-cover"
							draggable={false}
							style={isAlmarhumah ? { filter: "grayscale(100%)" } : {}}
						/>
					) : (
						<span
							className="font-bold text-2xl"
							style={{
								color: isAlmarhumah ? "#c8b964" : isBirthday ? "#ffd700" : "white",
								textShadow: isAlmarhumah
									? "0 0 10px rgba(200,185,100,0.6)"
									: isBirthday
									? "0 0 10px rgba(255,215,0,0.8)"
									: "0 0 10px rgba(255,255,255,0.5)",
							}}
						>
							{getInitials(siswa.nama)}
						</span>
					)}
				</div>

				{/* Nama */}
				<p
					className="font-semibold text-sm leading-tight mb-1"
					style={{
						color: isAlmarhumah ? "#e8e0b0" : isBirthday ? "#ffd700" : "white",
						textShadow: isAlmarhumah
							? "0 0 8px rgba(200,185,100,0.3)"
							: isBirthday
							? "0 0 8px rgba(255,215,0,0.4)"
							: "0 0 8px rgba(255,255,255,0.3)",
					}}
				>
					{isAlmarhumah ? "Alm. " : ""}{siswa.nama}
				</p>

				{/* Sub-teks */}
				{isBirthday && (
					<p className="text-xs mt-0.5 font-semibold" style={{ color: "#ffd700", fontSize: "10px", textShadow: "0 0 6px rgba(255,215,0,0.8)" }}>
						🎉 Selamat Ulang Tahun!
					</p>
				)}
				{isAlmarhumah && (
					<p className="text-xs mt-1 italic" style={{ color: "rgba(200,185,100,0.7)", fontSize: "10px" }}>
						Innalillahi wa inna ilaihi raji'un
					</p>
				)}

				<div className="mb-2" />

				{/* Progress bar */}
				<div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
					<div
						className="h-full rounded-full transition-all duration-200"
						style={{
							width: `${progress}%`,
							background: isAlmarhumah
								? "linear-gradient(to right, #8a7a30, #c8b964)"
								: isBirthday
								? "linear-gradient(to right, #b8860b, #ffd700)"
								: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
							boxShadow: isAlmarhumah
								? "0 0 6px #c8b96460"
								: isBirthday
								? "0 0 6px rgba(255,215,0,0.6)"
								: `0 0 6px ${colors[0]}`,
						}}
					/>
				</div>

				{toastMsg && (
					<p
						className="text-xs mt-1.5"
						style={{
							color: isAlmarhumah ? "#c8b964" : isBirthday ? "#ffd700" : "#e06bd5",
							textShadow: isAlmarhumah
								? "0 0 6px rgba(200,185,100,0.8)"
								: isBirthday
								? "0 0 6px rgba(255,215,0,0.8)"
								: "0 0 6px rgba(224,107,213,0.8)",
						}}
					>
						{toastMsg}
					</p>
				)}
			</div>
		</>
	)
}

export default function FullMember() {
	const [search, setSearch] = useState("")
	const [dataSiswa, setDataSiswa] = useState([])
	const [fotoMap, setFotoMap] = useState({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		AOS.init()
		AOS.refresh()
		fetchSiswa()
	}, [])

	async function fetchSiswa() {
		const { data, error } = await supabase
			.from("siswa")
			.select("*")
			.order("absen", { ascending: true })

		if (error) {
			console.error(error)
			setLoading(false)
			return
		}

		setDataSiswa(data)
		setLoading(false)

		const map = await preloadFotos(data)
		setFotoMap(map)
	}

	const filtered = dataSiswa.filter(
		(s) =>
			s.nama.toLowerCase().includes(search.toLowerCase()) ||
			String(s.absen).includes(search)
	)

	const totalAlmarhumah = dataSiswa.filter(s => s.almarhumah).length

	return (
		<div className="px-4 py-8 md:px-[5%]">
			<div className="text-center mb-8" data-aos="fade-up" data-aos-duration="600">
				<h2 className="text-3xl md:text-4xl font-semibold text-white mb-2" id="Glow">
					Full Member
				</h2>
				<p style={{ color: "rgba(255,255,255,0.5)", fontFamily: '"Poppins", sans-serif' }} className="text-sm">
					Klik foto <span style={{ color: "#e06bd5" }}>5×</span> untuk download otomatis
				</p>
			</div>

			<div className="flex gap-3 justify-center flex-wrap mb-6" data-aos="fade-up" data-aos-duration="700">
				{[
					{ label: "Total Siswa",  val: dataSiswa.length,   color: null },
					{ label: "Laki-laki",    val: 4,                  color: "rgba(58,130,200,0.15)",  border: "rgba(58,130,200,0.3)",  text: "#7ab3e8" },
					{ label: "Perempuan",    val: 32,                 color: "rgba(150,50,120,0.15)",  border: "rgba(180,80,150,0.3)",  text: "#e8a0c8" },
					{ label: "Almarhumah",   val: totalAlmarhumah,    color: "rgba(100,90,30,0.2)",    border: "rgba(200,185,100,0.3)", text: "#c8b964" },
				].map((s) => (
					<div
						key={s.label}
						className="px-6 py-3 rounded-2xl text-center"
						style={{ background: s.color ?? "rgba(255,255,255,0.07)", border: `1px solid ${s.border ?? "rgba(255,255,255,0.1)"}`, backdropFilter: "blur(10px)" }}
					>
						<p style={{ color: s.text ?? "rgba(255,255,255,0.45)", fontSize: "12px" }}>{s.label}</p>
						<p className="text-2xl font-semibold" style={{ color: s.text ?? "white" }} id="Glow">{s.val}</p>
					</div>
				))}
			</div>

			<div className="flex justify-center mb-8" data-aos="fade-up" data-aos-duration="750">
				<input
					type="text"
					placeholder="Cari nama atau nomor absen..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full max-w-md px-5 py-3 rounded-2xl text-sm focus:outline-none"
					style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", fontFamily: '"Poppins", sans-serif', color: "white" }}
				/>
			</div>

			{loading ? (
				<p className="text-center py-16" style={{ color: "rgba(255,255,255,0.4)" }}>Memuat data...</p>
			) : filtered.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" data-aos="fade-up" data-aos-duration="800">
					{filtered.map((siswa) => (
						<KartuSiswa
							key={siswa.absen}
							siswa={siswa}
							fotoSrc={fotoMap[siswa.absen] ?? null}
						/>
					))}
				</div>
			) : (
				<p className="text-center py-16" style={{ color: "rgba(255,255,255,0.3)" }}>Tidak ada siswa ditemukan</p>
			)}
		</div>
	)
}
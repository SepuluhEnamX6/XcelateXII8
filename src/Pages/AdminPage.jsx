import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import DeleteIcon from "@mui/icons-material/Delete"
import LogoutIcon from "@mui/icons-material/Logout"
import RefreshIcon from "@mui/icons-material/Refresh"

const BUCKET = "foto"
// ✅ Ganti password ini sesuai keinginan
const ADMIN_PASSWORD = "xii8admin2026"

export default function AdminPage() {
	const [authed, setAuthed] = useState(false)
	const [passInput, setPassInput] = useState("")
	const [passError, setPassError] = useState("")
	const [images, setImages] = useState([])
	const [loading, setLoading] = useState(false)
	const [deleting, setDeleting] = useState(null)
	const [msg, setMsg] = useState("")

	// Cek session admin dari sessionStorage
	useEffect(() => {
		if (sessionStorage.getItem("admin_auth") === "true") setAuthed(true)
	}, [])

	function handleLogin(e) {
		e.preventDefault()
		if (passInput === ADMIN_PASSWORD) {
			sessionStorage.setItem("admin_auth", "true")
			setAuthed(true)
			setPassError("")
		} else {
			setPassError("Password salah!")
			setPassInput("")
		}
	}

	function handleLogout() {
		sessionStorage.removeItem("admin_auth")
		setAuthed(false)
		setImages([])
	}

	async function fetchImages() {
		setLoading(true)
		setMsg("")
		try {
			const { data, error } = await supabase.storage
				.from(BUCKET)
				.list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } })

			if (error) { setMsg("Gagal memuat foto: " + error.message); return }

			const urls = (data || [])
				.filter((f) => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
				.map((f) => {
					const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
					return { url: urlData.publicUrl, name: f.name, timestamp: f.created_at, id: f.id }
				})

			setImages(urls)
		} catch (e) {
			setMsg("Error: " + e.message)
		} finally {
			setLoading(false)
		}
	}

	async function handleDelete(fileName) {
		if (!window.confirm(`Hapus foto "${fileName}"?`)) return
		setDeleting(fileName)
		const { error } = await supabase.storage.from(BUCKET).remove([fileName])
		if (error) {
			setMsg("Gagal hapus: " + error.message)
		} else {
			setMsg(`✓ Foto "${fileName}" berhasil dihapus`)
			setImages((prev) => prev.filter((img) => img.name !== fileName))
		}
		setDeleting(null)
	}

	useEffect(() => {
		if (authed) fetchImages()
	}, [authed])

	// ── LOGIN SCREEN ──
	if (!authed) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: "#1e1e1e" }}>
				<div
					className="w-full max-w-sm mx-4 p-8 rounded-3xl"
					style={{
						background: "rgba(255,255,255,0.07)",
						border: "1px solid rgba(255,255,255,0.12)",
						backdropFilter: "blur(20px)",
					}}>
					<div className="text-center mb-8">
						<div className="text-4xl mb-3">🔐</div>
						<h1 className="text-white text-2xl font-semibold">Admin Panel</h1>
						<p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm mt-1">XII 8 — XCELATE</p>
					</div>

					<form onSubmit={handleLogin} className="flex flex-col gap-4">
						<input
							type="password"
							placeholder="Masukkan password admin"
							value={passInput}
							onChange={(e) => setPassInput(e.target.value)}
							className="w-full px-4 py-3 rounded-2xl text-sm text-white focus:outline-none"
							style={{
								background: "rgba(255,255,255,0.07)",
								border: "1px solid rgba(255,255,255,0.15)",
								fontFamily: '"Poppins", sans-serif',
							}}
							autoFocus
						/>
						{passError && (
							<p className="text-sm text-center" style={{ color: "#ff6b6b" }}>{passError}</p>
						)}
						<button
							type="submit"
							className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all"
							style={{
								background: "linear-gradient(135deg, #e06bd5, #4b39c6)",
								border: "none",
							}}>
							Masuk
						</button>
					</form>

					<p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
						Halaman ini tidak ditampilkan di navigasi publik
					</p>
				</div>
			</div>
		)
	}

	// ── ADMIN DASHBOARD ──
	return (
		<div className="min-h-screen px-4 py-8 md:px-[8%]" style={{ background: "#1e1e1e", fontFamily: '"Poppins", sans-serif' }}>
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-white text-2xl font-semibold" id="Glow">Admin Panel</h1>
					<p style={{ color: "rgba(255,255,255,0.4)" }} className="text-sm">Kelola foto galeri XII 8</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={fetchImages}
						className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white"
						style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
						<RefreshIcon style={{ fontSize: 16 }} />
						Refresh
					</button>
					<button
						onClick={handleLogout}
						className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
						style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff6b6b" }}>
						<LogoutIcon style={{ fontSize: 16 }} />
						Logout
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="flex gap-3 mb-6">
				<div className="px-6 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
					<p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Total Foto</p>
					<p className="text-2xl font-semibold text-white">{images.length}</p>
				</div>
			</div>

			{/* Pesan status */}
			{msg && (
				<div className="mb-4 px-4 py-3 rounded-2xl text-sm"
					style={{
						background: msg.startsWith("✓") ? "rgba(110,231,183,0.1)" : "rgba(255,100,100,0.1)",
						border: `1px solid ${msg.startsWith("✓") ? "rgba(110,231,183,0.3)" : "rgba(255,100,100,0.3)"}`,
						color: msg.startsWith("✓") ? "#6ee7b7" : "#ff6b6b",
					}}>
					{msg}
				</div>
			)}

			{/* Grid foto */}
			{loading ? (
				<div className="flex justify-center py-20">
					<p style={{ color: "rgba(255,255,255,0.3)" }}>Memuat foto...</p>
				</div>
			) : images.length === 0 ? (
				<div className="flex justify-center py-20">
					<p style={{ color: "rgba(255,255,255,0.3)" }}>Tidak ada foto di bucket.</p>
				</div>
			) : (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
					{images.map((img) => (
						<div
							key={img.name}
							className="relative rounded-2xl overflow-hidden group"
							style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
							{/* Foto */}
							<img
								src={img.url}
								alt={img.name}
								className="w-full h-36 object-cover"
							/>

							{/* Overlay saat hover */}
							<div
								className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
								style={{ background: "rgba(0,0,0,0.6)" }}>
								<p className="text-white text-xs truncate">{img.name}</p>
								<div className="flex justify-between items-end">
									<p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
										{img.timestamp ? new Date(img.timestamp).toLocaleDateString("id-ID") : ""}
									</p>
									<button
										onClick={() => handleDelete(img.name)}
										disabled={deleting === img.name}
										className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
										style={{
											background: deleting === img.name ? "rgba(255,80,80,0.3)" : "rgba(255,80,80,0.8)",
											color: "white",
										}}>
										{deleting === img.name
											? <span className="text-xs">...</span>
											: <DeleteIcon style={{ fontSize: 16 }} />}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

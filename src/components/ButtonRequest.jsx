import React, { useEffect, useState } from "react"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import { useSpring, animated } from "@react-spring/web"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import { supabase } from "../supabaseClient"

const BUCKET = "foto"

export default function ButtonRequest() {
	const [open, setOpen] = useState(false)
	const handleOpen = () => setOpen(true)
	const handleClose = () => setOpen(false)

	const fade = useSpring({ opacity: open ? 1 : 0, config: { duration: 200 } })

	const [images, setImages] = useState([])
	const [loading, setLoading] = useState(false)

	const fetchImages = async () => {
		setLoading(true)
		try {
			const { data, error } = await supabase.storage
				.from(BUCKET)
				.list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } })

			if (error) { console.error(error); return }

			const urls = (data || [])
				.filter((f) => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
				.map((f) => {
					const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
					return { url: urlData.publicUrl, name: f.name, timestamp: f.created_at }
				})

			setImages(urls)
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (open) fetchImages()
	}, [open])

	return (
		<div>
			<button
				onClick={handleOpen}
				className="flex items-center space-x-2 text-white px-6 py-4"
				id="SendRequest">
				<img src="/Request.png" alt="Icon" className="w-6 h-6 relative bottom-1" />
				<span className="text-base lg:text-1xl">Request</span>
			</button>

			<Modal
				aria-labelledby="spring-modal-title"
				aria-describedby="spring-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{ timeout: 500 }}>
				<animated.div style={fade}>
					<Box className="modal-container">
						{/* Header */}
						<div className="flex justify-between items-center mb-5">
							<h6 className="text-white text-xl font-semibold">Request Foto</h6>
							<CloseIcon
								style={{ cursor: "pointer", color: "rgba(255,255,255,0.5)" }}
								onClick={handleClose}
							/>
						</div>

						<Typography id="spring-modal-description" component="div">
							<div className="h-[22rem] overflow-y-scroll overflow-y-scroll-no-thumb flex flex-col gap-2">
								{loading ? (
									<div className="flex justify-center items-center h-full">
										<p className="text-white opacity-40 text-sm">Memuat foto...</p>
									</div>
								) : images.length > 0 ? (
									images.map((img, index) => (
										<div
											key={index}
											className="flex items-center gap-3 px-3 py-2 rounded-2xl"
											style={{
												background: "rgba(255,255,255,0.08)",
												border: "1px solid rgba(255,255,255,0.1)",
											}}>
											{/* Thumbnail — tidak di-blur biar keliatan */}
											<div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
												style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
												<img
													src={img.url}
													alt={`foto-${index}`}
													className="w-full h-full object-cover"
												/>
											</div>

											{/* Info nama & waktu */}
											<div className="flex flex-col flex-1 min-w-0">
												<span className="text-white text-xs font-medium truncate">
													{img.name}
												</span>
												<span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
													{img.timestamp
														? new Date(img.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
														: "—"}
												</span>
											</div>

											{/* Tombol download */}
											<a
												href={img.url}
												download={img.name}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all"
												style={{
													background: "rgba(224,107,213,0.2)",
													border: "1px solid rgba(224,107,213,0.35)",
													color: "#e06bd5",
												}}>
												<DownloadIcon style={{ fontSize: 18 }} />
											</a>
										</div>
									))
								) : (
									<div className="flex justify-center items-center h-full">
										<p className="text-white opacity-40 text-sm">Belum ada foto.</p>
									</div>
								)}
							</div>

							<p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
								Note: Jika tidak ada foto, silakan upload dulu lewat tombol SEND.
							</p>
						</Typography>
					</Box>
				</animated.div>
			</Modal>
		</div>
	)
}

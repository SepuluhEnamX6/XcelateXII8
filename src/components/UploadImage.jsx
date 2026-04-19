import React, { useState } from "react"
import Swal from "sweetalert2"
import { supabase } from "../supabaseClient"

const BUCKET = "foto"
const MAX_SIZE_MB = 10
const MAX_PER_DAY = 20

function UploadImage() {
	const [imageUpload, setImageUpload] = useState(null)

	const uploadImage = async () => {
		if (!imageUpload) return

		// Cek limit harian
		const uploadedCount = parseInt(localStorage.getItem("uploadedImagesCount")) || 0
		const lastUploadDate = localStorage.getItem("lastUploadDate")
		if (lastUploadDate && new Date(lastUploadDate).toDateString() !== new Date().toDateString()) {
			localStorage.setItem("uploadedImagesCount", 0)
		}
		if (uploadedCount >= MAX_PER_DAY) {
			Swal.fire({ icon: "error", title: "Oops...", text: "Kamu sudah mencapai batas upload hari ini.", customClass: { container: "sweet-alert-container" } })
			return
		}

		// Cek ukuran file
		if (imageUpload.size > MAX_SIZE_MB * 1024 * 1024) {
			Swal.fire({ icon: "error", title: "Oops...", text: `Ukuran foto maksimal ${MAX_SIZE_MB}MB`, customClass: { container: "sweet-alert-container" } })
			return
		}

		// Buat nama file unik tanpa spasi
		const ext = imageUpload.name.split(".").pop()
		const fileName = `upload_${Date.now()}.${ext}`

		const { error } = await supabase.storage.from(BUCKET).upload(fileName, imageUpload, { upsert: false })

		if (error) {
			console.error("Upload error:", error)
			Swal.fire({ icon: "error", title: "Gagal upload", text: error.message, customClass: { container: "sweet-alert-container" } })
			return
		}

		localStorage.setItem("uploadedImagesCount", uploadedCount + 1)
		localStorage.setItem("lastUploadDate", new Date().toISOString())
		setImageUpload(null)

		Swal.fire({ icon: "success", title: "Berhasil!", text: "Foto berhasil diupload ke galeri.", customClass: { container: "sweet-alert-container" } })
	}

	const handleImageChange = (event) => {
		setImageUpload(event.target.files[0])
	}

	return (
		<div className="flex flex-col justify-center items-center">
			<div className="text-center mb-4">
				<h1 className="text-1xl md:text-2xl md:px-10 font-bold mb-4 w-full text-white">
					Upload Your Classroom Memories
				</h1>
			</div>

			<div className="mx-auto p-4">
				<div className="mb-4">
					<input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleImageChange} />
					<label htmlFor="imageUpload" className="cursor-pointer border-dashed border-2 border-gray-400 rounded-lg p-4 w-56 h-auto flex items-center justify-center">
						{imageUpload ? (
							<div className="w-full h-full overflow-hidden">
								<img src={URL.createObjectURL(imageUpload)} alt="Preview" className="w-full h-full object-cover" />
							</div>
						) : (
							<div className="text-center px-5 py-8">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12 mx-auto text-gray-400">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								<p className="text-white opacity-60">Klik untuk pilih foto</p>
							</div>
						)}
					</label>
				</div>
			</div>

			<button
				type="button"
				className="py-2.5 w-[60%] mb-0 md:mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
				onClick={uploadImage}>
				UPLOAD
			</button>
		</div>
	)
}

export default UploadImage

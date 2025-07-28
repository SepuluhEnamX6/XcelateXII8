import React, { useEffect, useState } from "react"
import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import Typography from "@mui/material/Typography"
import { useSpring, animated } from "@react-spring/web"
import CloseIcon from "@mui/icons-material/Close"
import DownloadIcon from "@mui/icons-material/Download"
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage"
import { imageStorage } from "../firebaseImage"

export default function ButtonRequest() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const fade = useSpring({
    opacity: open ? 1 : 0,
    config: {
      duration: 200,
    },
  })

  const [images, setImages] = useState([])

  const fetchImagesFromFirebase = async () => {
    try {
      const imagesRef = ref(imageStorage, "images/")
      const list = await listAll(imagesRef)

      const imagePromises = list.items.map(async (item) => {
        const url = await getDownloadURL(item)
        const metadata = await getMetadata(item)
        return {
          url,
          timestamp: new Date(metadata.timeCreated).getTime(),
        }
      })

      const imageURLs = await Promise.all(imagePromises)
      imageURLs.sort((a, b) => b.timestamp - a.timestamp) // terbaru di atas
      setImages(imageURLs)
    } catch (error) {
      console.error("Gagal mengambil gambar:", error)
    }
  }

  useEffect(() => {
    if (open) fetchImagesFromFirebase() // hanya fetch saat dibuka
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
        BackdropProps={{
          timeout: 500,
        }}>
        <animated.div style={fade}>
          <Box className="modal-container">
            <CloseIcon
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                color: "grey",
              }}
              onClick={handleClose}
            />
            <Typography id="spring-modal-description" sx={{ mt: 2 }}>
              <h6 className="text-center text-white text-2xl mb-5">Request</h6>
              <div className="h-[22rem] overflow-y-scroll overflow-y-scroll-no-thumb">
                {images.length > 0 ? (
                  images.map((imageData, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center px-5 py-2 mt-2"
                      id="LayoutIsiButtonRequest">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageData.url}
                          alt={`Image ${index}`}
                          className="h-10 w-10 blur-sm"
                        />
                        <a
                          href={imageData.url}
                          download={`image-${index}.jpg`}
                          className="text-blue-400 hover:text-blue-200"
                          target="_blank"
                          rel="noopener noreferrer">
                          <DownloadIcon />
                        </a>
                      </div>
                      <span className="ml-2 text-white">
                        {new Date(imageData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-white text-center">Belum ada gambar.</p>
                )}
              </div>
              <div className="text-white text-[0.7rem] mt-5">
                Note: Jika tidak ada gambar, silakan reload atau upload dulu.
              </div>
            </Typography>
          </Box>
        </animated.div>
      </Modal>
    </div>
  )
}

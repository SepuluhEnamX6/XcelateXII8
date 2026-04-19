import React, { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Pages/Home"
import Carousel from "./Pages/Gallery"
import FullWidthTabs from "./Pages/Tabs"
import Footer from "./Pages/Footer"
import Chat from "./components/ChatAnonim"
import AdminPage from "./Pages/AdminPage"
import RollingPage from "./Pages/RollingPage"
import AOS from "aos"
import "aos/dist/aos.css"

function MainPage() {
	useEffect(() => {
		AOS.init()
		AOS.refresh()
	}, [])

	return (
		<>
			<Home />
			<Carousel />
			<FullWidthTabs />
			<div id="Mesh1"></div>
			<div
				className="lg:mx-[12%] lg:mt-[-5rem] lg:mb-20 hidden lg:block"
				id="ChatAnonim_lg"
				data-aos="fade-up"
				data-aos-duration="1200">
				<Chat />
			</div>
			<Footer />
		</>
	)
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/rolling" element={<RollingPage />} />
				<Route path="/admin" element={<AdminPage />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App

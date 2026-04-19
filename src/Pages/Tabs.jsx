
import React, { useEffect } from "react"
import PropTypes from "prop-types"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"
import AppBar from "@mui/material/AppBar"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import StrukturKelas from "./StrukturKelas"
import Schedule from "./Schedule"
import FullMember from "./FullMember"
import AOS from "aos"
import "aos/dist/aos.css"

function TabPanel(props) {
	useEffect(() => {
		AOS.init()
		AOS.refresh()
	}, [])

	const { children, value, index, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`full-width-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 0 }}>
					<Typography component="div">{children}</Typography>
				</Box>
			)}
		</div>
	)
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
}

function a11yProps(index) {
	return {
		id: `full-width-tab-${index}`,
		"aria-controls": `full-width-tabpanel-${index}`,
	}
}

// ✅ STYLE TAB (SUDAH RAPI & CENTER)
const tabStyle = {
	fontWeight: "500",
	color: "white",
	fontSize: "1.2rem",
	textTransform: "capitalize",
	fontFamily: '"Poppins", sans-serif',
	padding: "0.5rem 1rem",
}

export default function FullWidthTabs() {
	const theme = useTheme()
	const [value, setValue] = React.useState(0)

	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	const handleChangeIndex = (index) => {
		setValue(index)
	}

	return (
		<div
			className="md:px-[10%] md:mt-5 mt-8"
			id="Tabs"
			data-aos="fade-up"
			data-aos-duration="800"
		>
			<Box sx={{ width: "100%" }}>
				<AppBar
					position="static"
					sx={{ bgcolor: "transparent", boxShadow: "none" }}
				>
					<Tabs
						value={value}
						onChange={handleChange}
						centered // ✅ bikin center
						textColor="inherit"
						indicatorColor="inherit"
						sx={{
							"& .MuiTabs-flexContainer": {
								justifyContent: "center",
							},
							"& .MuiTabs-indicator": {
								borderBottom: "2px solid white",
							},
						}}
					>
						<Tab label="Structure" {...a11yProps(0)} sx={tabStyle} />
						<Tab label="Schedule" {...a11yProps(1)} sx={tabStyle} />
						<Tab label="Full Member" {...a11yProps(2)} sx={tabStyle} />
					</Tabs>
				</AppBar>

				<SwipeableViews
					axis={theme.direction === "rtl" ? "x-reverse" : "x"}
					index={value}
					onChangeIndex={handleChangeIndex}
				>
					<TabPanel value={value} index={0} dir={theme.direction}>
						<StrukturKelas />
					</TabPanel>
					<TabPanel value={value} index={1} dir={theme.direction}>
						<Schedule />
					</TabPanel>
					<TabPanel value={value} index={2} dir={theme.direction}>
						<FullMember />
					</TabPanel>
				</SwipeableViews>
			</Box>
		</div>
	)
} 

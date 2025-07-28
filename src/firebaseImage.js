// src/firebaseImage.js
import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"

const firebaseConfigImage = {
  apiKey: "AIzaSyCso2T79EvhBE1I92z_o0fw5soOR5NI--0",
  authDomain: "kelas118.firebaseapp.com",
  databaseURL: "https://kelas118-default-rtdb.firebaseio.com",
  projectId: "kelas118",
  storageBucket: "kelas118.appspot.com",
  messagingSenderId: "410982317577",
  appId: "1:410982317577:web:03b2e93184bab92e6082d8",
  measurementId: "G-GMLKT7M3SD"
}

// Gunakan nama app unik agar tidak bentrok dengan firebase.js
const imageApp = initializeApp(firebaseConfigImage, "imageApp")
const imageStorage = getStorage(imageApp)

export { imageStorage }

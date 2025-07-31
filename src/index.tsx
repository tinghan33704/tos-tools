import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter } from "react-router-dom"
import App from "./App"
// import 'bootstrap/dist/css/bootstrap.css'
import "./styles/index.scss"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
    <HashRouter>
        <App />
    </HashRouter>
)

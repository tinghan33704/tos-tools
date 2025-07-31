import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import copy from "rollup-plugin-copy"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        copy({
            targets: [{ src: "src/img", dest: "dist/src" }],
            hook: "writeBundle",
        }),
    ],
    resolve: {
        alias: {
            src: "/src",
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    base: "/tos-tools/",
})

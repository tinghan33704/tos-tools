import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [{ src: "src/img/**/*", dest: "." }],
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    "legacy-js-api",
                    "color-functions",
                    "global-builtin",
                    "import",
                    "if-function",
                ],
            },
        },
    },
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

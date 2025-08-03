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
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler", // or "modern"
                silenceDeprecations: [
                    "legacy-js-api",
                    "mixed-decls",
                    "color-functions",
                    "global-builtin",
                    "import",
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

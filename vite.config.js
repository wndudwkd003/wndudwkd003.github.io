import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/", // 또는 base 항목 자체가 없어도 기본이 '/'라서 괜찮습니다.
});

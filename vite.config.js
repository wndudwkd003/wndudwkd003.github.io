import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
    react(),
    imagetools(), // 이미지 자동 리사이즈/최적화
  ],
    base: "/", // 또는 base 항목 자체가 없어도 기본이 '/'라서 괜찮습니다.
});

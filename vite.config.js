import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function paperImages() {
    const virtualModuleId = "virtual:paper-images";
    const resolvedVirtualModuleId = `\0${virtualModuleId}`;
    const papersDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public/papers");
    const imagePattern = /^a(\d+)\.(?:avif|gif|jpe?g|png|webp)$/i;

    const scan = () => {
        if (!fs.existsSync(papersDirectory)) return {};

        return Object.fromEntries(
            fs.readdirSync(papersDirectory, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => {
                    const imagesDirectory = path.join(papersDirectory, entry.name, "images");
                    if (!fs.existsSync(imagesDirectory)) return [entry.name, []];
                    const thumbnailDirectory = path.join(imagesDirectory, "thumbnail");
                    const thumbnailExtensions = ["webp", "jpg", "jpeg", "png"];

                    const images = fs.readdirSync(imagesDirectory)
                        .map((fileName) => ({ fileName, match: fileName.match(imagePattern) }))
                        .filter(({ match }) => match)
                        .sort((a, b) => Number(a.match[1]) - Number(b.match[1]) || a.fileName.localeCompare(b.fileName))
                        .map(({ fileName }) => {
                            const stem = path.parse(fileName).name;
                            const thumbnailName = thumbnailExtensions
                                .map((extension) => `${stem}.${extension}`)
                                .find((candidate) => fs.existsSync(path.join(thumbnailDirectory, candidate)));

                            return {
                                src: `images/${fileName}`,
                                thumbnailSrc: thumbnailName ? `images/thumbnail/${thumbnailName}` : null,
                            };
                        });

                    return [entry.name, images];
                }),
        );
    };

    return {
        name: "paper-images",
        resolveId(id) {
            if (id === virtualModuleId) return resolvedVirtualModuleId;
        },
        load(id) {
            if (id === resolvedVirtualModuleId) return `export default ${JSON.stringify(scan())};`;
        },
        configureServer(server) {
            server.watcher.add(papersDirectory);
            server.watcher.on("all", (_event, filePath) => {
                if (!path.resolve(filePath).startsWith(papersDirectory)) return;

                const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
                if (module) server.moduleGraph.invalidateModule(module);
                server.ws.send({ type: "full-reload" });
            });
        },
    };
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
    react(),
    paperImages(),
    imagetools(), // 이미지 자동 리사이즈/최적화
  ],
    base: "/", // 또는 base 항목 자체가 없어도 기본이 '/'라서 괜찮습니다.
});

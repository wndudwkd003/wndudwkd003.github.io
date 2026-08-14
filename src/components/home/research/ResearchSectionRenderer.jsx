import { ResearchVariantCommandCenter } from "./ResearchVariantCommandCenter";
import { ResearchVariantEditorial } from "./ResearchVariantEditorial";
import { ResearchStoryBridge } from "./ResearchStoryBridge";
import { ResearchVariantTimeline } from "./ResearchVariantTimeline";

const VARIANT_COMPONENTS = {
    timeline: ResearchVariantTimeline,
    "command-center": ResearchVariantCommandCenter,
    editorial: ResearchVariantEditorial,
    story: ResearchStoryBridge,
};

function normalizePublicAsset(path) {
    if (!path) return "";

    const normalized = String(path).replace(/\\/g, "/").trim();
    if (!normalized) return "";

    if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/")) {
        return normalized;
    }

    if (normalized.startsWith("public/")) {
        return `/${normalized.slice("public/".length)}`;
    }

    return `/${normalized}`;
}

export function ResearchSectionRenderer({ item }) {
    const componentKey = item.type === "story" ? "story" : item.variant;
    const Component = VARIANT_COMPONENTS[componentKey] || ResearchVariantEditorial;
    const configuredMedia = Array.isArray(item.media?.items)
        ? item.media.items
        : item.media?.src
          ? [item.media]
          : [];
    const mediaItems = configuredMedia
        .map((media, index) => ({
            src: normalizePublicAsset(media?.src),
            alt: media?.alt || `${item.title} media ${index + 1}`,
            fit: media?.fit === "contain" ? "contain" : "cover",
            theme: media?.theme === "light" ? "light" : "dark",
        }))
        .filter((media) => Boolean(media.src));
    const mediaSrc = mediaItems[0]?.src || "";

    return <Component item={item} mediaSrc={mediaSrc} mediaItems={mediaItems} />;
}

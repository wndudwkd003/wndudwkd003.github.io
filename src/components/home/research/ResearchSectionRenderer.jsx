import { ResearchVariantCommandCenter } from "./ResearchVariantCommandCenter";
import { ResearchVariantEditorial } from "./ResearchVariantEditorial";
import { ResearchVariantTimeline } from "./ResearchVariantTimeline";
import { useRevealOnScroll } from "./useRevealOnScroll";

const VARIANT_COMPONENTS = {
    timeline: ResearchVariantTimeline,
    "command-center": ResearchVariantCommandCenter,
    editorial: ResearchVariantEditorial,
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
    const Component = VARIANT_COMPONENTS[item.variant] || ResearchVariantEditorial;
    const { ref, isVisible } = useRevealOnScroll({
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
    });
    const mediaSrc = normalizePublicAsset(item.media?.src);

    return <Component item={item} mediaSrc={mediaSrc} revealRef={ref} isVisible={isVisible} />;
}

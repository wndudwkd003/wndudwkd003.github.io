import { useEffect, useRef, useState } from "react";

export function useRevealOnScroll(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: options.threshold ?? 0.2,
                rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
            }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [options.rootMargin, options.threshold]);

    return { ref, isVisible };
}

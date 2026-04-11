import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/layout/Layout";
import siteText from "../data/siteText.json";

const HIDDEN_CHARACTER_CLASS_NAME = "hidden-page-character";
const HIDDEN_CHARACTER_FLOAT_OFFSET = 40;
const HIDDEN_CHARACTER_SIZE = 20;
const HIDDEN_PHOTO_SIZE = 280;
const HIDDEN_CHARACTER_BASE_ANGLE = -Math.PI / 2;
const HIDDEN_CHARACTER_ROTATION_SPEED = 0.009;
const HIDDEN_CHARACTER_ROTATION_EASING = 0.08;

function normalizePhotoSrc(path) {
    if (!path) return "";

    const normalized = path.replace(/\\/g, "/").trim();
    if (!normalized) return "";
    if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/")) {
        return normalized;
    }
    if (normalized.startsWith("public/")) {
        return `/${normalized.slice("public/".length)}`;
    }
    return `/${normalized}`;
}

export function HiddenPage() {
    const photoAnchorRef = useRef(null);
    const cursorPositionRef = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });
    const characterAngleRef = useRef(HIDDEN_CHARACTER_BASE_ANGLE);
    const characterVelocityRef = useRef(0);
    const photoSizeRef = useRef(HIDDEN_PHOTO_SIZE);
    const photoSrc = normalizePhotoSrc(siteText.home.photo.imagePath);
    const [characterPosition, setCharacterPosition] = useState(() => {
        const initialOrbitRadius = photoSizeRef.current / 2 + HIDDEN_CHARACTER_FLOAT_OFFSET;

        return {
            x: Math.cos(HIDDEN_CHARACTER_BASE_ANGLE) * initialOrbitRadius,
            y: Math.sin(HIDDEN_CHARACTER_BASE_ANGLE) * initialOrbitRadius,
        };
    });

    useEffect(() => {
        const handleMouseMove = (event) => {
            cursorPositionRef.current = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        const updateLayoutMetrics = () => {
            if (photoAnchorRef.current) {
                photoSizeRef.current = photoAnchorRef.current.getBoundingClientRect().width;
            }
        };

        updateLayoutMetrics();
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", updateLayoutMetrics);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", updateLayoutMetrics);
        };
    }, []);

    useEffect(() => {
        let frameId = 0;
        let lastTime = performance.now();

        const animateCharacter = (time) => {
            const deltaMs = Math.min(time - lastTime, 32);
            lastTime = time;

            const viewportCenterX = window.innerWidth / 2;
            const normalizedCursorX = viewportCenterX > 0 ? (cursorPositionRef.current.x - viewportCenterX) / viewportCenterX : 0;
            const clampedCursorX = Math.max(-1, Math.min(1, normalizedCursorX));
            const targetVelocity = clampedCursorX * HIDDEN_CHARACTER_ROTATION_SPEED;

            characterVelocityRef.current += (targetVelocity - characterVelocityRef.current) * HIDDEN_CHARACTER_ROTATION_EASING;
            characterAngleRef.current += characterVelocityRef.current * deltaMs;

            const orbitRadius = photoSizeRef.current / 2 + HIDDEN_CHARACTER_FLOAT_OFFSET;

            setCharacterPosition({
                x: Math.cos(characterAngleRef.current) * orbitRadius,
                y: Math.sin(characterAngleRef.current) * orbitRadius,
            });

            frameId = window.requestAnimationFrame(animateCharacter);
        };

        frameId = window.requestAnimationFrame(animateCharacter);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <Layout>
            <div className="page-stack hidden-page">
                <section className="hidden-page-photo-wrap" aria-label="Hidden profile photo">
                    <div className="hidden-page-photo-anchor" ref={photoAnchorRef} style={{ width: `min(100%, ${HIDDEN_PHOTO_SIZE}px)` }}>
                        <span
                            className={HIDDEN_CHARACTER_CLASS_NAME}
                            style={{
                                width: `${HIDDEN_CHARACTER_SIZE}px`,
                                height: `${HIDDEN_CHARACTER_SIZE}px`,
                                transform: `translate(-50%, -50%) translate(${characterPosition.x}px, ${characterPosition.y}px)`,
                            }}
                            aria-hidden="true"
                        />
                        <div className="home-photo-frame hidden-page-photo-frame">
                            {photoSrc ? <img src={photoSrc} alt={`${siteText.home.profile.name} profile`} className="home-photo-image" /> : null}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

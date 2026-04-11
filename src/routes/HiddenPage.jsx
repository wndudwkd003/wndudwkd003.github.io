import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../components/layout/Layout";
import siteText from "../data/siteText.json";

const HIDDEN_CHARACTER_CLASS_NAME = "hidden-page-character";
const HIDDEN_INCOMING_DOT_CLASS_NAME = "hidden-page-incoming-dot";
const HIDDEN_CHARACTER_FLOAT_OFFSET = 40;
const HIDDEN_CHARACTER_SIZE = 20;
const HIDDEN_PHOTO_SIZE = 280;
const HIDDEN_CHARACTER_BASE_ANGLE = -Math.PI / 2;
const HIDDEN_CHARACTER_ROTATION_SPEED = 0.009;
const HIDDEN_CHARACTER_ROTATION_EASING = 0.08;
const HIDDEN_INCOMING_DOT_SIZE = 10;
const HIDDEN_INCOMING_DOT_MIN_SPAWN_RADIUS = 500;
const HIDDEN_INCOMING_DOT_MAX_SPAWN_RADIUS = 700;
const HIDDEN_INCOMING_DOT_SPAWN_INTERVAL = 3000;
const HIDDEN_INCOMING_DOT_MAX_COUNT = 40;
const HIDDEN_INCOMING_DOT_MIN_SPEED = 0.04;
const HIDDEN_INCOMING_DOT_MAX_SPEED = 0.1;
const HIDDEN_INCOMING_DOT_CONTACT_PADDING = 0;
const HIDDEN_CHARACTER_CONTACT_PADDING = 0;
const HIDDEN_SPAWN_ZONE_VISIBLE = false;

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

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function getViewportBounds() {
    const root = document.documentElement;

    return {
        width: root.clientWidth,
        height: root.clientHeight,
    };
}

function createIncomingDotInSpawnZone(photoCenter, nextId) {
    const dotRadius = HIDDEN_INCOMING_DOT_SIZE / 2;
    const viewport = getViewportBounds();
    const minX = dotRadius;
    const maxX = Math.max(dotRadius, viewport.width - dotRadius);
    const minY = dotRadius;
    const maxY = Math.max(dotRadius, viewport.height - dotRadius);

    for (let attempt = 0; attempt < 24; attempt += 1) {
        const angle = randomBetween(0, Math.PI * 2);
        const radius = randomBetween(HIDDEN_INCOMING_DOT_MIN_SPAWN_RADIUS, HIDDEN_INCOMING_DOT_MAX_SPAWN_RADIUS);
        const x = photoCenter.x + Math.cos(angle) * radius;
        const y = photoCenter.y + Math.sin(angle) * radius;

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return {
                id: `incoming-dot-${nextId}`,
                x,
                y,
                speed: randomBetween(HIDDEN_INCOMING_DOT_MIN_SPEED, HIDDEN_INCOMING_DOT_MAX_SPEED),
            };
        }
    }

    const fallbackAngle = randomBetween(0, Math.PI * 2);
    const fallbackRadius = randomBetween(HIDDEN_INCOMING_DOT_MIN_SPAWN_RADIUS, HIDDEN_INCOMING_DOT_MAX_SPAWN_RADIUS);

    return {
        id: `incoming-dot-${nextId}`,
        x: Math.min(maxX, Math.max(minX, photoCenter.x + Math.cos(fallbackAngle) * fallbackRadius)),
        y: Math.min(maxY, Math.max(minY, photoCenter.y + Math.sin(fallbackAngle) * fallbackRadius)),
        speed: randomBetween(HIDDEN_INCOMING_DOT_MIN_SPEED, HIDDEN_INCOMING_DOT_MAX_SPEED),
    };
}

function relocateIncomingDot(dot, photoCenter) {
    const relocatedDot = createIncomingDotInSpawnZone(photoCenter, "recycled");

    return {
        ...dot,
        x: relocatedDot.x,
        y: relocatedDot.y,
        speed: relocatedDot.speed,
    };
}

function getCharacterOrbitPosition(angle, orbitRadius) {
    return {
        x: Math.cos(angle) * orbitRadius,
        y: Math.sin(angle) * orbitRadius,
    };
}

function getDistancePointToSegment(point, segmentStart, segmentEnd) {
    const dx = segmentEnd.x - segmentStart.x;
    const dy = segmentEnd.y - segmentStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
    }

    const projection =
        ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lengthSquared;
    const clampedProjection = Math.max(0, Math.min(1, projection));
    const closestX = segmentStart.x + dx * clampedProjection;
    const closestY = segmentStart.y + dy * clampedProjection;

    return Math.hypot(point.x - closestX, point.y - closestY);
}

export function HiddenPage() {
    const photoAnchorRef = useRef(null);
    const incomingDotIdRef = useRef(0);
    const cursorPositionRef = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });
    const characterAngleRef = useRef(HIDDEN_CHARACTER_BASE_ANGLE);
    const characterVelocityRef = useRef(0);
    const photoSizeRef = useRef(HIDDEN_PHOTO_SIZE);
    const photoSrc = normalizePhotoSrc(siteText.home.photo.imagePath);
    const [photoCenter, setPhotoCenter] = useState(() => {
        const viewport = typeof document !== "undefined" ? getViewportBounds() : { width: 0, height: 0 };

        return {
            x: viewport.width / 2,
            y: viewport.height / 2,
        };
    });
    const [characterPosition, setCharacterPosition] = useState(() => {
        const initialOrbitRadius = photoSizeRef.current / 2 + HIDDEN_CHARACTER_FLOAT_OFFSET;

        return {
            x: Math.cos(HIDDEN_CHARACTER_BASE_ANGLE) * initialOrbitRadius,
            y: Math.sin(HIDDEN_CHARACTER_BASE_ANGLE) * initialOrbitRadius,
        };
    });
    const [incomingDots, setIncomingDots] = useState([]);
    useEffect(() => {
        const handleMouseMove = (event) => {
            cursorPositionRef.current = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        const updateLayoutMetrics = () => {
            if (photoAnchorRef.current) {
                const rect = photoAnchorRef.current.getBoundingClientRect();
                photoSizeRef.current = rect.width;
                setPhotoCenter({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                });
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
            setCharacterPosition(getCharacterOrbitPosition(characterAngleRef.current, orbitRadius));

            frameId = window.requestAnimationFrame(animateCharacter);
        };

        frameId = window.requestAnimationFrame(animateCharacter);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    useEffect(() => {
        const spawnIncomingDot = () => {
            setIncomingDots((currentDots) => {
                if (currentDots.length >= HIDDEN_INCOMING_DOT_MAX_COUNT) {
                    return currentDots;
                }

                const nextDot = createIncomingDotInSpawnZone(photoCenter, incomingDotIdRef.current++);
                return [...currentDots, nextDot];
            });
        };

        spawnIncomingDot();
        const intervalId = window.setInterval(spawnIncomingDot, HIDDEN_INCOMING_DOT_SPAWN_INTERVAL);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [photoCenter]);

    useEffect(() => {
        let frameId = 0;
        let lastTime = performance.now();

        const animateIncomingDots = (time) => {
            const deltaMs = Math.min(time - lastTime, 32);
            lastTime = time;
            let shouldResetCharacter = false;
            const characterOrbitRadius = photoSizeRef.current / 2 + HIDDEN_CHARACTER_FLOAT_OFFSET;
            const characterLocalPosition = getCharacterOrbitPosition(
                characterAngleRef.current,
                characterOrbitRadius
            );
            const characterGlobalPosition = {
                x: photoCenter.x + characterLocalPosition.x,
                y: photoCenter.y + characterLocalPosition.y,
            };
            const characterContactDistance =
                HIDDEN_CHARACTER_SIZE / 2 +
                HIDDEN_INCOMING_DOT_SIZE / 2 +
                HIDDEN_CHARACTER_CONTACT_PADDING;

            setIncomingDots((currentDots) =>
                currentDots.map((dot) => {
                    const dx = photoCenter.x - dot.x;
                    const dy = photoCenter.y - dot.y;
                    const distance = Math.hypot(dx, dy);
                    const photoRadius = photoSizeRef.current / 2;
                    const dotRadius = HIDDEN_INCOMING_DOT_SIZE / 2;
                    const contactDistance = photoRadius + dotRadius + HIDDEN_INCOMING_DOT_CONTACT_PADDING;

                    if (distance <= contactDistance) {
                        return relocateIncomingDot(dot, photoCenter);
                    }

                    const travelDistance = dot.speed * deltaMs;
                    const step = distance > 0 ? Math.min(travelDistance, distance) : 0;
                    const nextDotPosition = {
                        x: dot.x + (dx / Math.max(distance, 1)) * step,
                        y: dot.y + (dy / Math.max(distance, 1)) * step,
                    };
                    const characterDistanceNow = Math.hypot(
                        characterGlobalPosition.x - dot.x,
                        characterGlobalPosition.y - dot.y
                    );
                    const characterDistanceNext = Math.hypot(
                        characterGlobalPosition.x - nextDotPosition.x,
                        characterGlobalPosition.y - nextDotPosition.y
                    );
                    const sweptCharacterDistance = getDistancePointToSegment(
                        characterGlobalPosition,
                        { x: dot.x, y: dot.y },
                        nextDotPosition
                    );

                    if (
                        characterDistanceNow <= characterContactDistance ||
                        characterDistanceNext <= characterContactDistance ||
                        sweptCharacterDistance <= characterContactDistance
                    ) {
                        shouldResetCharacter = true;
                    }

                    return {
                        ...dot,
                        x: nextDotPosition.x,
                        y: nextDotPosition.y,
                    };
                })
            );

            if (shouldResetCharacter) {
                characterAngleRef.current = HIDDEN_CHARACTER_BASE_ANGLE;
                characterVelocityRef.current = 0;
                setCharacterPosition(
                    getCharacterOrbitPosition(HIDDEN_CHARACTER_BASE_ANGLE, characterOrbitRadius)
                );
            }

            frameId = window.requestAnimationFrame(animateIncomingDots);
        };

        frameId = window.requestAnimationFrame(animateIncomingDots);

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [photoCenter]);

    return (
        <Layout>
            <div className="page-stack hidden-page">
                {HIDDEN_SPAWN_ZONE_VISIBLE
                    ? createPortal(
                          <span
                              className="hidden-page-spawn-zone"
                              style={{
                                  top: `${photoCenter.y}px`,
                                  left: `${photoCenter.x}px`,
                                  width: `${HIDDEN_INCOMING_DOT_MAX_SPAWN_RADIUS * 2}px`,
                                  height: `${HIDDEN_INCOMING_DOT_MAX_SPAWN_RADIUS * 2}px`,
                              }}
                              aria-hidden="true"
                          >
                              <span
                                  className="hidden-page-spawn-zone-hole"
                                  style={{
                                      width: `${HIDDEN_INCOMING_DOT_MIN_SPAWN_RADIUS * 2}px`,
                                      height: `${HIDDEN_INCOMING_DOT_MIN_SPAWN_RADIUS * 2}px`,
                                  }}
                              />
                          </span>,
                          document.body,
                      )
                    : null}
                {createPortal(
                    <>
                        {incomingDots.map((dot) => (
                            <span
                                key={dot.id}
                                className={HIDDEN_INCOMING_DOT_CLASS_NAME}
                                style={{
                                    width: `${HIDDEN_INCOMING_DOT_SIZE}px`,
                                    height: `${HIDDEN_INCOMING_DOT_SIZE}px`,
                                    top: `${dot.y}px`,
                                    left: `${dot.x}px`,
                                }}
                                aria-hidden="true"
                            />
                        ))}
                    </>,
                    document.body,
                )}
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

"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import s from "./mdx-image.module.css";
import Lightbox from "./Lightbox";
import Image from "next/image";

export default function CustomImage({ src, alt }: { src: string; alt: string }) {
    const [showLightbox, setShowLightbox] = useState(false);

    return (
        <>
            <figure className={s.figure} onClick={() => setShowLightbox(true)}>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3/2",
                        cursor: "pointer",
                    }}
                >
                    <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} />
                </div>
                {alt && <figcaption>{alt}</figcaption>}
            </figure>
            <AnimatePresence>
                {showLightbox && (
                    <Lightbox
                        attachments={[
                            {
                                url: src,
                                type: "image",
                                width: 1920,
                                height: 1080,
                                alt: alt,
                            },
                        ]}
                        startingIndex={0}
                        close={() => setShowLightbox(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useScrollBoost } from "react-scrollbooster";
import { AnimatePresence } from "framer-motion";
import Lightbox from "./Lightbox";
import isMobile from "./isMobile";
import useResizeObserver from "use-resize-observer";
import s from "./mdx-slider.module.css";

type SliderProps = {
    images: Array<{
        src: string;
        alt: string;
        width?: number;
        height?: number;
    }>;
};

const SliderImage = ({
    image,
    height,
    onClick,
}: {
    image: any;
    height: number;
    onClick: () => void;
}) => {
    const maxWidth = 21 / 9; // ultrawide monitor
    const minWidth = 19 / 5 / 9; // iPhone

    const returnThumbnailAspectRatio = (ratio: number) => {
        if (ratio < minWidth) return minWidth;
        if (ratio > maxWidth) return maxWidth;
        return ratio;
    };

    return (
        <div
            style={{
                height: height,
                aspectRatio: returnThumbnailAspectRatio(16 / 9),
            }}
            className={s.imageWrapper}
            onClick={onClick}
        >
            <Image src={image.src} alt={image.alt} fill style={{ objectFit: "cover" }} />
        </div>
    );
};

export default function Slider({ images }: SliderProps) {
    const imageIds = useRef(images.map(() => crypto.randomUUID()));
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const sliderHeight = 320;
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [viewport, scrollbooster] = useScrollBoost({
        direction: "horizontal",
        friction: 0.05,
        scrollMode: "native",
        textSelection: false,
        onUpdate: (data) => {
            if (containerRef.current) {
                containerRef.current.scrollLeft = data.position.x;
            }
        },
        shouldScroll: () => !isMobile(),
    });

    const setRefs = useCallback<React.RefCallback<HTMLDivElement>>(
        (node) => {
            containerRef.current = node;
            viewport(node);
            onResize();
        },
        [viewport]
    );

    const updateScrollbooster = () => {
        if (!scrollbooster || !containerRef.current) return;
        scrollbooster.updateMetrics();
    };

    const onResize = () => {
        updateScrollbooster();
    };

    useResizeObserver({ ref: containerRef as any, onResize });
    useResizeObserver({ ref: innerRef as any, onResize });

    return (
        <>
            <div className={s.slider} style={{ paddingTop: sliderHeight }}>
                <div ref={setRefs} className={s.scrollableArea}>
                    <div ref={innerRef} className={s.images}>
                        {images.map((image, index) => (
                            <SliderImage
                                key={imageIds.current[index]}
                                image={image}
                                height={sliderHeight}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {selectedImage !== null && (
                    <Lightbox
                        attachments={images.map((img, index) => ({
                            id: imageIds.current[index],
                            url: img.src,
                            type: "image",
                            width: img.width || 1920,
                            height: img.height || 1080,
                            alt: img.alt,
                        }))}
                        startingIndex={selectedImage}
                        close={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
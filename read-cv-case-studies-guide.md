# Supporting Case Studies in Your read.cv App

This is a guide to help you extend the functionality of your exported read.cv app so that it supports case studies.

If you copy and paste the code from this guide, you should have working case study pages for your projects.

<img src="https://raw.githubusercontent.com/mark-tomlinson-dev/pywang-cv/refs/heads/main/pywang-cv.gif" alt="read.cv case studies demo" width="500" />

Check out [Pei Yi's CV](https://pywang-cv.vercel.app) for an example.

> [!NOTE]
> The guide represents one way to solve this problem and does not claim to be the only or the best way (though, of course, it's made with care). Need help? Issues? Let me know [@marktomlinson.bsky.social](https://bsky.app/profile/marktomlinson.bsky.social)

## Table of Contents

1. [Introduction & Setup](#1-introduction--setup)
    - [Dependencies](#dependencies)
    - [Update Project Links](#update-project-links)
2. [File Structure Changes](#2-file-structure-changes)
    - [Convert to MDX](#convert-to-mdx)
3. [Core Components](#3-core-components)
    - [Case Study Page](#case-study-page)
    - [Case Study Component](#case-study-component)
    - [Case Study Header](#case-study-header)
4. [MDX Components](#4-mdx-components)
    - [Index](#index)
    - [Link](#link)
    - [Image](#image)
    - [Video](#video)
    - [Slider](#slider)
5. [Styling](#5-styling)
    - [Component Styles](#component-styles)
    - [Global Styles](#global-styles)
6. [Content Migration](#6-content-migration)
    - [Video Embeds](#video-embeds)
    - [Image Galleries](#image-galleries)
7. [Troubleshooting](#7-troubleshooting)
8. [Notes](#8-notes)

## 1. Introduction & Setup

### Dependencies

First, let's add the required dependencies to your project. These help us parse the markdown (`.md` files) and render the case studies nicely.

In your `package.json` file, add the following inside `dependencies`:

```json
"dependencies": {
    // ... other dependencies
    "next-mdx-remote": "^5.0.0",
    "rehype-unwrap-images": "^1.0.0",
    "remark": "^15.0.1",
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.0",
    "remark-parse-frontmatter": "^1.0.3"
}
```

Don't forget to run `npm install` (or `yarn install`, `pnpm install` etc) after adding these, if you want to spin the project up locally. If you'll just be deploying these changes to a platform like Vercel or Netlify without developing locally, no need to run that command.

### Update Project Links

In order for links to work from your home page to your case studies, you'll need to update the project urls in `profileData.json`. If I'm hosting my CV at `https://marktomlinson.dev`, and my case study file is named `case-study-how-to.md`, I'd update the url to `case-study-how-to`.

```json
{
    "allCollections": [
        {
            "name": "Projects",
            "items": [
                {
                    "url": "case-study-how-to"
                    // ... other fields
                }
            ]
        }
    ]
}
```

> [!IMPORTANT]
> It's only necessary to change the url in the `allCollections` array.

## 2. File Extension Changes

### Convert to MDX

Your case studies need to be converted from `.md` to `.mdx` files. Just rename the file extension like so:

`/public/content/writing/your-case-study.md` -> `/public/content/writing/your-case-study.mdx`

More on the need for this later.

## 3. Core Components

### Case Study Page Component

Replace the current `app/[slug]/page.tsx` code with the following:

```tsx
import { promises as fs } from "fs";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkParseFrontmatter from "remark-parse-frontmatter";
import CaseStudy from "./CaseStudy";

export async function generateStaticParams() {
    const cvFile = await fs.readFile(process.cwd() + "/public/content/profileData.json", "utf8");
    const cv = JSON.parse(cvFile);

    const slugs = cv.allCollections
        .flatMap((collection: any) => collection.items)
        .map((item: any) => item.url)
        .filter(Boolean)
        .filter(
            (url: string) =>
                !url.startsWith("http") && !url.startsWith("mailto:") && !url.startsWith("tel:")
        );

    return slugs.map((slug: string) => ({
        slug,
    }));
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
    const cvFile = await fs.readFile(process.cwd() + "/public/content/profileData.json", "utf8");
    const cv = JSON.parse(cvFile);

    const slug = (await params).slug;
    const file = await fs.readFile(process.cwd() + `/public/content/writing/${slug}.mdx`, "utf8");
    const result = await remark().use(remarkFrontmatter).use(remarkParseFrontmatter).process(file);

    const frontmatter = result.data.frontmatter as {
        title: string;
        description: string;
    };

    return <CaseStudy cv={cv} source={file} frontmatter={frontmatter} />;
}
```

> [!IMPORTANT]
> Double check you have the correct file path for your case studies.
> The original file from my export was missing the `/writing/` path segment, so it's probably missing from yours too.
> It should be `/public/content/writing/${slug}.mdx`

### Case Study Component

Replace the current `app/[slug]/CaseStudy.tsx` code with the following:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { mdxComponents } from "@/app/mdx-components";
import CaseStudyHeader from "./case-study-header";
import s from "./case-study.module.css";

type CaseStudyProps = {
    cv: any;
    source: string;
    frontmatter: {
        title: string;
        description: string;
    };
};

export default function CaseStudy({ cv, source, frontmatter }: CaseStudyProps) {
    return (
        <article className={s.caseStudy}>
            <CaseStudyHeader cv={cv} frontmatter={frontmatter} />
            <div className={s.markdown}>
                <MDXRemote
                    source={source}
                    components={mdxComponents}
                    options={{
                        mdxOptions: {
                            remarkPlugins: [remarkFrontmatter, remarkGfm],
                            rehypePlugins: [rehypeUnwrapImages],
                        },
                        parseFrontmatter: true,
                    }}
                />
            </div>
        </article>
    );
}
```

### Case Study Header Component

Create `app/[slug]/case-study-header.tsx` and paste in the following:

```tsx
import Image from "next/image";
import Link from "next/link";
import s from "./case-study.module.css";

type CaseStudyHeaderProps = {
    cv: any;
    frontmatter: {
        title: string;
        description: string;
    };
};

export default function CaseStudyHeader({ cv, frontmatter }: CaseStudyHeaderProps) {
    const author = frontmatter.description?.replace(/^By /, "");
    const title = frontmatter.title;

    return (
        <header className={s.header}>
            <Link href="/" className={s.profilePhotoLink}>
                <div className={s.profilePhoto}>
                    <Image
                        src={cv.general.profilePhoto}
                        alt="profile photo of the author"
                        width={48}
                        height={48}
                        style={{ objectFit: "cover" }}
                    />
                </div>
            </Link>
            <div className={s.meta}>
                {author && <Link href="/">{author}</Link>}
                {title && <h1>{title}</h1>}
            </div>
        </header>
    );
}
```

## 4. MDX Components

MDX allows us to use React components within our markdown files. Without it, functionality like the lightbox, video embeds, and image slider would be lost (or at least they would be a lot more difficult to implement).

### Index

Create `app/mdx-components.tsx` and paste in the following:

```tsx
import Slider from "./mdx-slider";
import CustomImage from "./mdx-image";
import CustomLink from "./mdx-link";
import Video from "./mdx-video";

export const mdxComponents = {
    Slider,
    Video,
    img: CustomImage,
    a: CustomLink,
};
```

### Link

Create `app/mdx-link.tsx` and paste in the following:

```tsx
export default function CustomLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a href={href} target="_blank">
            {children}
        </a>
    );
}
```

### Image

Create `app/mdx-image.tsx` and paste in the following:

```tsx
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
```

### Video

Create `app/mdx-video.tsx` and paste in the following:

```tsx
import s from "./mdx-image.module.css";

export default function Video({ src }: { src: string }) {
    return (
        <figure className={s.figure}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                <iframe
                    src={src}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", width: "100%", height: "100%", border: 0 }}
                />
            </div>
        </figure>
    );
}
```

### Slider

Create `app/mdx-slider.tsx`.

Rather than re-invent the wheel, we leverage the `Attachments` and `Lightbox` components to create the image slider. Thanks, read.cv team!

Paste in the following:

```tsx
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
```

> [!NOTE]
> The real read.cv case study images behave slightly differently. When clicked, instead of opening a lightbox, they expand the layout. I opted for this simpler approach because...how did they even do that??

## 5. Styling

### Component Styles

Create `app/[slug]/case-study.module.css` and paste in the following:

```css
.caseStudy {
    --flow-space: 1.5rem;
    --padding-inline: 1.5rem;
    --content-width: calc(540px + var(--padding-inline) * 2);
    padding: clamp(1.5rem, calc((100vw - var(--content-width)) / 2), 4.5rem) 0;
    max-width: var(--content-width);
    margin-inline: auto;
    container-type: inline-size;
}

.caseStudy > * + * {
    margin-block-start: var(--flow-space);
}

.header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-inline: var(--padding-inline);
}

.profilePhoto {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
    background-color: var(--wash2);
    overflow: hidden;
}

.meta h1 {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.2;
    color: var(--grey1);
    word-break: break-word;
}

.meta a {
    color: var(--grey3);
    cursor: pointer;
}

.meta a:hover {
    text-decoration: underline;
    text-underline-offset: 0.1lh;
}

.markdown {
    --flow-space: 1.5rem;
    word-break: break-word;
    padding-inline: var(--padding-inline);
}

.markdown > * + * {
    margin-block-start: var(--flow-space);
}

.markdown :is(p, ul, ol) {
    --flow-space: 1rem;
}

.markdown :is(hr) {
    --flow-space: 3rem;
    margin-block-end: var(--flow-space);
    border: 0;
    height: 1px;
    background-color: var(--wash1);
}

.markdown :is(h2, h3, h4) {
    --flow-space: 2rem;
}

.markdown :is(h2, h3, h4) {
    font-size: 1.25rem;
    font-weight: 400;
}

.markdown :is(h3, h4) {
    font-size: 1rem;
    font-weight: 400;
}

.markdown :is(ul, ol) {
    padding-inline-start: 2em;
    color: var(--grey1);
}

.markdown :is(code) {
    font-family: var(--font-mono);
    font-feature-settings: none;
    font-variant-ligatures: none;
    margin: 0 2px;
    padding: 0 2px;
    box-shadow: 0 0 0 2px var(--wash2);
    border-radius: 2px;
    font-size: var(--font-size);
    color: var(--grey1);
    background-color: var(--wash2);
}

.markdown :is(blockquote) {
    margin-block-start: 1em;
    padding-inline-start: 1em;
    border-left: 2px solid var(--grey1);
}

.markdown :is(strong) {
    font-weight: 500;
}

.markdown :is(a) {
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 0.1lh;
}
```

Create `app/mdx-image.module.css` and paste in the following:

```css
.figure {
    margin-block-end: var(--flow-space);
}

.figure > figcaption {
    --flow-space: 0.5rem;
    margin-block-start: var(--flow-space);
    margin-block-end: var(--flow-space);
    font-size: 12px;
    color: var(--grey2);
}

@media (max-width: 500px) {
    .figure {
        --offset: -1.5rem;
        --flow-space: 2rem;
        width: 100cqi;
        margin-inline-start: var(--offset);
    }

    .figure > figcaption {
        padding-inline: 0.75rem;
    }
}
```

Create `app/mdx-slider.module.css` and paste in the following:

```css
.slider {
    position: relative;
    z-index: 1;
    margin-block-start: var(--flow-space, 1.5rem);
    margin-block-end: var(--flow-space, 1.5rem);
    left: 50%;
    transform: translateX(-50%);
    user-select: none;
    -webkit-user-select: none;
}

.scrollableArea {
    position: absolute;
    inset: 0;
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-width: none;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
}

.scrollableArea::-webkit-scrollbar {
    display: none;
}

.images {
    display: flex;
    column-gap: 8px;
    position: relative;
    width: max-content;
    padding-inline: max(
        var(--padding-inline),
        calc((100vw - (var(--content-width) - var(--padding-inline) * 2)) / 2)
    );
}

.imageWrapper {
    background-color: var(--wash2);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
}

.imageWrapper img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
}

.imageWrapper::after {
    position: absolute;
    inset: 0;
    content: "";
    border: 1px solid var(--transparentBorder);
    border-radius: inherit;
    z-index: 10;
    pointer-events: none;
}

.imageWrapper:active {
    cursor: -webkit-grabbing;
}

@media only screen and (max-width: 480px) {
    .images {
        padding-inline: 0;
    }
}
```

### Global Styles

Add to the end of `:root` selector in `globals.css`:

```css
:root {
    /* Other styles */
    --font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}
```

Add to the bottom of `globals.css`:

```css
img,
picture {
    max-width: 100%;
    display: block;
}
```

This makes images a lot easier to work with.

## 6. Content Migration

If your original case studies included video embeds or image sliders (multiple images in a set), you'll need to do a bit of manual intervention and for two reasons:

1. Video embed data does not appear to be exporting from read.cv properly (at least not in my tests). In other words, if you had a video embeded in your case study, there will be no record of it in your exported `.md` file for that case study.
2. If you had multiple images in a set in a case study, you'll see something like this in your `.md` file:

```md
![This is alt text](/content/writing/image-1.jpg)
![This is alt text](/content/writing/image-2.jpg)
```

Without using our new `Slider` component, these images will be rendered as separate images.

### Video Embeds

With your new `Video` component in hand, you can add a video like this to your case study .mdx file:

```mdx
<Video src="https://www.youtube.com/embed/dQw4w9WgXcQ" />
```

> [!IMPORTANT]
> Note the `/embed/` in the URL. YouTube embed URLs are different from "standard" YouTube URLs.

> [!NOTE]
> I haven't tested other video providers, only YouTube. If you encounter an issue, please let me know.

### Image Sliders

With your new `Slider` component in hand, you can add a slider like this to your case study .mdx file:

```mdx
<Slider
    images={[
        {
            src: "/content/writing/your-case-study-image-1.jpg",
            alt: "Description 1",
        },
        {
            src: "/content/writing/your-case-study-image-2.jpg",
            alt: "Description 2",
        },
        {
            src: "/content/writing/your-case-study-image-3.jpg",
            alt: "Description 3",
        },
    ]}
/>
```

## 7. Troubleshooting

-   The most likely cause of an issue is a case mismatch in the imports. E.g. `import CaseStudyHeader from "./case-study-header";` depends on you having a file named `case-study-header.tsx`. If your file is named CaseStudyHeader.tsx, you'll need to change the import to `import CaseStudyHeader from "./CaseStudyHeader";`. It's personal preference which you use.
-   The second most likely cause of an issue is a missing comma in your `package.json`. The full dependencies object should look like this:

```json
 "dependencies": {
    "framer-motion": "^11.14.4",
    "next": "15.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.1",
    "react-scrollbooster": "^0.1.2",
    "use-resize-observer": "^9.1.0",
    "next-mdx-remote": "^5.0.0",
    "rehype-unwrap-images": "^1.0.0",
    "remark": "^15.0.1",
    "remark-frontmatter": "^5.0.0",
    "remark-gfm": "^4.0.0",
    "remark-parse-frontmatter": "^1.0.3"
  },
```

## 8. Notes

-   Images will be rendered with captions if alt text is provided.
-   We're using `next-mdx-remote` instead of `@next/mdx` because it lets us keep all our content files in the `public` directory. This means no need to move files around from their exported location. If you're happy moving files around, you can check out how to use the `@next/mdx` package [here](https://nextjs.org/docs/pages/building-your-application/configuring/mdx).
-   It's highly likely I've missed something either in the code or the documentation. If you find a bug, please don't hesitate to reach out [@marktomlinson.bsky.social](https://bsky.app/profile/marktomlinson.bsky.social)

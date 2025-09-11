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
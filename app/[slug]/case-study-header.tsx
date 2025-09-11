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
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
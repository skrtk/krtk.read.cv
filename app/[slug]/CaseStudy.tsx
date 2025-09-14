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
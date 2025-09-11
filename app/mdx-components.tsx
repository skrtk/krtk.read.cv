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
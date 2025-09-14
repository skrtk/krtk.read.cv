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
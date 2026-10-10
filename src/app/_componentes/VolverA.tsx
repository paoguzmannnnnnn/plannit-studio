import Link from "next/link";

export function VolverA({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="text-sm text-gris transition hover:text-tinta">
      ‹ {children}
    </Link>
  );
}

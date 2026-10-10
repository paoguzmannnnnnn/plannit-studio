import { Logo } from "@/shared/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col px-5 py-10">
      <Logo className="text-3xl" />
      <div className="mt-12 flex flex-col gap-6">{children}</div>
    </main>
  );
}

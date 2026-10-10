import { LoginForm } from "@/features/auth/ui/LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <>
      <h1 className="font-display text-3xl font-black">¡Hola de nuevo!</h1>
      <LoginForm next={next} />
    </>
  );
}

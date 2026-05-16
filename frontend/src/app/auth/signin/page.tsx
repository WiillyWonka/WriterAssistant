"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  const handleSignIn = () => {
    signIn("keycloak", { callbackUrl });
  };

  const handleSignUp = () => {
    signIn("keycloak-register", { callbackUrl });
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Writer Assistant
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Войдите или создайте новый аккаунт, чтобы продолжить.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            Не удалось выполнить вход: {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSignIn}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            Войти
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-[var(--muted)]">
          Загрузка…
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

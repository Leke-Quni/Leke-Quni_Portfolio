import type { Metadata } from "next";
import { signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Admin sign in</h1>
      <form
        className="mt-6"
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/admin" });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          Sign in with GitHub
        </button>
      </form>
    </div>
  );
}

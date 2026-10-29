import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: { signIn: "/login" },
  callbacks: {
    signIn({ profile }) {
      return String(profile?.id) === process.env.ADMIN_GITHUB_ID;
    },
    authorized({ auth, request }) {
      if (!request.nextUrl.pathname.startsWith("/admin")) return true;
      return !!auth?.user;
    },
  },
});

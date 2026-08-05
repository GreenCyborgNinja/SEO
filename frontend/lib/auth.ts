import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import { db } from './db/client'
import { accounts, sessions, users, verificationTokens } from './db/schema'
import { verifyPassword } from './auth/passwords'
import { credentialsSchema } from './validation/auth'

/**
 * Single entry point for authentication. Everything (routes, pages, middleware)
 * imports from here, so swapping the implementation stays a one-file change.
 *
 * JWT sessions are mandatory: Auth.js does not support database sessions
 * together with the credentials provider.
 */

const AUTH_SECRET =
  process.env.AUTH_SECRET?.trim() ||
  (() => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[auth] AUTH_SECRET is not set — generate one with `npx auth secret`.')
    }
    // Keeps the "runs with zero configuration" promise for local development.
    return 'daily-trends-local-development-secret-do-not-use-in-production'
  })()

/** The account matching ADMIN_EMAIL gets the admin role — no seeding ritual needed. */
export function isAdminEmail(email?: string | null): boolean {
  const configured = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return Boolean(configured && email && email.trim().toLowerCase() === configured)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  secret: AUTH_SECRET,
  // Required for self-hosting: Auth.js refuses to trust the Host header in
  // production unless told to (managed platforms set this for you). Without it
  // every /api/auth/* call fails with UntrustedHost, including on localhost.
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const email = parsed.data.email.toLowerCase()
        const user = db.select().from(users).where(eq(users.email, email)).limit(1).get()
        if (!user?.password_hash) return null

        const ok = await verifyPassword(parsed.data.password, user.password_hash)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: isAdminEmail(user.email) ? 'admin' : user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'user'
      }
      // Promote/demote on every refresh so changing ADMIN_EMAIL takes effect
      // without forcing a re-login.
      if (isAdminEmail(token.email)) token.role = 'admin'
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? ''
        session.user.role = (token.role as string) ?? 'user'
      }
      return session
    },
  },
})

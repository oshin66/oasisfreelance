export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setSessionCookie, hashPassword, signRefreshToken, setRefreshTokenCookie } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=NoCode', req.url))
  }

  const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin
  const redirectUri = `${baseUrl}/api/auth/google/callback`
  
  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
    })
    
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Google Token Error:', tokenData)
      throw new Error(tokenData.error_description || 'Failed to get token')
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const userData = await userRes.json()
    if (!userRes.ok) {
      console.error('Google UserInfo Error:', userData)
      throw new Error('Failed to get user info')
    }

    const email = userData.email.toLowerCase()
    
    // 3. Find or Create User in Oasis Database
    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      // By default, Google sign-ups are buyers. They can upgrade later if needed.
      const randomPassword = randomBytes(32).toString('hex')
      const hashedPassword = await hashPassword(randomPassword)

      user = await prisma.user.create({
        data: {
          name: userData.name || email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'BUYER',
          isSeller: false,
          avatar: userData.picture || null,
        }
      })
    }

    // 4. Create Session Token (access + refresh)
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
      sessionVersion: user.sessionVersion,
    })
    const refreshToken = await signRefreshToken(user.id, user.sessionVersion)

    // 5. Redirect based on user role
    const dest = 
      user.role === 'ADMIN' ? '/admin' :
      user.role === 'SELLER' ? '/dashboard/seller' : 
      '/dashboard/buyer'
      
    // Set both session and refresh cookies directly on redirect response.
    const response = NextResponse.redirect(new URL(dest, req.url))
    const opts = setSessionCookie(token)
    response.cookies.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    })
    const refreshOpts = setRefreshTokenCookie(refreshToken)
    response.cookies.set(refreshOpts.name, refreshOpts.value, {
      httpOnly: refreshOpts.httpOnly,
      secure: refreshOpts.secure,
      sameSite: refreshOpts.sameSite,
      path: refreshOpts.path,
      maxAge: refreshOpts.maxAge,
    })

    return response

  } catch (error: unknown) {
    console.error('[Google OAuth Callback Error]', error)
    return NextResponse.redirect(new URL('/auth/login?error=GoogleAuthFailed', req.url))
  }
}

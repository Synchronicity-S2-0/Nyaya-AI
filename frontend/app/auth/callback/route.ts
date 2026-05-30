import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Supabase will append an 'error' param if the Google login failed
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const code = searchParams.get('code')
  
  if (error) {
    console.error('OAuth Error from Supabase:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${error}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Next.js throws an error if you try to set a cookie from a Server Component.
              // We catch it here so the route handler doesn't crash.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              // Same as above
            }
          },
        },
      }
    )
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Failed to exchange code:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=ExchangeFailed`)
    }
    
    // Success! The session is set and the user is in the database.
    return NextResponse.redirect(`${origin}/`)
  }

  // If there is no code and no error, someone just visited the route manually.
  return NextResponse.redirect(`${origin}/`)
}
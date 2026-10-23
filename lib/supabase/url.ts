// Docker networking: the browser reaches Supabase at NEXT_PUBLIC_SUPABASE_URL
// (and auth cookies are named after it), but that URL doesn't resolve from
// inside the app container. SUPABASE_SERVER_URL (internal Docker) does.
//
// Solution: always create clients with the public URL (for cookie name matching),
// but provide a custom fetch that rewrites requests to the internal URL.

const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serverUrl = process.env.SUPABASE_SERVER_URL

export const supabaseUrl = publicUrl

export const supabaseFetchOptions = serverUrl
  ? {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const url = input.toString().replace(publicUrl, serverUrl)
          return fetch(url, init)
        },
      },
    }
  : {}

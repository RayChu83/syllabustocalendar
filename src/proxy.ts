import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Hit via top-level browser navigation (redirects), not fetch(), and each
// already authorizes itself: /connect checks the session directly and
// redirects to "/" on failure, /callback is authorized via its own signed
// `state` param (it's the tail end of a cross-site redirect from Google, so
// the session cookie isn't guaranteed to be attached). A blanket JSON 401
// would break both flows, so they're excluded from the API auth gate below.
const PUBLIC_API_ROUTES = [
  "/api/google/calendar/connect",
  "/api/google/calendar/callback",
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api");

  try {
    // Create a response object that we can modify
    const response = NextResponse.next();

    // Create a Supabase client
    const supabase = await serverClient();

    // Refresh the session if needed
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // API routes: require a session as a defense-in-depth gate, ahead of
    // whatever auth check the route handler itself performs.
    if (isApiRoute) {
      const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) =>
        pathname.startsWith(route),
      );

      if (!isPublicApiRoute && !session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return response;
    }

    // Define protected routes
    const protectedRoutes = [
      "/dashboard",
      "/assignments",
      "/calendar",
      "/classes",
      "/semesters",
      "/profile/set-up",
    ];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route),
    );
    const isHomeRoute = pathname === "/";

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect logged-in users away from the login page and ensure profiles exist.
    if (session && (isProtectedRoute || isHomeRoute)) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (
        (!profile || profileError) &&
        !pathname.startsWith("/profile/set-up")
      ) {
        return NextResponse.redirect(new URL("/profile/set-up", request.url));
      }

      if (profile && pathname.startsWith("/profile/set-up")) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }

      if (profile && isHomeRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return response;
  } catch {
    // Handle any errors
    return NextResponse.next();
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};

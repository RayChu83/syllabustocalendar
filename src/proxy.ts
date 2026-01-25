import { serverClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const response = NextResponse.next();

    // Create a Supabase client
    const supabase = await serverClient();

    // Refresh the session if needed
    const {
      data: { session },
    } = await supabase.auth.getSession();

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
      request.nextUrl.pathname.startsWith(route)
    );

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect to dashboard if accessing auth pages while logged in
    const authRoutes = ["/sign-in", "/sign-up"];
    const isAuthRoute = authRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (session && (isProtectedRoute || isAuthRoute)) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (
        (!profile || profileError) &&
        !request.nextUrl.pathname.startsWith("/profile/set-up")
      ) {
        return NextResponse.redirect(new URL("/profile/set-up", request.url));
      }

      if (profile && request.nextUrl.pathname.startsWith("/profile/set-up")) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }

    return response;
  } catch (e) {
    // Handle any errors
    return NextResponse.next();
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revokeSession, SESSION_COOKIE } from "@/lib/admin-auth";
import { appOrigin, noStore, safeOrigin } from "@/lib/server-security";
export async function POST(request: Request) {
  try {
    if (!safeOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    await revokeSession((await cookies()).get(SESSION_COOKIE)?.value);
    const response = NextResponse.json({ ok: true }, { headers: noStore });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: appOrigin(request).startsWith("https:"), sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch { return NextResponse.json({ error: "Could not sign out. Please try again." }, { status: 503, headers: noStore }); }
}

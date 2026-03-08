import { NextResponse } from "next/server";
import { createToken, checkPassword, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }

  const token = await createToken();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}

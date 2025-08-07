import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const token = searchParams.get("token") as string;
  console.log("🔍 Incoming token:", token);

  // 1) Log out your env vars
  console.log(
    "⚙️ WORDPRESS_TOKEN_BASE_API =",
    process.env.WORDPRESS_TOKEN_BASE_API
  );
  console.log("🔐 CF_ACCESS_CLIENT_ID   =", process.env.CF_ACCESS_CLIENT_ID);
  console.log(
    "🔐 CF_ACCESS_CLIENT_SECRET   =",
    process.env.NEXT_PUBLIC_CF_ACCESS_CLIENT
  );

  // 2) Build URL & headers
  const base = (process.env.WORDPRESS_TOKEN_BASE_API || "").replace(/\/+$/, "");
  const url = `${base}/get-token/?token=${encodeURIComponent(token)}`;
  const headers = {
    Accept: "application/json",
    "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID as string,
    "CF-Access-Client-Secret": process.env
      .NEXT_PUBLIC_CF_ACCESS_CLIENT as string,
  };
  console.log("👉 Fetch URL:", url);
  console.log(
    "👉 Fetch headers:",
    headers["Accept"],
    headers["CF-Access-Client-Id"]
  );

  // 3) Fetch
  const response = await fetch(url, { headers });
  console.log(
    "📥 Response status:",
    response.status,
    response.headers.get("content-type")
  );
  const text = await response.text();
  console.log("📄 Raw body (first 500 chars):", text.slice(0, 500));

  // 4) Parse or error
  if (!response.ok) {
    return NextResponse.json({ message: text }, { status: response.status });
  }
  try {
    const data = JSON.parse(text);
    console.log("JSON Data", { data });
    return NextResponse.json(data);
  } catch (e) {
    console.error("❌ JSON parse error:", e);
    return NextResponse.json(
      { message: "Invalid JSON", details: text },
      { status: 500 }
    );
  }
}

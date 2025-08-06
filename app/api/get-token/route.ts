import { NextResponse, NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  // Build your WP URL
  const base = (process.env.WORDPRESS_TOKEN_BASE_API || "").replace(/\/+$/, "");
  const url = `${base}/get-token?token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "CF-Access-Client-ID": process.env.CF_ACCESS_CLIENT_ID as string,
        "CF-Access-Client-Secret": process.env
          .CF_ACCESS_CLIENT_SECRET as string,
      },
    });
    console.log("👉 Fetch URL:", process.env.WORDPRESS_TOKEN_BASE_API, {
      base,
    });
    console.log("👉 Status:", response.status, response.statusText);

    // Grab raw text first
    const text = await response.text();
    console.log("📥 Raw response (first 200 chars):", text.slice(0, 1000));

    // Inspect content‐type header
    console.log("📑 Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      // If it’s an error page, text will show it
      return NextResponse.json(
        { message: `WP error ${response.status}`, details: text },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
      console.log("Data", { data });
    } catch (e) {
      console.error("❌ JSON.parse failed:", e);
      return NextResponse.json(
        { message: "Invalid JSON from WP", details: text },
        { status: 500 }
      );
    }

    console.log("✅ Parsed JSON:", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("🚨 Unexpected fetch error:", err);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

/* import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token"); // Get the token from the query parameters

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.WORDPRESS_TOKEN_BASE_API}/get-token/?token=${token}`, // Send token as a query parameter
      {
        method: "GET",
        headers: {
          Accept: "application/json", // Optional: Specify that you expect a JSON response
        },
      }
    );

    console.log("base url: ", process.env.WORDPRESS_TOKEN_BASE_API);
    const base = (process.env.WORDPRESS_TOKEN_BASE_API || "").replace(
      /\/+$/,
      ""
    );
    const url = `${base}/wp-json/scan_id/v1/get-token?token=${encodeURIComponent(
      token
    )}`;

    console.log("🔗 Fetching token from:", base);
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        {
          message:
            error.message || "Something went wrong. Please try again later",
        },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    console.log("API Data", { data });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Could not fetch token:", err);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
 */

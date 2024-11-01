import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idImage, selfieImage } = await req.json();

  try {
    const response = await fetch(`${process.env.API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        document: idImage,
        portrait: selfieImage,
        clientId: "5c26de07-c357-47a8-aee1-90acaa0e2202",
      }),
    });
    if (!response.ok) {
      const error = await response.json();

      return NextResponse.json(
        {
          message: error.message || "Something went wrong. Pls try again later",
        },
        { status: response.status || 500 }
      );
    }
    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

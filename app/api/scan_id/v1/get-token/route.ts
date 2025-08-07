import mysql from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";

let pool: any;
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Missing token parameter" },
      { status: 400 }
    );
  }

  try {
    const db = await getPool();
    const [rows] = await db.execute(
      `SELECT * 
         FROM \`${process.env.DB_PREFIX}order_tokens\` 
        WHERE token = ? 
          AND expiration > UTC_TIMESTAMP()`,
      [token]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }
    console.log(rows);

    return NextResponse.json(rows[0], { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const ZAP_URL = process.env.ZAP_URL || "http://bouclier-zap:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const zapPath = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const query = searchParams ? `?${searchParams}` : "";
  const targetUrl = `${ZAP_URL}/${zapPath}${query}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Host": "localhost:8080",
        "Accept": "application/json, text/html, */*",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("text/html")) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "ZAP proxy error", details: String(error) },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const zapPath = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const query = searchParams ? `?${searchParams}` : "";
  const targetUrl = `${ZAP_URL}/${zapPath}${query}`;
  const body = await request.text();

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Host": "localhost:8080",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "ZAP proxy error", details: String(error) },
      { status: 502 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
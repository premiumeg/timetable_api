// app/api/comci-proxy/route.ts
import type { NextRequest } from "next/server";
import iconv from "iconv-lite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = "http://comci.net:4082/36179?17384l";

// EUC-KR 퍼센트 인코딩 최적화
function encodeEuckrURIComponent(str: string): string {
  const buf = iconv.encode(str, "euc-kr");
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    const isUnreserved =
      (b >= 0x30 && b <= 0x39) ||
      (b >= 0x41 && b <= 0x5a) ||
      (b >= 0x61 && b <= 0x7a) ||
      b === 0x2d || b === 0x5f || b === 0x2e || b === 0x7e;
    out += isUnreserved ? String.fromCharCode(b) : "%" + b.toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

function buildTargetUrl(query: string): string {
  return `${BASE}${encodeEuckrURIComponent(query)}`;
}

function corsHeaders(): Headers {
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", "*");
  h.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  return h;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim();

  if (!query) {
    const h = corsHeaders();
    h.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify({ error: "query 파라미터가 필요합니다." }), { status: 400, headers: h });
  }

  const targetUrl = buildTargetUrl(query);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json,text/plain,*/*",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    // 텍스트 가져오기
    const rawText = await res.text();

    // JSON 추출 최적화: 처음 { 부터 마지막 } 까지만
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}") + 1;
    if (start < 0 || end <= 0) throw new Error("JSON 파싱 실패");

    const json = JSON.parse(rawText.slice(start, end));

    const headers = corsHeaders();
    headers.set("Content-Type", "application/json; charset=utf-8");

    return new Response(JSON.stringify(json), { status: 200, headers });
  } catch (err) {
    const h = corsHeaders();
    h.set("Content-Type", "application/json; charset=utf-8");
    return new Response(JSON.stringify({ error: "upstream 요청 실패", detail: String(err), targetUrl }), {
      status: 502,
      headers: h,
    });
  }
}

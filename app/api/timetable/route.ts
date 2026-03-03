import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const schoolName = url.searchParams.get("schoolName");
  const grade = url.searchParams.get("grade");
  const classNum = url.searchParams.get("class");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!schoolName) {
    return NextResponse.json(
      { error: "schoolName 쿼리가 필요합니다" },
      { status: 400, headers: corsHeaders }
    );
  }

  let browser;

  try {
    // 🔥 Vercel 서버리스용 Chromium 실행
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1024, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    );

    // 🚀 리소스 차단 (속도 최적화)
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      if (["image", "stylesheet", "font"].includes(type)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto("http://comci.net:4082/st", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.type("#sc", schoolName);
    await page.click('input[type="button"][value="검색"]');
    await page.waitForSelector("#학교명단검색 a", { timeout: 10000 });

    // 학교 선택
    const success = await page.evaluate((targetSchool: string) => {
      const rows = Array.from(document.querySelectorAll("#학교명단검색 tr"));

      for (const row of rows) {
        const link = row.querySelector("a");
        const name = link?.textContent?.trim() || "";
        const onclick = link?.getAttribute("onclick") || "";

        if (name.includes(targetSchool)) {
          const match = onclick.match(/sc_disp\((\d+)\)/);
          if (match) {
            // @ts-ignore
            window.sc_disp(Number(match[1]));
            return true;
          }
        }
      }
      return false;
    }, schoolName);

    if (!success) {
      return new Response(
        JSON.stringify({ error: "학교를 찾을 수 없습니다." }),
        { status: 404, headers: corsHeaders }
      );
    }

    await new Promise((r) => setTimeout(r, 500));

    // 🔥 반 목록만 요청
    if (!grade && !classNum) {
      const classes = await page.evaluate(() => {
        const select = document.querySelector("select#ba");
        const options = Array.from(select?.querySelectorAll("option") || []);
        const classCounts: { [key: string]: number } = {};

        options.forEach((option) => {
          const value = option.getAttribute("value");
          if (value && value.includes("-")) {
            const [grade] = value.split("-");
            classCounts[grade] = (classCounts[grade] || 0) + 1;
          }
        });

        return classCounts;
      });

      return new Response(
        JSON.stringify({
          success: true,
          mode: "grade_class",
          classes,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (!grade || !classNum) {
      return new Response(
        JSON.stringify({ error: "grade와 class 쿼리가 필요합니다" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const baValue = `${grade}-${classNum}`;

    await page.select("select#ba", baValue);

    await page.evaluate(() => {
      // @ts-ignore
      if (typeof window.ba_change === "function") {
        // @ts-ignore
        window.ba_change();
      }
    });

    await page.waitForSelector("#hour table", { timeout: 10000 });

    const timetable = await page.evaluate(() => {
      const title =
        document
          .querySelector('#hour td[colspan="4"], #hour td[colspan="5"]')
          ?.textContent?.trim() || "시간표";

      const periods: any[] = [];
      const rows = Array.from(
        document.querySelectorAll("#hour table tr")
      ).slice(2);

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("td"));
        if (cells.length < 6) continue;

        const text = cells[0].textContent?.trim() || "";
        const match = text.match(/(\d+)\(([\d:]+)\)/);

        const period = match?.[1] || "";
        const time = match?.[2] || "";

        const days = cells.slice(1).map((cell) => {
          const html = cell.innerHTML.split("<br>");
          const subject = html[0]?.trim() || "";
          const teacher = html[1]?.trim() || "";

          return {
            subject,
            teacher,
            isChanged: cell.classList.contains("변경"),
          };
        });

        periods.push({ period, time, days });
      }

      return { title, periods };
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode: "timetable",
        timetable,
        cached: false,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "크롤링 중 오류 발생", details: String(e) }),
      { status: 500, headers: corsHeaders }
    );
  } finally {
    if (browser) await browser.close();
  }
}

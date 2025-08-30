import { NextRequest } from 'next/server';
import { getCacheKey, loadTimetableCache, saveTimetableCache, cleanupOldCache } from '../../../lib/timetableCache';
import { GET as fetchTimetable } from '../timetable/route';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const schoolName = url.searchParams.get('schoolName');
  const grade = url.searchParams.get('grade');
  const classNum = url.searchParams.get('class');

  if (!schoolName || !grade || !classNum) {
    return new Response(
      JSON.stringify({ error: 'schoolName, grade, class 쿼리 모두 필요함' }),
      { status: 400 }
    );
  }

  // 만료된 캐시 삭제
  cleanupOldCache();

  const cacheKey = getCacheKey(schoolName, grade, classNum);
  const cached = loadTimetableCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify({ success: true, timetable: cached, cached: true }), { status: 200 });
  }

  // 캐시 없으면 timetable API 호출
  const timetableRes = await fetchTimetable(req);
  const timetableJson = await timetableRes.json();
  if (timetableRes.status === 200 && timetableJson.timetable) {
    saveTimetableCache(cacheKey, timetableJson.timetable);
    return new Response(JSON.stringify({ success: true, timetable: timetableJson.timetable, cached: false }), { status: 200 });
  } else {
    return new Response(JSON.stringify(timetableJson), { status: timetableRes.status });
  }
}

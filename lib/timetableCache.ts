import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve(process.cwd(), 'lib', 'timetable_cache');

// 캐시 디렉토리 생성
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 주차 계산 (ISO week)
export function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const janFirst = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - janFirst.getTime()) / 86400000);
  const week = Math.ceil((days + janFirst.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

// 캐시 키 생성
export function getCacheKey(schoolName: string, grade: string, classNum: string, week?: string): string {
  const w = week || getCurrentWeek();
  return `${schoolName}_${grade}_${classNum}_${w}`;
}

// 캐시 저장: 제네릭 타입으로 타입 안정성 확보
export function saveTimetableCache<T>(key: string, data: T) {
  const filePath = path.join(CACHE_DIR, key + '.json');
  fs.writeFileSync(filePath, JSON.stringify({ data, week: key.split('_').pop(), created: Date.now() }));
}

// 캐시 로드: 제네릭 타입으로 타입 안정성 확보
export function loadTimetableCache<T>(key: string): T | null {
  const filePath = path.join(CACHE_DIR, key + '.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw).data as T;
  } catch {
    return null;
  }
}

// 만료된 캐시 삭제 (현재 주가 아니면 삭제)
export function cleanupOldCache() {
  const currentWeek = getCurrentWeek();
  const files = fs.readdirSync(CACHE_DIR);
  files.forEach((file) => {
    if (!file.endsWith('.json')) return;
    const week = file.split('_').pop()?.replace('.json', '');
    if (week !== currentWeek) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
  });
}

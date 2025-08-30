const fs = require('fs');
const Timetable = require('comcigan-parser');

// JSON 데이터 로드
const timetableData = JSON.parse(fs.readFileSync('timetable.json', 'utf8'));

// 주간 날짜 계산
const getWeekDates = (dateRange) => {
  const [startDate] = dateRange.split(' ~ '); // "25-07-21" 추출
  const [year, month, day] = startDate.split('-').map(Number);
  const baseDate = new Date(2000 + year, month - 1, day); // 2025-07-21
  const weekDates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    weekDates.push(formattedDate);
  }
  return weekDates;
};

// 시간표 데이터를 추출하는 함수
async function extractTimetable() {
  const timetable = new Timetable();
  await timetable.init({ cache: 1000 * 60 * 60 }); // 1시간 캐싱

  // JSON 데이터에서 필요한 정보 추출
  const subjects = timetableData['자료492'].slice(1); // 과목 목록
  const teachers = timetableData['자료446']; // 교사 목록
  const classTimes = timetableData['일과시간']; // 교시별 시간
  const timetableRaw = timetableData['자료481']; // 시간표 데이터
  const grades = timetableData['학급수'].slice(1); // 학급 수
  const dateRange = timetableData['일자자료']?.[0]?.[1] || 'Unknown'; // "25-07-21 ~ 25-07-26"
  const weekDates = dateRange !== 'Unknown' ? getWeekDates(dateRange) : Array(5).fill('Unknown');

  // 시간표 데이터를 학년별로 처리
  const result = {};

  timetableRaw.forEach((gradeData, gradeIndex) => {
    if (gradeIndex === 0) return; // 첫 번째 요소는 학년 수 (3)
    const grade = gradeIndex; // 학년 (1, 2, 3)
    result[grade] = {};

    if (!Array.isArray(gradeData)) {
      console.error(`Error: gradeData for grade ${grade} is not an array:`, gradeData);
      return;
    }

    gradeData.forEach((classData, classIndex) => {
      const classNum = classIndex + 1; // 반 번호 (1~12)
      result[grade][classNum] = [];

      if (!Array.isArray(classData)) {
        console.error(`Error: classData for grade ${grade}, class ${classNum} is not an array:`, classData);
        return;
      }

      classData.slice(0, 5).forEach((dayData, dayIndex) => {
        const weekday = ['월', '화', '수', '목', '금'][dayIndex];
        const date = weekDates[dayIndex]; // 해당 요일의 날짜
        if (!Array.isArray(dayData) || dayData.length < 2) {
          console.warn(`Warning: Invalid dayData for grade ${grade}, class ${classNum}, day ${weekday} (${date}):`, dayData);
          return;
        }

        const periods = Array.isArray(dayData[1]) ? dayData[1] : dayData;
        const timetableEntry = {
          weekday: weekday,
          date: date,
          periods: []
        };

        if (Array.isArray(periods) && periods.length > 1) {
          for (let periodIndex = 1; periodIndex < periods.length; periodIndex++) {
            const subjectCode = periods[periodIndex];
            if (subjectCode === 0) continue;

            const subjectName = subjectCode >= 17000 ? subjects[subjects.length - 1] : subjects[Math.floor(subjectCode / 1000) - 1] || '알 수 없음';
            const teacherIndex = subjectCode % 1000;
            const teacherName = teachers[teacherIndex] || '알 수 없음';

            timetableEntry.periods.push({
              classTime: periodIndex,
              time: classTimes[periodIndex - 1] || `교시 ${periodIndex}`,
              subject: subjectName,
              teacher: teacherName
            });
          }
        } else {
          console.warn(`Warning: Empty or invalid periods for grade ${grade}, class ${classNum}, day ${weekday} (${date}):`, periods);
        }

        result[grade][classNum].push(timetableEntry);
      });
    });
  });

  // 시간표 출력
  console.log(`시간표 기간: ${dateRange}`);
  Object.keys(result).forEach(grade => {
    console.log(`=== ${grade}학년 시간표 ===`);
    Object.keys(result[grade]).forEach(classNum => {
      console.log(`\n${classNum}반:`);
      result[grade][classNum].forEach(day => {
        console.log(`  ${day.weekday}요일 (${day.date}):`);
        day.periods.forEach(period => {
          console.log(`    ${period.time}: ${period.subject} (${period.teacher})`);
        });
      });
    });
  });

  return result;
}

// 시간표 추출 실행
extractTimetable().then(result => {
  // 결과는 이미 콘솔에 출력됨
}).catch(err => {
  console.error('시간표 추출 중 오류:', err);
});
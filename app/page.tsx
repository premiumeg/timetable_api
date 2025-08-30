"use client";

import React, { useState } from "react";
import { Search, Calendar, MapPin, Clock, User, ArrowLeft } from "lucide-react";

// 타입 정의
interface School {
  id: number;
  region: string;
  schoolName: string;
  schoolId: number;
}

interface TimetableData {
  title: string;
  periods: {
    period: string;
    time: string;
    days: {
      subject: string;
      teacher: string;
      isChanged: boolean;
    }[];
  }[];
}

// SearchPage 컴포넌트
function SearchPage({
  searchQuery,
  setSearchQuery,
  searchSchools,
  isLoading,
  error,
  schools,
  handleSchoolSelect,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchSchools: () => void;
  isLoading: boolean;
  error: string | null;
  schools: School[];
  handleSchoolSelect: (school: School) => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white/70 via-neutral-100/60 to-neutral-200/60">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-neutral-800 bg-clip-text text-transparent">
              시간표 조회
            </h1>
            <p className="text-black max-w-md mx-auto">
              학교를 검색하여 실시간 시간표를 확인하세요
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/90 border border-black/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="학교명을 입력하세요 (예: 신송)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchSchools()}
                  className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border border-black/20 rounded-2xl text-black placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-black/50"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/60" />
              </div>
              <button
                onClick={searchSchools}
                disabled={isLoading}
                className="px-8 py-4 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium rounded-2xl transition-all duration-200 hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    로딩 중...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    검색
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-neutral-100/80 border border-black/20 rounded-2xl p-6 shadow-lg">
              <p className="text-black text-center font-medium">{error}</p>
            </div>
          )}

          {schools.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-8 py-6 border-b border-black/10">
                <h2 className="text-xl font-semibold text-black">
                  검색 결과 ({schools.length}개)
                </h2>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {schools.map((school) => (
                  <div
                    key={`${school.id}-${school.schoolId}`}
                    onClick={() => handleSchoolSelect(school)}
                    className="group flex items-center justify-between p-5 bg-white/90 backdrop-blur-sm border border-black/20 rounded-2xl hover:bg-white hover:border-black/40 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors duration-200">
                        <MapPin className="h-5 w-5 text-black/80" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">{school.schoolName}</h3>
                        <p className="text-sm text-black/70">{school.region}</p>
                      </div>
                    </div>
                    <div className="text-sm text-black/40 font-mono">
                      {school.schoolId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// TimetablePage 컴포넌트
function TimetablePage({
  selectedSchool,
  timetableData,
  isLoading,
  error,
  grade,
  setGrade,
  classNum,
  setClassNum,
  goBackToSearch,
  loadTimetable,
}: {
  selectedSchool: School;
  timetableData: TimetableData | null;
  isLoading: boolean;
  error: string | null;
  grade: number;
  setGrade: (n: number) => void;
  classNum: number;
  setClassNum: (n: number) => void;
  goBackToSearch: () => void;
  loadTimetable: (schoolName: string, gradeVal: number, classVal: number) => void;
}) {
  const days = ["월", "화", "수", "목", "금"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/70 via-neutral-100/60 to-neutral-200/60">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goBackToSearch}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-black/20 rounded-xl text-black hover:bg-white transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              학교 검색
            </button>
            <h1 className="text-2xl font-bold text-black">시간표</h1>
            <div></div>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-neutral-100/80 border border-black/20 rounded-2xl p-6 shadow-lg">
              <p className="text-black text-center font-medium">{error}</p>
            </div>
          )}

          {timetableData && (
            <div className="glass-card overflow-hidden">
              <div className="px-8 py-6 border-b border-black/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/10 rounded-xl">
                      <Calendar className="h-6 w-6 text-black/80" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-black">{timetableData.title}</h3>
                      <p className="text-sm text-black/70 mt-1">
                        {selectedSchool.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1">
                      <span className="text-sm">학년</span>
                      <select
                        className="border rounded px-2 py-1"
                        value={grade}
                        onChange={(e) => {
                          const newGrade = Number(e.target.value);
                          setGrade(newGrade);
                          loadTimetable(selectedSchool.schoolName, newGrade, classNum);
                        }}
                      >
                        {[1, 2, 3].map((g) => (
                          <option key={g} value={g}>
                            {g}학년
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1">
                      <span className="text-sm">반</span>
                      <select
                        className="border rounded px-2 py-1"
                        value={classNum}
                        onChange={(e) => {
                          const newClass = Number(e.target.value);
                          setClassNum(newClass);
                          loadTimetable(selectedSchool.schoolName, grade, newClass);
                        }}
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                          <option key={c} value={c}>
                            {c}반
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-x-auto">
                <div className="grid grid-cols-6 gap-2">
                  <div className="bg-black/5 rounded-xl p-3 text-center font-medium text-black border">
                    교시
                  </div>
                  {days.map((day) => (
                    <div
                      key={day}
                      className="bg-black/5 rounded-xl p-3 text-center font-medium text-black border"
                    >
                      {day}
                    </div>
                  ))}
                  {timetableData.periods.map((row, i) => (
                    <React.Fragment key={`row-${i}`}>
                      <div className="bg-white rounded-xl p-4 text-center border flex flex-col justify-center">
                        <div className="font-semibold text-black">
                          {row.period}
                        </div>
                        <div className="text-xs text-black/60 mt-1 flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-black/60" />
                          {row.time}
                        </div>
                      </div>
                      {row.days.map((subject, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`rounded-xl p-4 border ${
                            subject.isChanged ? "bg-black/10" : "bg-white"
                          }`}
                        >
                          <div className="text-center space-y-2">
                            <div className="font-medium text-sm text-black">
                              {subject.subject || "-"}
                            </div>
                            {subject.teacher && (
                              <div className="flex items-center justify-center gap-1 text-xs text-black/60">
                                <User className="h-3 w-3 text-black/60" />
                                {subject.teacher}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isLoading && !timetableData && (
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
              <div className="animate-spin h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">시간표를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Main Page 컴포넌트
function MainPage() {
  const [currentPage, setCurrentPage] = useState<"search" | "timetable">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState(1);
  const [classNum, setClassNum] = useState(1);
  
  
  const searchSchools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      

      if (data["학교검색"] && Array.isArray(data["학교검색"])) {
        const schoolsArray = data["학교검색"] as [number, string, string, number][];
        const processedSchools: School[] = schoolsArray
          .map((schoolData) => ({
            id: schoolData[0],
            region: schoolData[1] || '',
            schoolName: schoolData[2] || '',
            schoolId: schoolData[3]
          }))
          .filter((school) => 
            school.region && 
            school.region !== "지역" && 
            school.schoolName && 
            school.schoolId
          );
        
        setSchools(processedSchools);
        
        if (processedSchools.length === 0) {
          setError("검색 결과가 없습니다.");
        }
      } else {
        setError("검색 결과가 없습니다.");
        setSchools([]);
      }
    } catch {
      setError("검색 중 오류가 발생했습니다.");
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimetable = async (schoolName: string, gradeVal = grade, classVal = classNum) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/timetable?schoolName=${encodeURIComponent(schoolName)}&grade=${gradeVal}&class=${classVal}`);
      const data = await res.json();
      if (data.success && data.timetable) {
        setTimetableData(data.timetable);
      } else {
        setError("시간표 데이터를 불러올 수 없습니다.");
      }
    } catch {
      setError("시간표 로딩 중 오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setGrade(1);
    setClassNum(1);
    setCurrentPage("timetable");
    loadTimetable(school.schoolName, 1, 1);
  };

  const goBackToSearch = () => {
    setCurrentPage("search");
    setSelectedSchool(null);
    setTimetableData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative">
      {currentPage === "search" ? (
        <SearchPage
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchSchools={searchSchools}
          isLoading={isLoading}
          error={error}
          schools={schools}
          handleSchoolSelect={handleSchoolSelect}
        />
      ) : selectedSchool ? (
        <TimetablePage
          selectedSchool={selectedSchool}
          timetableData={timetableData}
          isLoading={isLoading}
          error={error}
          grade={grade}
          setGrade={setGrade}
          classNum={classNum}
          setClassNum={setClassNum}
          goBackToSearch={goBackToSearch}
          loadTimetable={loadTimetable}
        />
      ) : null}
    </div>
  );
}

export default MainPage;
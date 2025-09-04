"use client";

import React, { useState, useEffect } from "react";
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

// LoadingPage 컴포넌트
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white/70 via-neutral-100/60 to-neutral-200/60">
      <div className="text-center space-y-6">
        <div className="animate-spin h-12 w-12 border-4 border-gray-400 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-600 text-lg font-medium">데이터를 불러오는 중...</p>
      </div>
    </div>
  );
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
    <div className="min-h-screen bg-gradient-to-br from-white/70 via-neutral-100/60 to-neutral-200/60 transition-all duration-300">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-neutral-800 bg-clip-text text-transparent">
              시간표 조회
            </h1>
            <p className="text-gray-700 max-w-md mx-auto">
              학교를 검색하여 실시간 시간표를 확인하세요
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/90 border border-gray-200 rounded-3xl p-8 shadow-xl">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="학교명을 입력하세요 (예: 신송)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchSchools()}
                  className="w-full px-6 py-4 bg-white/90 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              </div>
              <button
                onClick={searchSchools}
                disabled={isLoading}
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 text-white font-medium rounded-2xl transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    검색 중...
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
            <div className="backdrop-blur-xl bg-gray-100/80 border border-gray-200 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-800 text-center font-medium">{error}</p>
            </div>
          )}

          {schools.length > 0 && (
            <div className="backdrop-blur-xl bg-white/90 border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  검색 결과 ({schools.length}개)
                </h2>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {schools.map((school) => (
                  <div
                    key={`${school.id}-${school.schoolId}`}
                    onClick={() => handleSchoolSelect(school)}
                    className="group flex items-center justify-between p-5 bg-white/90 border border-gray-200 rounded-2xl hover:bg-white hover:border-gray-400 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors duration-200">
                        <MapPin className="h-5 w-5 text-gray-800" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{school.schoolName}</h3>
                        <p className="text-sm text-gray-600">{school.region}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
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
    <div className="min-h-screen bg-gradient-to-br from-white/70 via-neutral-100/60 to-neutral-200/60 transition-all duration-300">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goBackToSearch}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 border border-gray-200 rounded-xl text-gray-900 hover:bg-white hover:border-gray-400 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              학교 검색
            </button>
            <h1 className="text-2xl font-bold text-gray-900">시간표</h1>
            <div></div>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-gray-100/80 border border-gray-200 rounded-2xl p-6 shadow-lg">
              <p className="text-gray-800 text-center font-medium">{error}</p>
            </div>
          )}

          {timetableData && (
            <div className="backdrop-blur-xl bg-white/90 border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-gray-800" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{timetableData.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedSchool.region}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-1">
                      <span className="text-sm text-gray-700">학년</span>
                      <select
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                      <span className="text-sm text-gray-700">반</span>
                      <select
                        className="border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                  <div className="bg-gray-100 rounded-xl p-3 text-center font-medium text-gray-900 border border-gray-200">
                    교시
                  </div>
                  {days.map((day) => (
                    <div
                      key={day}
                      className="bg-gray-100 rounded-xl p-3 text-center font-medium text-gray-900 border border-gray-200"
                    >
                      {day}
                    </div>
                  ))}
                  {timetableData.periods.map((row, i) => (
                    <React.Fragment key={`row-${i}`}>
                      <div className="bg-white rounded-xl p-4 text-center border border-gray-200 flex flex-col justify-center">
                        <div className="font-semibold text-gray-900">
                          {row.period}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-gray-600" />
                          {row.time}
                        </div>
                      </div>
                      {row.days.map((subject, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`rounded-xl p-4 border border-gray-200 ${
                            subject.isChanged ? "bg-gray-100" : "bg-white"
                          } transition-all duration-200`}
                        >
                          <div className="text-center space-y-2">
                            <div className="font-medium text-sm text-gray-900">
                              {subject.subject || "-"}
                            </div>
                            {subject.teacher && (
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                <User className="h-3 w-3 text-gray-600" />
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
        </div>
      </div>
    </div>
  );
}

// Main Page 컴포넌트
function MainPage() {
  const [currentPage, setCurrentPage] = useState<"search" | "timetable" | "loading">("search");
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
    setCurrentPage("loading");
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data["학교검색"] && Array.isArray(data["학교검색"])) {
        const schoolsArray = data["학교검색"] as [number, string, string, number][];
        const processedSchools: School[] = schoolsArray
          .map((schoolData) => ({
            id: schoolData[0],
            region: schoolData[1] || "",
            schoolName: schoolData[2] || "",
            schoolId: schoolData[3],
          }))
          .filter(
            (school) =>
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
      setCurrentPage("search");
    }
  };

  const loadTimetable = async (schoolName: string, gradeVal = grade, classVal = classNum) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage("loading");
    try {
      const res = await fetch(
        `/api/timetable?schoolName=${encodeURIComponent(schoolName)}&grade=${gradeVal}&class=${classVal}`
      );
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
      setCurrentPage("timetable");
    }
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    setGrade(1);
    setClassNum(1);
    setCurrentPage("loading");
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
      {currentPage === "loading" ? (
        <LoadingPage />
      ) : currentPage === "search" ? (
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
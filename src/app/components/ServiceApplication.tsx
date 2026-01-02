import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Award,
  ChevronRight,
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";

interface ServiceApplicationProps {
  serviceId: number;
  onBack: () => void;
}

// Mock 서비스 데이터
const mockServiceData = {
  id: 1,
  title: "React 완벽 가이드 - 실전 프로젝트로 배우는 리액트",
  mentor: {
    name: "김개발",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop",
    title: "Senior Frontend Developer",
  },
  options: [
    {
      id: "1-1",
      name: "1:1 멘토링",
      description: "멘토와 1:1로 진행하는 맞춤형 멘토링",
      price: 50000,
      duration: "1시간",
      maxStudents: 1,
      subOptions: [
        {
          id: "coffee-chat",
          name: "커피챗",
          description: "편안한 분위기에서 진행하는 커리어 상담",
          timeOptions: [
            { id: "coffee-30", duration: "30분", price: 30000 },
            { id: "coffee-40", duration: "40", price: 40000 },
            { id: "coffee-50", duration: "50분", price: 50000 },
          ],
        },
        {
          id: "mock-interview",
          name: "모의면접",
          description: "실전 같은 기술 면접 연습 및 피드백",
          timeOptions: [
            { id: "interview-60", duration: "1시간", price: 50000 },
            { id: "interview-90", duration: "1시간 30분", price: 70000 },
            { id: "interview-120", duration: "2시간", price: 90000 },
          ],
        },
        {
          id: "resume-review",
          name: "이력서 첨삭",
          description: "개발자 이력서 및 포트폴리오 검토",
          timeOptions: [
            { id: "resume-30", duration: "30분", price: 35000 },
            { id: "resume-45", duration: "45분", price: 45000 },
            { id: "resume-60", duration: "1시간", price: 55000 },
          ],
        },
        {
          id: "code-review",
          name: "코드 리뷰",
          description: "프로젝트 코드 리뷰 및 개선 제안",
          timeOptions: [
            { id: "code-60", duration: "1시간", price: 60000 },
            { id: "code-90", duration: "1시간 30분", price: 85000 },
            { id: "code-120", duration: "2시간", price: 110000 },
          ],
        },
      ],
    },
    {
      id: "1-n-oneday",
      name: "1:N 원데이 클래스",
      description: "하루 완성 그룹 클래스",
      price: 30000,
      duration: "2시간",
      maxStudents: 10,
    },
    {
      id: "1-n-study",
      name: "1:N 스터디 (8주)",
      description: "8주 완성 심화 스터디",
      price: 200000,
      duration: "8주 (주 1회, 회당 2시간)",
      maxStudents: 15,
    },
  ],
  availableSlots: {
    "1-1": {
      "coffee-chat": {
        availableTimes: [
          { day: "월", times: ["09:00-18:00"] },
          { day: "화", times: ["10:00-17:00"] },
          { day: "수", times: ["09:00-18:00"] },
          { day: "목", times: ["13:00-21:00"] },
          { day: "금", times: ["09:00-18:00"] },
          { day: "토", times: ["10:00-14:00"] },
        ],
        bookedSlots: [
          { date: "2026-01-06", time: "10:00-10:30" },
          { date: "2026-01-06", time: "14:00-14:30" },
          { date: "2026-01-07", time: "11:00-11:30" },
          { date: "2026-01-08", time: "15:00-15:30" },
        ],
      },
      "mock-interview": {
        availableTimes: [
          { day: "월", times: ["09:00-18:00"] },
          { day: "화", times: ["10:00-17:00"] },
          { day: "수", times: ["09:00-18:00"] },
          { day: "목", times: ["13:00-21:00"] },
          { day: "금", times: ["09:00-18:00"] },
          { day: "토", times: ["10:00-15:00"] },
        ],
        bookedSlots: [
          { date: "2026-01-06", time: "13:00-14:00" },
          { date: "2026-01-08", time: "10:00-11:30" },
        ],
      },
      "resume-review": {
        availableTimes: [
          { day: "월", times: ["09:00-18:00"] },
          { day: "화", times: ["09:00-17:00"] },
          { day: "수", times: ["09:00-18:00"] },
          { day: "목", times: ["11:00-20:00"] },
          { day: "금", times: ["09:00-18:00"] },
          { day: "토", times: ["11:00-16:00"] },
        ],
        bookedSlots: [
          { date: "2026-01-07", time: "14:00-14:30" },
        ],
      },
      "code-review": {
        availableTimes: [
          { day: "월", times: ["09:00-18:00"] },
          { day: "화", times: ["10:00-18:00"] },
          { day: "수", times: ["09:00-18:00"] },
          { day: "목", times: ["13:00-21:00"] },
          { day: "금", times: ["09:00-18:00"] },
          { day: "토", times: ["10:00-16:00"] },
        ],
        bookedSlots: [
          { date: "2026-01-09", time: "16:00-18:00" },
        ],
      },
    },
    "1-n-oneday": [
      { date: "2026-01-15", time: "14:00-16:00", remaining: 5, maxSeats: 10 },
      { date: "2026-01-20", time: "10:00-12:00", remaining: 2, maxSeats: 10 },
      { date: "2026-01-25", time: "15:00-17:00", remaining: 7, maxSeats: 10 },
      { date: "2026-02-03", time: "10:00-12:00", remaining: 6, maxSeats: 10 },
    ],
    "1-n-study": {
      totalSessions: 8,
      duration: "8주",
      sessions: [
        { session: 1, date: "2026-01-10", time: "19:00-21:00", topic: "React 기초 - JSX와 컴포넌트" },
        { session: 2, date: "2026-01-17", time: "19:00-21:00", topic: "State와 Props 이해하기" },
        { session: 3, date: "2026-01-24", time: "19:00-21:00", topic: "Hooks - useState, useEffect" },
        { session: 4, date: "2026-01-31", time: "19:00-21:00", topic: "Custom Hooks와 성능 최적화" },
        { session: 5, date: "2026-02-07", time: "19:00-21:00", topic: "Redux를 활용한 상태 관리" },
        { session: 6, date: "2026-02-14", time: "19:00-21:00", topic: "Next.js와 SSR/SSG" },
        { session: 7, date: "2026-02-21", time: "19:00-21:00", topic: "TypeScript와 React 통합" },
        { session: 8, date: "2026-02-28", time: "19:00-21:00", topic: "실전 프로젝트 완성" },
      ],
      remaining: 3,
      maxSeats: 15,
    },
  },
  faqs: [
    {
      question: "취소 및 환불 정책은 어떻게 되나요?",
      answer: "수업 시작 24시간 전까지 전액 환불 가능합니다. 24시간 이내 취소 시 50% 환불되며, 수업 시작 후에는 환불이 불가능합니다.",
    },
    {
      question: "준비물이 필요한가요?",
      answer: "노트북과 개발 환경 세팅이 필요합니다. 자세한 준비 사항은 신청 완료 후 안내 메일로 발송됩니다.",
    },
    {
      question: "수업은 어떤 방식으로 진행되나요?",
      answer: "Zoom을 통한 온라인 실시간 수업으로 진행됩니다. 수업 링크는 시작 1시간 전에 발송됩니다.",
    },
    {
      question: "수업 자료는 제공되나요?",
      answer: "네, 모든 수업 자료와 실습 코드는 GitHub를 통해 제공되며, 수업 종료 후에도 계속 이 가능합니다.",
    },
    {
      question: "일정 변경이 가능한가요?",
      answer: "1:1 멘토링의 경우 24시간 전 요청 시 일정 변경이 가능합니다. 그룹 수업은 일정 변경이 어려우니 신중하게 선택해주세요.",
    },
  ],
};

export function ServiceApplication({ serviceId, onBack }: ServiceApplicationProps) {
  const [selectedOption, setSelectedOption] = useState<string>("1-1");
  const [selectedSubOption, setSelectedSubOption] = useState<string>("");
  const [selectedTimeOption, setSelectedTimeOption] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const service = mockServiceData;
  const selectedServiceOption = service.options.find(opt => opt.id === selectedOption);
  
  // 1:1 멘토링의 선택된 서브 옵션 찾기
  const selectedMentoringOption = selectedServiceOption?.subOptions?.find(
    (sub: any) => sub.id === selectedSubOption
  );
  
  // 선택된 시간 옵션 찾기
  const selectedTimeOptionData = selectedMentoringOption?.timeOptions?.find(
    (time: any) => time.id === selectedTimeOption
  );

  // 탭 변경 시 선택된 슬롯 초기화
  const handleTabChange = (optionId: string) => {
    setSelectedOption(optionId);
    setSelectedSubOption("");
    setSelectedTimeOption("");
    setSelectedSlot(null);
  };
  
  // 서브 옵션 변경 시 슬롯 초기화
  const handleSubOptionChange = (subOptionId: string) => {
    setSelectedSubOption(subOptionId);
    setSelectedTimeOption("");
    setSelectedSlot(null);
  };

  // 현재 주의 월요일 계산
  const getWeekStart = (offset: number) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 월요일 시작
    return addWeeks(weekStart, offset);
  };

  // 일주일의 날짜 생성 (월-일)
  const getWeekDates = (offset: number) => {
    const weekStart = getWeekStart(offset);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  // 특정 날짜에 가능한 시간대 찾기
  const getAvailableTimesForDate = (date: Date) => {
    if (!selectedSubOption) return [];
    
    const dayMap: { [key: string]: string } = {
      '0': '일', '1': '월', '2': '화', '3': '수', '4': '목', '5': '금', '6': '토'
    };
    const dayOfWeek = dayMap[date.getDay().toString()];
    const slot = service.availableSlots["1-1"][selectedSubOption]?.availableTimes?.find((s: any) => s.day === dayOfWeek);
    return slot?.times || [];
  };

  // 특정 날짜의 예약된 슬롯 가져오기
  const getBookedSlotsForDate = (date: Date) => {
    if (!selectedSubOption) return [];
    
    const dateStr = format(date, "yyyy-MM-dd");
    const bookedSlots = service.availableSlots["1-1"][selectedSubOption]?.bookedSlots || [];
    return bookedSlots.filter((slot: any) => slot.date === dateStr);
  };

  // 두 시간 범위가 겹치는지 확인
  const isTimeOverlapping = (start1: number, end1: number, start2: number, end2: number): boolean => {
    return (start1 < end2 && end1 > start2);
  };

  // 선택한 duration에 맞춰 시간 슬롯 생성
  const generateTimeSlots = (timeRange: string, durationMinutes: number) => {
    const [start, end] = timeRange.split('-');
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    const slots = [];
    let current = startMinutes;
    
    while (current + durationMinutes <= endMinutes) {
      const slotStart = `${Math.floor(current / 60).toString().padStart(2, '0')}:${(current % 60).toString().padStart(2, '0')}`;
      const slotEnd = `${Math.floor((current + durationMinutes) / 60).toString().padStart(2, '0')}:${((current + durationMinutes) % 60).toString().padStart(2, '0')}`;
      slots.push(`${slotStart}-${slotEnd}`);
      current += durationMinutes;
    }
    
    return slots;
  };

  // duration 문자열을 분으로 변환
  const parseDuration = (duration: string): number => {
    if (duration.includes('시간')) {
      const hours = parseFloat(duration);
      const minutes = duration.includes('30분') ? 30 : 0;
      return Math.floor(hours) * 60 + minutes;
    }
    return parseInt(duration);
  };

  // 특정 날짜에 대한 선택 가능한 슬롯 목록
  const getAvailableSlots = (date: Date) => {
    if (!selectedTimeOptionData) return [];
    
    const timeRanges = getAvailableTimesForDate(date);
    const durationMinutes = parseDuration(selectedTimeOptionData.duration);
    
    const allSlots = [];
    for (const range of timeRanges) {
      const slots = generateTimeSlots(range, durationMinutes);
      allSlots.push(...slots);
    }
    
    return allSlots;
  };

  // 분을 시간 문자열로 변환
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 특정 시간이 가능한 시간 범위 내에 있는지 확인
  const isTimeInRange = (timeMinutes: number, date: Date): boolean => {
    const timeRanges = getAvailableTimesForDate(date);
    
    for (const range of timeRanges) {
      const [start, end] = range.split('-');
      const startMinutes = timeToMinutes(start);
      const endMinutes = timeToMinutes(end);
      
      if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
        return true;
      }
    }
    
    return false;
  };

  // 바 클릭 시 시간 슬롯 생성
  const handleBarClick = (clickX: number, barWidth: number, date: Date) => {
    if (!selectedTimeOptionData) return;
    
    const durationMinutes = parseDuration(selectedTimeOptionData.duration);
    const clickPercentage = clickX / barWidth;
    const totalMinutesInDay = 24 * 60;
    const clickedMinutes = Math.floor(clickPercentage * totalMinutesInDay);
    
    // 10분 단위로 반올림
    const roundedMinutes = Math.floor(clickedMinutes / 10) * 10;
    
    // 클릭한 시간이 가능한 시간 범위 내에 있는지 확인
    if (!isTimeInRange(roundedMinutes, date)) return;
    
    // 종료 시간도 가능한 범위 내에 있는지 확인
    const endMinutes = roundedMinutes + durationMinutes;
    const timeRanges = getAvailableTimesForDate(date);
    let isValidSlot = false;
    
    for (const range of timeRanges) {
      const [start, end] = range.split('-');
      const startMinutes = timeToMinutes(start);
      const endMinutesRange = timeToMinutes(end);
      
      if (roundedMinutes >= startMinutes && endMinutes <= endMinutesRange) {
        isValidSlot = true;
        break;
      }
    }
    
    if (!isValidSlot) return;
    
    // 예약된 슬롯과 겹치는지 확인
    const bookedSlots = getBookedSlotsForDate(date);
    for (const booked of bookedSlots) {
      const [bookedStart, bookedEnd] = booked.time.split('-');
      const bookedStartMinutes = timeToMinutes(bookedStart);
      const bookedEndMinutes = timeToMinutes(bookedEnd);
      
      if (isTimeOverlapping(roundedMinutes, endMinutes, bookedStartMinutes, bookedEndMinutes)) {
        // 겹치는 경우 클릭 무시
        return;
      }
    }
    
    const startTime = minutesToTime(roundedMinutes);
    const endTime = minutesToTime(endMinutes);
    const slotDate = format(date, "yyyy-MM-dd");
    
    setSelectedSlot({ date: slotDate, time: `${startTime}-${endTime}` });
  };

  // 시간 문자열을 분으로 변환 (예: "09:00" -> 540)
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 시간 범위를 바 위치와 너비로 변환 (0-24시간 기준)
  const getBarStyle = (timeRange: string) => {
    const [start, end] = timeRange.split('-');
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    const totalMinutesInDay = 24 * 60;
    const left = (startMinutes / totalMinutesInDay) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutesInDay) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const weekStart = getWeekStart(currentWeekOffset);

  // 지난 날짜 제외 - 오늘 이후 날짜만 필터링
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDates = weekDates.filter(date => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate >= today;
  });

  // 원데이 클래스용: 캘린더 날짜 생성
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // 월의 첫 날 이전 빈 칸 추가 (일요일 시작 기준)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startPadding = firstDayOfMonth.getDay();
  const paddedCalendarDays = [
    ...Array.from({ length: startPadding }, (_, i) => addDays(firstDayOfMonth, -(startPadding - i))),
    ...calendarDays,
  ];

  // 특정 날짜의 원데이 클래스 세션 찾기
  const getOnedaySessionsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return service.availableSlots["1-n-oneday"].filter((slot: any) => slot.date === dateStr);
  };

  // 선택된 날짜의 원데이 클래스 세션
  const selectedDateSessions = selectedDate ? getOnedaySessionsForDate(selectedDate) : [];

  // 특정 날짜의 스터디 세션 찾기
  const getStudySessionsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return service.availableSlots["1-n-study"].sessions.filter((session: any) => session.date === dateStr);
  };

  // 선택된 날짜의 스터디 세션
  const selectedStudySessions = selectedDate ? getStudySessionsForDate(selectedDate) : [];

  const handlePayment = () => {
    if (!selectedOption) {
      alert("서비스 옵션을 선택해주세요.");
      return;
    }
    
    if (selectedOption !== "1-n-study" && !selectedSlot) {
      alert("일정을 선택해주세요.");
      return;
    }

    alert("결제 페이지로 이동합니다.");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="size-5" />
            돌아가기
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 서비스 정보 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">서비스 정보</h2>
                <div className="flex items-start gap-4">
                  <img
                    src={service.mentor.avatar}
                    alt={service.mentor.name}
                    className="size-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{service.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="size-4 text-[#00C471]" />
                      <span>{service.mentor.name}</span>
                      <span>•</span>
                      <span>{service.mentor.title}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
              <div className="flex gap-1">
                <button
                  onClick={() => handleTabChange("1-1")}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    selectedOption === "1-1"
                      ? "text-[#00C471]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  1:1 멘토링
                  {selectedOption === "1-1" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("1-n-oneday")}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    selectedOption === "1-n-oneday"
                      ? "text-[#00C471]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  1:N 원데이
                  {selectedOption === "1-n-oneday" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("1-n-study")}
                  className={`px-6 py-3 font-medium transition-colors relative ${
                    selectedOption === "1-n-study"
                      ? "text-[#00C471]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  1:N 스터디
                  {selectedOption === "1-n-study" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* 일정 선택 */}
            {selectedOption && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">일정 선택</h2>
                  
                  {selectedOption === "1-1" && (
                    <div className="space-y-6">
                      {/* 서브 옵션 선택 */}
                      <div>
                        <h3 className="font-medium mb-3">멘토링 유형 선택</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedServiceOption?.subOptions?.map((subOption: any) => (
                            <button
                              key={subOption.id}
                              onClick={() => handleSubOptionChange(subOption.id)}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                selectedSubOption === subOption.id
                                  ? "border-[#00C471] bg-[#E6F9F2]"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold">{subOption.name}</h4>
                                {selectedSubOption === subOption.id && (
                                  <div className="size-5 rounded-full bg-[#00C471] flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{subOption.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 시간 옵션 선택 */}
                      {selectedSubOption && selectedMentoringOption && (
                        <div>
                          <h3 className="font-medium mb-3">시간 옵션 선택</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {selectedMentoringOption.timeOptions.map((timeOption: any) => (
                              <button
                                key={timeOption.id}
                                onClick={() => {
                                  setSelectedTimeOption(timeOption.id);
                                  setSelectedSlot(null);
                                }}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                  selectedTimeOption === timeOption.id
                                    ? "border-[#00C471] bg-[#E6F9F2]"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="size-4" />
                                    <span className="font-bold">{timeOption.duration}</span>
                                  </div>
                                  {selectedTimeOption === timeOption.id && (
                                    <div className="size-5 rounded-full bg-[#00C471] flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-lg font-bold text-[#00C471]">
                                  ₩{timeOption.price.toLocaleString()}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 선택된 서브 옵션에 대한 날짜/시간대 선택 */}
                      {selectedSubOption && selectedTimeOption && (
                        <div>
                          <h3 className="font-medium mb-4">날짜 및 시간 선택</h3>
                          
                          {/* 주간 네비게이션 */}
                          <div className="flex items-center justify-between mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
                              className="gap-1"
                            >
                              <ChevronLeft className="size-4" />
                              이전 주
                            </Button>
                            <div className="text-center">
                              <h3 className="font-medium">
                                {format(weekStart, "yyyy년 M월", { locale: ko })}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {format(weekStart, "M/d", { locale: ko })} - {format(addDays(weekStart, 6), "M/d", { locale: ko })}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
                              className="gap-1"
                            >
                              다음 주
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>

                          {/* 일주일 일정 세로 표시 */}
                          <div className="space-y-2">
                            {futureDates.map((date, idx) => {
                              const availableTimes = getAvailableTimesForDate(date);
                              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                              const isPast = date < new Date() && !isToday;

                              return (
                                <div 
                                  key={idx} 
                                  className={`border rounded-lg p-4 transition-colors ${
                                    isPast 
                                      ? "bg-gray-50 border-gray-200" 
                                      : availableTimes.length > 0 
                                        ? "border-gray-200 hover:border-[#00C471] bg-white" 
                                        : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {/* 날짜 표시 */}
                                    <div className={`text-center min-w-[60px] ${
                                      isToday ? "text-[#00C471]" : isPast ? "text-gray-400" : "text-gray-900"
                                    }`}>
                                      <div className={`text-xs mb-1 ${
                                        isToday ? "font-medium" : ""
                                      }`}>
                                        {format(date, "EEE", { locale: ko })}
                                      </div>
                                      <div className={`text-2xl font-bold ${
                                        isToday ? "bg-[#00C471] text-white rounded-full size-12 flex items-center justify-center mx-auto" : ""
                                      }`}>
                                        {format(date, "d")}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {format(date, "M월", { locale: ko })}
                                      </div>
                                    </div>

                                    {/* 시간대 표시 */}
                                    <div className="flex-1">
                                      {isPast ? (
                                        <div className="text-sm text-gray-400 py-2">지난 날짜</div>
                                      ) : availableTimes.length > 0 ? (
                                        <div className="space-y-3">
                                          {/* 24시간 타임라인 레이블 */}
                                          <div className="flex justify-between text-xs text-gray-400 px-1">
                                            <span>0:00</span>
                                            <span>6:00</span>
                                            <span>12:00</span>
                                            <span>18:00</span>
                                            <span>24:00</span>
                                          </div>
                                          
                                          {/* 타임라인 바 컨테이너 */}
                                          <div 
                                            className="relative h-10 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                                            onClick={(e) => {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const clickX = e.clientX - rect.left;
                                              handleBarClick(clickX, rect.width, date);
                                            }}
                                          >
                                            {/* 시간 구분선 - 10분 단위 */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                              {Array.from({ length: 144 }, (_, i) => i).map((tenMin) => {
                                                const isHour = tenMin % 6 === 0;
                                                const isThreeHour = tenMin % 18 === 0;
                                                
                                                return (
                                                  <div
                                                    key={tenMin}
                                                    className={`absolute h-full border-l ${
                                                      isThreeHour
                                                        ? "border-gray-400"
                                                        : isHour
                                                          ? "border-gray-300"
                                                          : "border-gray-200"
                                                    }`}
                                                    style={{ left: `${(tenMin / 144) * 100}%` }}
                                                  />
                                                );
                                              })}
                                            </div>
                                            
                                            {/* 가능한 시간대 바 (멘토가 열어둔 전체 시간 범위) */}
                                            {availableTimes.map((timeRange, timeIdx) => {
                                              const barStyle = getBarStyle(timeRange);
                                              
                                              return (
                                                <div
                                                  key={timeIdx}
                                                  className="absolute h-full bg-[#E0F7ED] rounded pointer-events-none"
                                                  style={{
                                                    left: barStyle.left,
                                                    width: barStyle.width,
                                                  }}
                                                />
                                              );
                                            })}
                                            
                                            {/* 예약된 시간 슬롯 바 */}
                                            {getBookedSlotsForDate(date).map((bookedSlot: any, bookedIdx: number) => {
                                              const barStyle = getBarStyle(bookedSlot.time);
                                              
                                              return (
                                                <div
                                                  key={bookedIdx}
                                                  className="absolute h-full bg-red-100 border border-red-300 rounded pointer-events-none z-[5]"
                                                  style={{
                                                    left: barStyle.left,
                                                    width: barStyle.width,
                                                  }}
                                                  title={`예약됨: ${bookedSlot.time}`}
                                                >
                                                  <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[10px] text-red-600 font-medium">
                                                      예약
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            
                                            {/* 선택된 시간 슬롯 바 */}
                                            {selectedSlot?.date === format(date, "yyyy-MM-dd") && selectedSlot?.time && (
                                              (() => {
                                                const barStyle = getBarStyle(selectedSlot.time);
                                                return (
                                                  <div
                                                    className="absolute h-full bg-[#00C471] rounded pointer-events-none z-10"
                                                    style={{
                                                      left: barStyle.left,
                                                      width: barStyle.width,
                                                    }}
                                                  >
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                      <span className="text-xs text-white font-medium">
                                                        {selectedSlot.time}
                                                      </span>
                                                    </div>
                                                  </div>
                                                );
                                              })()
                                            )}
                                          </div>

                                          {/* 선택된 시간 표시 */}
                                          {selectedSlot?.date === format(date, "yyyy-MM-dd") && selectedSlot?.time && (
                                            <div className="flex items-center gap-2 text-sm text-[#00C471] bg-[#E6F9F2] px-3 py-2 rounded-lg">
                                              <Clock className="size-4" />
                                              <span className="font-medium">선택된 시간: {selectedSlot.time}</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-gray-400 py-2">멘토링 불가</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              💡 <strong>신청 방법:</strong> 원하는 날짜와 시간을 선택하여 1:1 맞춤 멘토링을 신청할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOption === "1-n-oneday" && (
                    <div>
                      {/* 월 네비게이션 */}
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                          className="gap-1"
                        >
                          <ChevronLeft className="size-4" />
                          이전 달
                        </Button>
                        <h3 className="font-medium">
                          {format(currentMonth, "yyyy년 M월", { locale: ko })}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="gap-1"
                        >
                          다음 달
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>

                      {/* 캘린더 */}
                      <div className="mb-6">
                        {/* 요일 헤더 */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                            <div 
                              key={day} 
                              className={`text-center text-sm font-medium py-2 ${
                                idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"
                              }`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* 캘린더 날짜 그리드 */}
                        <div className="grid grid-cols-7 gap-1">
                          {paddedCalendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isToday = isSameDay(day, new Date());
                            const isPast = day < new Date() && !isToday;
                            const daySessions = getOnedaySessionsForDate(day);
                            const hasSession = daySessions.length > 0;
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const dayOfWeek = day.getDay();

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (hasSession && !isPast) {
                                    setSelectedDate(day);
                                  }
                                }}
                                disabled={!hasSession || isPast}
                                className={`
                                  min-h-[100px] p-2 rounded-lg text-sm transition-all relative flex flex-col items-start
                                  ${!isCurrentMonth ? "text-gray-300" : ""}
                                  ${isPast ? "opacity-40 cursor-not-allowed" : ""}
                                  ${isToday ? "ring-2 ring-[#00C471]" : ""}
                                  ${isSelected ? "bg-[#00C471] text-white" : ""}
                                  ${hasSession && !isPast && !isSelected ? "bg-[#E6F9F2] hover:bg-[#D0F5E9]" : ""}
                                  ${!hasSession && !isPast && !isSelected ? "hover:bg-gray-100" : ""}
                                `}
                              >
                                {/* 날짜 숫자 */}
                                <div className={`font-medium mb-1 ${
                                  isToday ? "font-bold" : ""
                                } ${
                                  dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                } ${
                                  dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""
                                }`}>
                                  {format(day, "d")}
                                </div>
                                
                                {/* 세션 정보 표시 (최대 3개) */}
                                {hasSession && !isPast && (
                                  <div className="w-full space-y-1">
                                    {daySessions.slice(0, 3).map((session, sessionIdx) => (
                                      <div 
                                        key={sessionIdx}
                                        className={`text-xs px-1 py-0.5 rounded truncate ${
                                          isSelected 
                                            ? "bg-white/20 text-white" 
                                            : "bg-[#00C471] text-white"
                                        }`}
                                        title={`${session.time} (잔여 ${session.remaining}/${session.maxSeats}석)`}
                                      >
                                        {session.time.split('-')[0]}
                                      </div>
                                    ))}
                                    {/* 4개 이상일 경우 "+N개 더" 표시 */}
                                    {daySessions.length > 3 && (
                                      <div className={`text-xs px-1 py-0.5 rounded font-medium ${
                                        isSelected 
                                          ? "text-white/80" 
                                          : "text-[#00C471]"
                                      }`}>
                                        +{daySessions.length - 3}개 더
                                      </div>
                                    )}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 선택된 날짜의 세션 정보 */}
                      {selectedDate && selectedDateSessions.length > 0 ? (
                        <div>
                          <h3 className="font-medium mb-3">
                            {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 일정
                          </h3>
                          <div className="space-y-3">
                            {selectedDateSessions.map((session, idx) => {
                              const isSelected = selectedSlot?.date === session.date && selectedSlot?.time === session.time;
                              const isFull = session.remaining === 0;
                              
                              return (
                                <button
                                  key={idx} 
                                  onClick={() => !isFull && setSelectedSlot(session)}
                                  disabled={isFull}
                                  className={`w-full border rounded-lg p-4 flex items-center justify-between transition-all ${
                                    isSelected 
                                      ? "border-[#00C471] bg-[#E6F9F2]" 
                                      : isFull
                                        ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                        : "border-gray-200 hover:border-[#00C471] bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Clock className={`size-5 ${isSelected ? "text-[#00C471]" : "text-gray-400"}`} />
                                    <div>
                                      <div className={`font-medium ${isSelected ? "text-[#00C471]" : ""}`}>
                                        {session.time}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        원데이 클래스
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {isFull ? (
                                      <div className="text-sm text-red-500 font-medium">마감</div>
                                    ) : (
                                      <>
                                        <div className={`text-sm font-medium ${isSelected ? "text-[#00C471]" : "text-gray-600"}`}>
                                          잔여 {session.remaining}/{session.maxSeats}석
                                        </div>
                                        {session.remaining <= 3 && (
                                          <div className="text-xs text-red-500 mt-1">마감 임박</div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="size-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500">
                            캘린더에서 날짜를 선택하면<br />
                            해당 일자의 원데이 클래스 일정을 확인할 수 있습니다.
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          💡 <strong>원데이 클래스:</strong> 캘린더에서 날짜를 선택하면 해당 일자의 상세 일정을 확인할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOption === "1-n-study" && (
                    <div>
                      {/* 스터디 개요 */}
                      <div className="mb-4 p-4 bg-[#E6F9F2] rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-[#00C471]">
                              전체 {service.availableSlots["1-n-study"].totalSessions}회차 스터디
                            </h3>
                            <p className="text-sm text-gray-700 mt-1">
                              기간: {service.availableSlots["1-n-study"].duration}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[#00C471] font-medium">
                              잔여 {service.availableSlots["1-n-study"].remaining}/{service.availableSlots["1-n-study"].maxSeats}석
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 커리큘럼 리스트 */}
                      <h4 className="font-medium mb-3">커리큘럼</h4>
                      <div className="space-y-2 mb-6">
                        {service.availableSlots["1-n-study"].sessions.map((session: any, idx: number) => {
                          const [year, month, day] = session.date.split('-').map(Number);
                          const dateObj = new Date(year, month - 1, day);
                          
                          return (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-[#00C471] transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 size-10 rounded-full bg-[#E6F9F2] text-[#00C471] flex items-center justify-center font-bold">
                                  {session.session}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium mb-1">{session.topic}</div>
                                  <div className="text-sm text-gray-500 flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="size-3" />
                                      {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {session.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          💡 <strong>스터디 과정:</strong> 전체 {service.availableSlots["1-n-study"].totalSessions}회차를 모두 수강해야 하며, 체계적인 학습을 위해 순차적으로 진행됩니다.
                        </p>
                      </div>

                      {/* 스터디 일정 캘린더 */}
                      <div>
                        <h4 className="font-medium mb-4">일정 캘린더</h4>
                        
                        {/* 월 네비게이션 */}
                        <div className="flex items-center justify-between mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                            className="gap-1"
                          >
                            <ChevronLeft className="size-4" />
                            이전 달
                          </Button>
                          <h3 className="font-medium">
                            {format(currentMonth, "yyyy년 M월", { locale: ko })}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="gap-1"
                          >
                            다음 달
                            <ChevronRight className="size-4" />
                          </Button>
                        </div>

                        {/* 캘린더 */}
                        <div className="mb-6">
                          {/* 요일 헤더 */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                              <div 
                                key={day} 
                                className={`text-center text-sm font-medium py-2 ${
                                  idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* 캘린더 날짜 그리드 */}
                          <div className="grid grid-cols-7 gap-1">
                            {paddedCalendarDays.map((day, idx) => {
                              const isCurrentMonth = isSameMonth(day, currentMonth);
                              const isToday = isSameDay(day, new Date());
                              const studySessions = getStudySessionsForDate(day);
                              const hasSession = studySessions.length > 0;
                              const isSelected = selectedDate && isSameDay(day, selectedDate);
                              const dayOfWeek = day.getDay();

                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (hasSession) {
                                      setSelectedDate(day);
                                    }
                                  }}
                                  disabled={!hasSession}
                                  className={`
                                    min-h-[100px] p-2 rounded-lg text-sm transition-all relative flex flex-col items-start
                                    ${!isCurrentMonth ? "text-gray-300" : ""}
                                    ${isToday ? "ring-2 ring-[#00C471]" : ""}
                                    ${isSelected ? "bg-[#00C471] text-white" : ""}
                                    ${hasSession && !isSelected ? "bg-[#FFF4E6] hover:bg-[#FFE8CC]" : ""}
                                    ${!hasSession && !isSelected ? "hover:bg-gray-100" : ""}
                                  `}
                                >
                                  {/* 날짜 숫자 */}
                                  <div className={`font-medium mb-1 ${
                                    isToday ? "font-bold" : ""
                                  } ${
                                    dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                  } ${
                                    dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""
                                  }`}>
                                    {format(day, "d")}
                                  </div>
                                  
                                  {/* 스터디 회차 정보 표시 */}
                                  {hasSession && studySessions.map((session: any, sessionIdx: number) => (
                                    <div key={sessionIdx} className="w-full space-y-1">
                                      <div 
                                        className={`text-xs px-1.5 py-1 rounded font-medium ${
                                          isSelected 
                                            ? "bg-white/20 text-white" 
                                            : "bg-[#FF9500] text-white"
                                        }`}
                                        title={`${session.session}회차: ${session.topic}`}
                                      >
                                        {session.session}회차
                                      </div>
                                      <div 
                                        className={`text-xs px-1 py-0.5 rounded truncate ${
                                          isSelected 
                                            ? "text-white/90" 
                                            : "text-gray-700"
                                        }`}
                                        title={session.time}
                                      >
                                        {session.time.split('-')[0]}
                                      </div>
                                    </div>
                                  ))}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 선택된 날짜의 스터디 세션 정보 */}
                        {selectedDate && selectedStudySessions.length > 0 ? (
                          <div>
                            <h3 className="font-medium mb-3">
                              {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 일정
                            </h3>
                            <div className="space-y-3">
                              {selectedStudySessions.map((session: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="border border-[#FF9500] bg-[#FFF4E6] rounded-lg p-4"
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="size-10 rounded-full bg-[#FF9500] text-white flex items-center justify-center font-bold">
                                      {session.session}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-[#FF9500]">{session.topic}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 ml-13">
                                    <span className="flex items-center gap-1">
                                      <Clock className="size-4" />
                                      {session.time}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="size-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">
                              캘린더에서 날짜를 선택하면<br />
                              해당 일자의 스터디 일정을 확인할 수 있습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 요청사항 */}
            {selectedOption && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">요청사항</h2>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="멘토에게 전달할 메시지나 특별히 배우고 싶은 내용을 작성해주세요. (선택사항)"
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {message.length}/500자
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 자주 묻는 질문 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  자주 묻는 질문
                </h2>
                <div className="space-y-3">
                  {service.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium pr-4">{faq.question}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp className="size-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="size-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측 사이드바: 결제 정보 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">결제 정보</h3>
                  
                  {!selectedOption ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        서비스 옵션을 선택해주세요
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-gray-600">서비스</span>
                          <span className="font-medium text-right max-w-[200px]">
                            {selectedOption === "1-1" && selectedMentoringOption 
                              ? selectedMentoringOption.name
                              : selectedServiceOption?.name}
                          </span>
                        </div>
                        
                        {selectedSlot && selectedOption === "1-1" && (
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-600">일정</span>
                            <span className="text-right">
                              {(() => {
                                const [year, month, day] = selectedSlot.date.split('-').map(Number);
                                const dateObj = new Date(year, month - 1, day);
                                return (
                                  <>
                                    {format(dateObj, "M월 d일 (EEE)", { locale: ko })}<br />
                                    {selectedSlot.time}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                        )}
                        
                        {selectedSlot && selectedOption === "1-n-oneday" && (
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-600">일정</span>
                            <span className="text-right">
                              {(() => {
                                const [year, month, day] = selectedSlot.date.split('-').map(Number);
                                const dateObj = new Date(year, month - 1, day);
                                return (
                                  <>
                                    {format(dateObj, "M월 d일 (EEE)", { locale: ko })}<br />
                                    {selectedSlot.time}
                                  </>
                                );
                              })()}
                            </span>
                          </div>
                        )}

                        {selectedOption === "1-n-study" && (
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-600">기간</span>
                            <span className="text-right">
                              {selectedServiceOption?.duration}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start justify-between text-sm">
                          <span className="text-gray-600">수강 인원</span>
                          <span>
                            최대 {selectedServiceOption?.maxStudents}명
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">서비스 금액</span>
                          <span className="font-medium">
                            ₩{(selectedOption === "1-1" && selectedTimeOptionData 
                              ? selectedTimeOptionData.price
                              : selectedServiceOption?.price || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>부가세 (VAT 포함)</span>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">총 결제금액</span>
                            <span className="font-bold text-2xl text-[#00C471]">
                              ₩{(selectedOption === "1-1" && selectedTimeOptionData 
                                ? selectedTimeOptionData.price
                                : selectedServiceOption?.price || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handlePayment}
                        disabled={selectedOption !== "1-n-study" && !selectedSlot}
                        className="w-full bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        결제하기
                      </Button>

                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          • 결제 후 즉시 예약이 확정됩니다.<br />
                          • 환불 정책은 FAQ를 참고해주세요.<br />
                          • 문의사항은 고객센터로 연락주세요.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
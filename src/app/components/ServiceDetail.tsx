import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ServiceDetailSkeleton } from "./ServiceDetailSkeleton";
import { Card, CardContent } from "./ui/card";
import {
  Star,
  Clock,
  Calendar,
  Users,
  ChevronLeft,
  MessageSquare,
  Award,
  ChevronRight,
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { serviceDetailService } from "../../api/serviceDetail";
import { LessonDetail } from "../../types/lesson";

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onNavigateToApplication: () => void;
}

export function ServiceDetail({ serviceId, onBack, onNavigateToApplication }: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState<"description" | "schedule">("description");
  const [scheduleType, setScheduleType] = useState<"1-1" | "1-n-oneday" | "1-n-study">("1-1");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [service, setService] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setIsLoading(true);
      try {
        const data = await serviceDetailService.getServiceDetail(serviceId);
        setService(data);
      } catch (error) {
        console.error("Failed to fetch service detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  // Inside component
  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service not found</div>;
  }

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
  // 특정 날짜에 가능한 시간대 찾기
  const getAvailableTimesForDate = (date: Date) => {
    // rawAvailableTimes가 있으면 그것을 사용하여 정확한 날짜 매칭
    if (service.schedules["1-1"]?.rawAvailableTimes) {
      return service.schedules["1-1"].rawAvailableTimes
        .filter(slot => isSameDay(new Date(slot.startTime), date))
        .map(slot => {
          const startTime = new Date(slot.startTime);
          const endTime = new Date(slot.endTime);
          return `${startTime.toTimeString().slice(0, 5)}-${endTime.toTimeString().slice(0, 5)}`;
        })
        .sort(); // 시간순 정렬
    }

    // fallback: 기존 요일 기반 로직 (하위 호환성)
    const dayMap: { [key: string]: string } = {
      '0': '일', '1': '월', '2': '화', '3': '수', '4': '목', '5': '금', '6': '토'
    };
    const dayOfWeek = dayMap[date.getDay().toString()];
    const slot = service.schedules["1-1"]?.availableTimes.find(s => s.day === dayOfWeek);
    return slot?.times || [];
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

  // 1:N 원데이 캘린더 관련 함수
  const getOnedaySessionsForDate = (date: Date) => {
    return service.schedules["1-n-oneday"]?.sessions.filter(session => {
      const [year, month, day] = session.date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      return isSameDay(sessionDate, date);
    }) || [];
  };

  const hasOnedaySession = (date: Date) => {
    return getOnedaySessionsForDate(date).length > 0;
  };

  // 1:N 스터디 캘린더 관련 함수
  const getStudySessionsForDate = (date: Date) => {
    return service.schedules["1-n-study"]?.sessions.filter(session => {
      const [year, month, day] = session.date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      return isSameDay(sessionDate, date);
    }) || [];
  };

  const hasStudySession = (date: Date) => {
    return getStudySessionsForDate(date).length > 0;
  };

  // 캘린더에 표시할 날짜들 생성
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
    const endDate = addDays(startDate, 41); // 6주 표시 (42일)

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const calendarDays = getCalendarDays();
  const selectedDateSessions = selectedDate ? getOnedaySessionsForDate(selectedDate) : [];

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
          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 상단: 멘토 프로필 & 서비스 정보 */}
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-100">
                  <img
                    src={
                      service.thumbnail.includes("picsum.photos")
                        ? `${service.thumbnail}${service.thumbnail.includes("?") ? "&" : "?"}random=${service.id}`
                        : service.thumbnail
                    }
                    alt={service.title}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={service.mentor.avatar}
                      alt={service.mentor.name}
                      className="size-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{service.mentor.name}</h2>
                        <Award className="size-5 text-[#00C471]" />
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{service.mentor.introduction}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h1 className="text-2xl font-bold mb-3">{service.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-gray-500">({service.reviewCount}개 리뷰)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="size-4" />
                        <span>{service.studentCount.toLocaleString()}명 수강</span>
                      </div>
                      <div className="px-3 py-1 bg-[#E6F9F2] text-[#00C471] rounded-full text-xs font-medium">
                        {service.serviceType}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 중반: 탭 메뉴 (서비스 설명 / 일정) */}
            <Card>
              <CardContent className="p-0">
                {/* 탭 헤더 */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "description"
                        ? "text-[#00C471] border-b-2 border-[#00C471]"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      서비스 설명
                    </button>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "schedule"
                        ? "text-[#00C471] border-b-2 border-[#00C471]"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      일정
                    </button>
                  </div>
                </div>

                {/* 탭 컨텐츠 */}
                <div className="p-6">
                  {activeTab === "description" ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: service.description.replace(/\n/g, '<br/>').replace(/<strong>/g, '<strong class="text-gray-900">')
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      {/* 일정 타입 표시 (수정 불가, 서비스 타입에 따라 자동 감지) */}
                      <div className="flex gap-2 border-b border-gray-200 pb-2 mb-6">
                        <div className="px-4 py-2 rounded-t-lg font-medium text-sm bg-[#E6F9F2] text-[#00C471]">
                          {service.serviceType === "mentoring" && "1:1 멘토링"}
                          {service.serviceType === "oneday" && "1:N 원데이"}
                          {service.serviceType === "study" && "1:N 스터디"}
                        </div>
                      </div>

                      {/* 1:1 멘토링 타입 */}
                      {service.serviceType === "mentoring" && (
                        <div>
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
                                  className={`border rounded-lg p-4 transition-colors ${isPast
                                    ? "bg-gray-50 border-gray-200"
                                    : availableTimes.length > 0
                                      ? "border-gray-200 hover:border-[#00C471] bg-white"
                                      : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {/* 날짜 표시 */}
                                    <div className={`text-center min-w-[60px] ${isToday ? "text-[#00C471]" : isPast ? "text-gray-400" : "text-gray-900"
                                      }`}>
                                      <div className={`text-xs mb-1 ${isToday ? "font-medium" : ""
                                        }`}>
                                        {format(date, "EEE", { locale: ko })}
                                      </div>
                                      <div className={`text-2xl font-bold ${isToday ? "bg-[#00C471] text-white rounded-full size-12 flex items-center justify-center mx-auto" : ""
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
                                          <div className="relative h-10 bg-gray-100 rounded-lg">
                                            {/* 시간 구분선 - 1시간 단위 (얇은 선), 3시간 단위 (굵은 선) */}
                                            <div className="absolute inset-0 flex">
                                              {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                                                <div
                                                  key={hour}
                                                  className={`absolute h-full border-l ${hour % 3 === 0
                                                    ? "border-gray-400" // 3시간 단위: 굵은 선
                                                    : "border-gray-300" // 1시간 단위: 얇은 선
                                                    }`}
                                                  style={{ left: `${(hour / 24) * 100}%` }}
                                                />
                                              ))}
                                            </div>

                                            {/* 가능한 시간대 바 */}
                                            {availableTimes.map((timeRange, timeIdx) => {
                                              const barStyle = getBarStyle(timeRange);
                                              return (
                                                <div
                                                  key={timeIdx}
                                                  className="absolute h-full bg-[#00C471] hover:bg-[#00B366] rounded cursor-pointer transition-colors group"
                                                  style={{
                                                    left: barStyle.left,
                                                    width: barStyle.width,
                                                  }}
                                                >
                                                  {/* 시간 레이블 (hover 시 표시) */}
                                                  <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                      {timeRange}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          {/* 시간대 텍스트 목록 */}
                                          <div className="flex flex-wrap gap-2">
                                            {availableTimes.map((time, timeIdx) => (
                                              <div
                                                key={timeIdx}
                                                className="flex items-center gap-1 text-xs text-gray-600"
                                              >
                                                <Clock className="size-3 text-[#00C471]" />
                                                <span>{time}</span>
                                              </div>
                                            ))}
                                          </div>
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

                      {/* 1:N 원데이 타입 */}
                      {service.serviceType === "oneday" && (
                        <div>
                          {/* 월 네비게이션 */}
                          <div className="flex items-center justify-between mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
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
                                  className={`text-center text-sm font-medium py-2 ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"
                                    }`}
                                >
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* 캘린더 날짜 그리드 */}
                            <div className="grid grid-cols-7 gap-1">
                              {calendarDays.map((day, idx) => {
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
                                    <div className={`font-medium mb-1 ${isToday ? "font-bold" : ""
                                      } ${dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                      } ${dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""
                                      }`}>
                                      {format(day, "d")}
                                    </div>

                                    {/* 세션 정보 표시 (최대 3개) */}
                                    {hasSession && !isPast && (
                                      <div className="w-full space-y-1">
                                        {daySessions.slice(0, 3).map((session, sessionIdx) => (
                                          <div
                                            key={sessionIdx}
                                            className={`text-xs px-1 py-0.5 rounded truncate ${isSelected
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
                                          <div className={`text-xs px-1 py-0.5 rounded font-medium ${isSelected
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
                                {selectedDateSessions.map((session, idx) => (
                                  <div
                                    key={idx}
                                    className="border border-[#00C471] bg-[#E6F9F2] rounded-lg p-4 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Clock className="size-5 text-[#00C471]" />
                                      <div>
                                        <div className="font-medium text-[#00C471]">{session.time}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          원데이 클래스
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm text-[#00C471] font-medium">
                                        잔여 {session.remaining}/{session.maxSeats}석
                                      </div>
                                      {session.remaining <= 3 && (
                                        <div className="text-xs text-red-500 mt-1">마감 임박</div>
                                      )}
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

                      {/* 1:N 스터디 타입 */}
                      {service.serviceType === "study" && (
                        <div>
                          <div className="mb-4 p-4 bg-[#E6F9F2] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-[#00C471]">전체 {service.schedules["1-n-study"]?.totalSessions}회차 스터디</h3>
                                <p className="text-sm text-gray-700 mt-1">기간: {service.schedules["1-n-study"]?.duration}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-[#00C471] font-medium">
                                  잔여 {service.schedules["1-n-study"]?.remaining}/{service.schedules["1-n-study"]?.maxSeats}석
                                </div>
                              </div>
                            </div>
                          </div>

                          <h4 className="font-medium mb-3">커리큘럼</h4>
                          <div className="space-y-2">
                            {service.schedules["1-n-study"]?.sessions.map((session, idx) => {
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
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              💡 <strong>스터디 과정:</strong> 전체 {service.schedules["1-n-study"]?.totalSessions}회차를 모두 수강해야 하며, 체계적인 학습을 위해 순차적으로 진행됩니다.
                            </p>
                          </div>

                          {/* 스터디 일정 캘린더 */}
                          <div className="mt-6">
                            <h4 className="font-medium mb-4">일정 캘린더</h4>

                            {/* 월 네비게이션 */}
                            <div className="flex items-center justify-between mb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
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
                                    className={`text-center text-sm font-medium py-2 ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-gray-700"
                                      }`}
                                  >
                                    {day}
                                  </div>
                                ))}
                              </div>

                              {/* 캘린더 날짜 그리드 */}
                              <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
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
                                      <div className={`font-medium mb-1 ${isToday ? "font-bold" : ""
                                        } ${dayOfWeek === 0 && isCurrentMonth && !isSelected ? "text-red-500" : ""
                                        } ${dayOfWeek === 6 && isCurrentMonth && !isSelected ? "text-blue-500" : ""
                                        }`}>
                                        {format(day, "d")}
                                      </div>

                                      {/* 스터디 회차 정보 표시 */}
                                      {hasSession && studySessions.map((session, sessionIdx) => (
                                        <div key={sessionIdx} className="w-full space-y-1">
                                          <div
                                            className={`text-xs px-1.5 py-1 rounded font-medium ${isSelected
                                              ? "bg-white/20 text-white"
                                              : "bg-[#FF9500] text-white"
                                              }`}
                                            title={`${session.session}회차: ${session.topic}`}
                                          >
                                            {session.session}회차
                                          </div>
                                          <div
                                            className={`text-xs px-1 py-0.5 rounded truncate ${isSelected
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
                            {selectedDate && (() => {
                              const selectedStudySessions = getStudySessionsForDate(selectedDate);
                              return selectedStudySessions.length > 0 ? (
                                <div>
                                  <h3 className="font-medium mb-3">
                                    {format(selectedDate, "M월 d일 (EEE)", { locale: ko })} 일정
                                  </h3>
                                  <div className="space-y-3">
                                    {selectedStudySessions.map((session, idx) => (
                                      <div
                                        key={idx}
                                        className="border border-[#FF9500] bg-[#FFF4E6] rounded-lg p-4"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="flex-shrink-0 size-10 rounded-full bg-[#FF9500] text-white flex items-center justify-center font-bold">
                                            {session.session}
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium text-[#FF9500] mb-1">{session.topic}</div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                              <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {session.time}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 하단: 리뷰 섹션 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    수강생 리뷰
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{service.rating}</span>
                    <span className="text-gray-500">({service.reviewCount}개)</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {service.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={review.avatar}
                          alt={review.userName}
                          className="size-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium">{review.userName}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star
                                      key={idx}
                                      className={`size-3 ${idx < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                                <span>•</span>
                                <span>{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            도움이 돼요 ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측 사이드바: 신청 버튼 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      {service.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₩{service.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {service.serviceType === 'oneday' && <span className="text-lg text-gray-500 font-medium mr-1">최저</span>}
                        ₩{service.price.toLocaleString()}
                      </span>
                      {service.originalPrice && (
                        <span className="text-sm font-medium text-red-500">
                          {Math.round((1 - service.price / service.originalPrice) * 100)}% 할인
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={onNavigateToApplication}
                    className="w-full bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-lg font-medium"
                  >
                    서비스 신청하기
                  </Button>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="size-4" />
                      <span>평균 응답 시간: 1시간 이내</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="size-4" />
                      <span>현재 {service.studentCount}명 수강 중</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="size-4" />
                      <span>만족도 {service.rating}/5.0</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium mb-3">이런 점이 좋아요</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00C471] mt-1">✓</span>
                        <span>실무 경험 10년차 전문가</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00C471] mt-1">✓</span>
                        <span>체계적인 커리큘럼</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00C471] mt-1">✓</span>
                        <span>실전 프로젝트 포함</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00C471] mt-1">✓</span>
                        <span>평생 수강 가능</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
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
  Check,
} from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { serviceDetailService } from "../../api/serviceDetail";
import { StudyApplicationView } from "./service-application/StudyApplicationView";
import { OneDayClassApplicationView } from "./service-application/OneDayClassApplicationView";
import { LessonDetail, LessonOption } from "../../types/lesson";

interface ServiceApplicationProps {
  serviceId: string;
  onBack: () => void;
}


export function ServiceApplication({ serviceId, onBack }: ServiceApplicationProps) {
  const [service, setService] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 1:1 Mentoring State
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceDetailService.getServiceDetail(serviceId);
        setService(data);
        if (data && data.options && data.options.length > 0) {
          setSelectedOptionId(data.options[0].id); // Default to first option
        }
      } catch (error) {
        console.error("Failed to fetch service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading || !service) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const selectedOption = service.options?.find(opt => opt.id === selectedOptionId);

  // 탭 변경 시 선택된 슬롯 초기화 (Not used for now as type is fixed per lesson)
  // But keeping structure if we need it



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

  // 특정 날짜에 가능한 시간대 찾기 (1:1 Mentoring)
  const getAvailableTimesForDate = (date: Date) => {
    // 1. Get raw available times from service
    const rawTimes = service.schedules?.["1-1"]?.rawAvailableTimes || [];
    const dateStr = format(date, "yyyy-MM-dd");

    // 2. Filter by date matching start time
    // ISO format: 2025-01-10T05:00:00Z
    // We assume raw times are in UTC or ISO format that we can parse
    const timesForDate = rawTimes.filter(t => {
      const tDate = new Date(t.startTime);
      return format(tDate, "yyyy-MM-dd") === dateStr;
    });

    // 3. Map to "HH:mm-HH:mm" strings for the UI generator
    return timesForDate.map(t => {
      const start = new Date(t.startTime);
      const end = new Date(t.endTime);
      const formatTime = (d: Date) => d.toTimeString().slice(0, 5); // "HH:mm"
      return `${formatTime(start)}-${formatTime(end)}`;
    });
  };

  // 특정 날짜의 예약된 슬롯 가져오기 (Mock empty for now as real backend integration needed for bookings)
  const getBookedSlotsForDate = (date: Date) => {
    return [];
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
    if (!selectedOption) return [];

    const timeRanges = getAvailableTimesForDate(date);
    const durationMinutes = selectedOption.minute;

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
    if (!selectedOption) return;

    const durationMinutes = selectedOption.minute;
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





  const handlePayment = () => {
    if (!selectedOption) {
      alert("서비스 옵션을 선택해주세요.");
      return;
    }

    if (service.serviceType === "mentoring" && !selectedSlot) {
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

            {/* 탭 네비게이션 - Removed, assuming single service type per page for now or relying on serviceType */}
            <div className="border-b border-gray-200">
              <div className="flex gap-1">
                <button
                  className="px-6 py-3 font-medium transition-colors relative text-[#00C471]"
                >
                  {service.serviceType === "mentoring" ? "1:1 멘토링" :
                    service.serviceType === "oneday" ? "1:N 원데이" : "1:N 스터디"}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                </button>
              </div>
            </div>

            {/* 일정 선택 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">일정 선택</h2>

                {service.serviceType === "mentoring" && (
                  <div className="space-y-6">
                    {/* 옵션 선택 */}
                    <div>
                      <h3 className="font-medium mb-3">시간 옵션 선택</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.options?.map((option: LessonOption) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedOptionId(option.id);
                              setSelectedSlot(null);
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${selectedOptionId === option.id
                              ? "border-[#00C471] bg-[#E6F9F2]"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold">{option.name}</h4>
                              {selectedOptionId === option.id && (
                                <div className="size-5 rounded-full bg-[#00C471] flex items-center justify-center">
                                  <Check className="size-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock className="size-4" />
                              <span>{option.duration}</span>
                            </div>
                            <div className="text-lg font-bold text-[#00C471]">
                              ₩{option.price.toLocaleString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 선택된 옵션에 대한 날짜/시간대 선택 */}
                    {selectedOption && (
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
                                                  className={`absolute h-full border-l ${isThreeHour
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

                {service.serviceType === "oneday" && (
                  <OneDayClassApplicationView
                    service={service}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                )}

                {service.serviceType === "study" && (
                  <StudyApplicationView service={service} />
                )}
              </CardContent>
            </Card>


            {/* 요청사항 */}
            {selectedOption && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">요청사항</h2>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="멘토에게 전달하고 싶은 내용을 입력해주세요."
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:border-transparent"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽 사이드바 (결제 정보) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4">결제 정보</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">서비스 금액</span>
                      <span className="font-medium">
                        ₩{selectedOption ? selectedOption.price.toLocaleString() : 0}
                      </span>
                    </div>
                    {/* 할인 등 추가 항목이 있다면? */}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">총 결제 금액</span>
                      <span className="text-xl font-bold text-[#00C471]">
                        ₩{selectedOption ? selectedOption.price.toLocaleString() : 0}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-bold bg-[#00C471] hover:bg-[#00B066]"
                    disabled={!selectedOption || (service.serviceType === "mentoring" && !selectedSlot)}
                    onClick={handlePayment}
                  >
                    신청하기
                  </Button>
                </CardContent>
              </Card>

              {/* 도움말 등 추가 정보? */}
              <div className="text-xs text-gray-500 text-center">
                결제 시 서비스 이용 약관에 동의하게 됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
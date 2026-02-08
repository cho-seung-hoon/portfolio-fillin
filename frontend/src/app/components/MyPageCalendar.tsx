import { useState, useEffect } from "react";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Clock, MapPin } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { scheduleService } from "../../api/schedule";
import { ScheduleListResponse } from "../../api/types";
import { Badge } from "./ui/badge";

const typeColors: Record<string, string> = {
  MENTORING: "bg-blue-100 text-blue-700 border-blue-200",
  ONEDAY: "bg-purple-100 text-purple-700 border-purple-200",
  STUDY: "bg-green-100 text-green-700 border-green-200",
};

const typeLabels: Record<string, string> = {
  MENTORING: "멘토링",
  ONEDAY: "원데이 클래스",
  STUDY: "스터디",
};

export function MyPageCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarSchedules, setCalendarSchedules] = useState<Record<string, ScheduleListResponse[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const start = startOfMonth(selectedMonth).toISOString();
        const end = endOfMonth(selectedMonth).toISOString();

        const response = await scheduleService.getCalendarSchedules(start, end, 0, 100);

        // Group schedules by date
        // Group schedules by date
        const groupedSchedules: Record<string, ScheduleListResponse[]> = {};
        console.log("Calendar schedules fetched:", response.content);

        response.content.forEach((schedule: ScheduleListResponse) => {
          // Use startTime converted to local date string to match Calendar's selectedDate format
          // This handles timezone differences correctly (e.g. UTC start time -> Local Date)
          const dateKey = format(new Date(schedule.startTime), "yyyy-MM-dd");

          if (!groupedSchedules[dateKey]) {
            groupedSchedules[dateKey] = [];
          }
          groupedSchedules[dateKey].push(schedule);
        });
        setCalendarSchedules(groupedSchedules);

      } catch (error) {
        console.error("Failed to fetch calendar schedules:", error);
      }
    };
    fetchSchedules();
  }, [selectedMonth]);


  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const schedules = calendarSchedules[dateKey] || [];

  // Dates with schedules
  const scheduleDates = Object.keys(calendarSchedules).map((key) => {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <CardTitle>스케줄 캘린더</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={handleMonthChange}
            locale={ko}
            className="border rounded-lg"
            modifiers={{
              hasSchedule: scheduleDates,
            }}
            modifiersClassNames={{
              hasSchedule: "bg-[#00C471]/10 hover:bg-[#00C471]/20 font-semibold text-[#00C471]",
            }}
          />
        </CardContent>
      </Card>

      {/* Schedule List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {format(selectedDate, "M월 d일 (E)", { locale: ko })} 일정
            </span>
            <span className="text-sm font-normal text-gray-500">
              {schedules.length}건
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.scheduleTimeId}
                  className="p-4 border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{schedule.lessonTitle}</h4>
                    <span
                      className={`text-xs px-2 py-1 border rounded ${typeColors[schedule.lessonType] || "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                    >
                      {typeLabels[schedule.lessonType] || schedule.lessonType}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="size-4" />
                      <span>{format(new Date(schedule.startTime), "HH:mm")} - {format(new Date(schedule.endTime), "HH:mm")}</span>
                    </div>
                    {schedule.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="size-4" />
                        <span>{schedule.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              선택한 날짜에 일정이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
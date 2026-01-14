import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  ArrowLeft,
  Save,
  Users,
  Calendar,
  BookOpen,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { MentoringScheduleSection } from "./service-registration/MentoringScheduleSection";
import { OneDaySessionSection } from "./service-registration/OneDaySessionSection";
import { MentoringOptionSection } from "./service-registration/MentoringOptionSection";

interface ServiceRegistrationProps {
  onBack: () => void;
}

export interface PriceOption {
  id: string;
  duration: string;
  price: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  priceOptions: PriceOption[];
}

export interface AvailableTime {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  [dateKey: string]: AvailableTime[];
}

export interface OneDaySession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
}

export function ServiceRegistration({
  onBack,
}: ServiceRegistrationProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [options, setOptions] = useState<ServiceOption[]>([
    { id: "1", name: "", priceOptions: [] },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [daySchedules, setDaySchedules] = useState<DaySchedule>({});
  const [selectingStartHour, setSelectingStartHour] = useState<number | null>(null);
  const [oneDaySessions, setOneDaySessions] = useState<OneDaySession[]>([]);
  const [newSessionStartTime, setNewSessionStartTime] = useState("");
  const [newSessionEndTime, setNewSessionEndTime] = useState("");
  const [newSessionPrice, setNewSessionPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출하여 서비스 등록
    if (serviceType === "1-1-mentoring") {
      console.log({ title, content, serviceType, options });
    } else {
      console.log({
        title,
        content,
        serviceType,
        price,
        duration,
      });
    }
    alert("서비스가 등록되었습니다!");
    onBack();
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: Date.now().toString(), name: "", priceOptions: [] },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length > 1) {
      setOptions(options.filter((option) => option.id !== id));
    }
  };

  const updateOptionName = (id: string, name: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, name } : option,
      ),
    );
  };

  const addPriceOption = (optionId: string) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
            ...option,
            priceOptions: [
              ...option.priceOptions,
              {
                id: Date.now().toString(),
                duration: "",
                price: "",
              },
            ],
          }
          : option,
      ),
    );
  };

  const removePriceOption = (
    optionId: string,
    priceOptionId: string,
  ) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
            ...option,
            priceOptions: option.priceOptions.filter(
              (po) => po.id !== priceOptionId,
            ),
          }
          : option,
      ),
    );
  };

  const updatePriceOption = (
    optionId: string,
    priceOptionId: string,
    field: keyof PriceOption,
    value: string,
  ) => {
    setOptions(
      options.map((option) =>
        option.id === optionId
          ? {
            ...option,
            priceOptions: option.priceOptions.map((po) =>
              po.id === priceOptionId
                ? { ...po, [field]: value }
                : po,
            ),
          }
          : option,
      ),
    );
  };

  // 캘린더 관련 함수
  const getDateKey = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  const handleTimeBarClick = (hour: number) => {
    if (!selectedDate) return;

    if (selectingStartHour === null) {
      // 첫 번째 클릭: 시작 시간 선택
      setSelectingStartHour(hour);
    } else {
      // 두 번째 클릭: 종료 시간 선택
      const startHour = Math.min(selectingStartHour, hour);
      const endHour = Math.max(selectingStartHour, hour) + 1;

      const dateKey = getDateKey(selectedDate);
      const newTimeSlot: AvailableTime = {
        id: Date.now().toString(),
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
      };

      setDaySchedules({
        ...daySchedules,
        [dateKey]: [...(daySchedules[dateKey] || []), newTimeSlot],
      });

      // 선택 초기화
      setSelectingStartHour(null);
    }
  };

  const removeTimeSlot = (timeId: string) => {
    if (!selectedDate) return;

    const dateKey = getDateKey(selectedDate);
    setDaySchedules({
      ...daySchedules,
      [dateKey]: daySchedules[dateKey].filter((t) => t.id !== timeId),
    });
  };

  const getSelectedDateSchedule = () => {
    if (!selectedDate) return [];
    return daySchedules[getDateKey(selectedDate)] || [];
  };

  const getDatesWithSchedule = () => {
    return Object.keys(daySchedules).filter(
      (dateKey) => daySchedules[dateKey].length > 0
    );
  };

  const isHourInSchedule = (hour: number) => {
    const schedule = getSelectedDateSchedule();

    return schedule.some(slot => {
      const slotStart = parseInt(slot.startTime.split(':')[0]);
      const slotEnd = parseInt(slot.endTime.split(':')[0]);

      return hour >= slotStart && hour < slotEnd;
    });
  };

  const isHourInSelectingRange = (hour: number) => {
    if (selectingStartHour === null) return false;

    const min = Math.min(selectingStartHour, hour);
    const max = Math.max(selectingStartHour, hour);

    return hour >= min && hour <= max;
  };

  // 1:N 원데이 관련 함수
  const addOneDaySession = () => {
    if (!selectedDate || !newSessionStartTime || !newSessionEndTime) {
      alert("날짜와 시작/종료 시간을 모두 입력해주세요.");
      return;
    }

    // 원데이 클래스일 때만 가격 검증
    if (serviceType === "1-n-oneday") {
      if (!newSessionPrice || isNaN(Number(newSessionPrice)) || Number(newSessionPrice) < 0) {
        alert("올바른 가격을 입력해주세요.");
        return;
      }
    }

    const newSession: OneDaySession = {
      id: Date.now().toString(),
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: newSessionStartTime,
      endTime: newSessionEndTime,
      price: serviceType === "1-n-oneday" ? newSessionPrice : "0",
    };

    setOneDaySessions([...oneDaySessions, newSession]);
    setNewSessionStartTime("");
    setNewSessionEndTime("");
    setNewSessionPrice("");
  };

  const removeOneDaySession = (sessionId: string) => {
    setOneDaySessions(oneDaySessions.filter(s => s.id !== sessionId));
  };

  const getSessionsForDate = (dateStr: string) => {
    return oneDaySessions.filter(s => s.date === dateStr);
  };

  // 전체 일정 기준으로 회차 번호 계산 (스터디용)
  const getSessionNumber = (sessionId: string) => {
    const sortedSessions = [...oneDaySessions].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return sortedSessions.findIndex(s => s.id === sessionId) + 1;
  };

  const isFormValid = () => {
    if (!title || !content || !serviceType) return false;

    if (serviceType === "1-1-mentoring") {
      return options.every(
        (opt) =>
          opt.name &&
          opt.priceOptions.length > 0 &&
          opt.priceOptions.every(
            (po) => po.duration && po.price,
          ),
      );
    } else {
      return price && duration;
    }
  };

  const serviceTypes = [
    {
      value: "1-1-mentoring",
      label: "1:1 멘토링",
      icon: Users,
      description: "멘토와 1대1로 진행하는 맞춤형 멘토링",
    },
    {
      value: "1-n-oneday",
      label: "1:N 원데이",
      icon: Calendar,
      description: "하루 완성 그룹 클래스",
    },
    {
      value: "1-n-study",
      label: "1:N 스터디",
      icon: BookOpen,
      description: "장기간 진행하는 그룹 스터디",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-md"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-3xl">서비스 등록</h1>
              <p className="text-gray-600 mt-1">
                멘토링 서비스를 등록하고 멘티들과 연결되세요
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 서비스 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title">서비스 제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: React 완벽 가이드 1:1 멘토링"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    멘티들이 쉽게 이해할 수 있는 명확한 제목을
                    작성해주세요
                  </p>
                </div>

                {/* 서비스 내용 */}
                <div className="space-y-2">
                  <Label htmlFor="content">서비스 내용</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="서비스에 대한 상세 설명을 작성해주세요&#10;&#10;- 어떤 내용을 다루나요?&#10;- 누구에게 추천하나요?&#10;- 어떤 결과를 얻을 수 있나요?"
                    className="min-h-[200px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* 서비스 종류 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>서비스 종류</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setServiceType(type.value)
                        }
                        className={`
                          p-4 rounded-md border-2 transition-all text-left
                          ${serviceType === type.value
                            ? "border-[#00C471] bg-[#E6F9F2]"
                            : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <Icon
                          className={`size-6 mb-2 ${serviceType === type.value
                            ? "text-[#00C471]"
                            : "text-gray-400"
                            }`}
                        />
                        <h3
                          className={`font-medium mb-1 ${serviceType === type.value
                            ? "text-[#00C471]"
                            : "text-gray-900"
                            }`}
                        >
                          {type.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 1:1 멘토링 옵션 */}
            {serviceType === "1-1-mentoring" && (
              <MentoringOptionSection
                options={options}
                addOption={addOption}
                removeOption={removeOption}
                updateOptionName={updateOptionName}
                addPriceOption={addPriceOption}
                removePriceOption={removePriceOption}
                updatePriceOption={updatePriceOption}
              />
            )}

            {/* 가능한 시간 설정 (캘린더) - 1:1 멘토링일 때만 표시 */}
            {serviceType === "1-1-mentoring" && (
              <MentoringScheduleSection
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                daySchedules={daySchedules}
                selectingStartHour={selectingStartHour}
                onTimeBarClick={handleTimeBarClick}
                isHourInSchedule={isHourInSchedule}
                isHourInSelectingRange={isHourInSelectingRange}
                onRemoveTimeSlot={removeTimeSlot}
              />
            )}

            {/* 원데이 일정 설정 - 1:N 원데이일 때만 표시 */}
            {serviceType === "1-n-oneday" && (
              <OneDaySessionSection
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                getSessionsForDate={getSessionsForDate}
                oneDaySessions={oneDaySessions}
                newSessionStartTime={newSessionStartTime}
                setNewSessionStartTime={setNewSessionStartTime}
                newSessionEndTime={newSessionEndTime}
                setNewSessionEndTime={setNewSessionEndTime}
                newSessionPrice={newSessionPrice}
                setNewSessionPrice={setNewSessionPrice}
                addSession={addOneDaySession}
                removeSession={removeOneDaySession}
                getSessionNumber={getSessionNumber}
              />
            )}

            {/* 스터디 일정 설정 - 1:N 스터디일 때만 표시 */}
            {serviceType === "1-n-study" && (
              <OneDaySessionSection
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                getSessionsForDate={getSessionsForDate}
                oneDaySessions={oneDaySessions}
                newSessionStartTime={newSessionStartTime}
                setNewSessionStartTime={setNewSessionStartTime}
                newSessionEndTime={newSessionEndTime}
                setNewSessionEndTime={setNewSessionEndTime}
                newSessionPrice={newSessionPrice}
                setNewSessionPrice={setNewSessionPrice}
                addSession={addOneDaySession}
                removeSession={removeOneDaySession}
                getSessionNumber={getSessionNumber}
              />
            )}

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                disabled={!isFormValid()}
              >
                <Save className="size-4" />
                서비스 등록
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
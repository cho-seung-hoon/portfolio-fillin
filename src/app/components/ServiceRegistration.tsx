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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { CalendarModule } from "./service-registration/CalendarModule";
import { MentoringScheduleSection } from "./service-registration/MentoringScheduleSection";

interface ServiceRegistrationProps {
  onBack: () => void;
}

interface PriceOption {
  id: string;
  duration: string;
  price: string;
}

interface ServiceOption {
  id: string;
  name: string;
  priceOptions: PriceOption[];
}

interface AvailableTime {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  [dateKey: string]: AvailableTime[];
}

interface OneDaySession {
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

                {/* 1:1 멘토링 옵션 */}
                {serviceType === "1-1-mentoring" && (
                  <div className="space-y-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>멘토링 옵션</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          제공할 멘토링 옵션과 각 옵션별 시간/가격을 설정해주세요
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="gap-2"
                      >
                        <Plus className="size-4" />
                        옵션 추가
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div
                          key={option.id}
                          className="p-4 bg-gray-50 rounded-md space-y-3"
                        >
                          {/* 옵션 이름 */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={option.name}
                              onChange={(e) =>
                                updateOptionName(
                                  option.id,
                                  e.target.value,
                                )
                              }
                              placeholder={`옵션 ${index + 1} (예: 기본 상담)`}
                              className="flex-1 bg-white"
                            />
                            {options.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeOption(option.id)
                                }
                              >
                                <Trash2 className="size-4 text-gray-400" />
                              </Button>
                            )}
                          </div>

                          {/* 진행시간 및 가격 추가 */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm text-gray-600">
                                진행시간 및 가격
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  addPriceOption(option.id)
                                }
                                className="gap-1 h-8 text-xs"
                              >
                                <Plus className="size-3" />
                                추가
                              </Button>
                            </div>

                            {option.priceOptions.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-3 bg-white rounded border border-dashed border-gray-300">
                                시간/가격을 추가해주세요
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {option.priceOptions.map(
                                  (priceOption) => (
                                    <div
                                      key={priceOption.id}
                                      className="flex items-end gap-2 p-3 bg-white rounded-md border border-gray-200"
                                    >
                                      <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-gray-600">
                                          진행시간
                                        </Label>
                                        <Select
                                          value={
                                            priceOption.duration
                                          }
                                          onValueChange={(
                                            value,
                                          ) =>
                                            updatePriceOption(
                                              option.id,
                                              priceOption.id,
                                              "duration",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="시간 선택" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="30">
                                              30분
                                            </SelectItem>
                                            <SelectItem value="60">
                                              60분
                                            </SelectItem>
                                            <SelectItem value="90">
                                              90분
                                            </SelectItem>
                                            <SelectItem value="120">
                                              120분
                                            </SelectItem>
                                            <SelectItem value="180">
                                              180분
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <Label className="text-xs text-gray-600">
                                          가격 (원)
                                        </Label>
                                        <Input
                                          type="number"
                                          value={
                                            priceOption.price
                                          }
                                          onChange={(e) =>
                                            updatePriceOption(
                                              option.id,
                                              priceOption.id,
                                              "price",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="50000"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removePriceOption(
                                            option.id,
                                            priceOption.id,
                                          )
                                        }
                                        className="mb-0.5"
                                      >
                                        <Trash2 className="size-4 text-gray-400" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    일정 설정
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <CalendarModule
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      renderDateContent={(date) => {
                        const dateKey = format(date, "yyyy-MM-dd");
                        const sessions = getSessionsForDate(dateKey);
                        if (sessions.length === 0) return null;
                        return (
                          <div className="space-y-1">
                            {sessions.slice(0, 2).map((session) => (
                              <div
                                key={session.id}
                                className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                              >
                                {session.startTime}-{session.endTime}
                              </div>
                            ))}
                            {sessions.length > 2 && (
                              <div className="text-xs text-gray-500 px-2">
                                +{sessions.length - 2}회
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />

                    {/* 선택된 날짜에 회차 추가 */}
                    {selectedDate && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium mb-3">
                            {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 회차 추가
                          </h4>

                          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                            <div className="space-y-2">
                              <Label className="text-sm">시작 시간</Label>
                              <Input
                                type="time"
                                value={newSessionStartTime}
                                onChange={(e) => setNewSessionStartTime(e.target.value)}
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">종료 시간</Label>
                              <Input
                                type="time"
                                value={newSessionEndTime}
                                onChange={(e) => setNewSessionEndTime(e.target.value)}
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">가격 (원)</Label>
                              <Input
                                type="number"
                                value={newSessionPrice}
                                onChange={(e) => setNewSessionPrice(e.target.value)}
                                placeholder="50000"
                                className="bg-white"
                                min="0"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={addOneDaySession}
                              className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                            >
                              <Plus className="size-4" />
                              추가
                            </Button>
                          </div>
                        </div>

                        {/* 선택된 날짜의 회차 목록 */}
                        {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium">등록된 회차</h5>
                              <span className="text-sm text-gray-500">
                                총 {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length}개
                              </span>
                            </div>
                            <div className="space-y-2">
                              {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).map((session, index) => (
                                <div
                                  key={session.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-500">
                                      {index + 1}회차
                                    </span>
                                    <span className="text-sm font-medium">
                                      {session.startTime} - {session.endTime}
                                    </span>
                                    <span className="text-sm text-[#00C471] font-medium">
                                      {Number(session.price).toLocaleString()}원
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOneDaySession(session.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            )}

            {/* 스터디 일정 설정 - 1:N 스터디일 때만 표시 */}
            {serviceType === "1-n-study" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    일정 설정
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <CalendarModule
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      renderDateContent={(date) => {
                        const dateKey = format(date, "yyyy-MM-dd");
                        const sessions = getSessionsForDate(dateKey);
                        if (sessions.length === 0) return null;
                        return (
                          <div className="space-y-1">
                            {sessions.slice(0, 2).map((session) => (
                              <div
                                key={session.id}
                                className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                              >
                                {session.startTime}-{session.endTime}
                              </div>
                            ))}
                            {sessions.length > 2 && (
                              <div className="text-xs text-gray-500 px-2">
                                +{sessions.length - 2}회
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />

                    {/* 선택된 날짜에 회차 추가 */}
                    {selectedDate && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium mb-3">
                            {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 회차 추가
                          </h4>

                          <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-2">
                              <Label className="text-sm">시작 시간</Label>
                              <Input
                                type="time"
                                value={newSessionStartTime}
                                onChange={(e) => setNewSessionStartTime(e.target.value)}
                                className="bg-white"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label className="text-sm">종료 시간</Label>
                              <Input
                                type="time"
                                value={newSessionEndTime}
                                onChange={(e) => setNewSessionEndTime(e.target.value)}
                                className="bg-white"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={addOneDaySession}
                              className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                            >
                              <Plus className="size-4" />
                              추가
                            </Button>
                          </div>
                        </div>

                        {/* 선택된 날짜의 회차 목록 */}
                        {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium">등록된 회차</h5>
                              <span className="text-sm text-gray-500">
                                총 {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length}개
                              </span>
                            </div>
                            <div className="space-y-2">
                              {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500">
                                      {getSessionNumber(session.id)}회차
                                    </span>
                                    <span className="text-sm font-medium">
                                      {session.startTime} - {session.endTime}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOneDaySession(session.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 전체 회차 요약 - 스터디에만 표시 */}
                    {oneDaySessions.length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">전체 회차 요약</h5>
                        <p className="text-sm text-blue-700 mb-3">
                          총 {oneDaySessions.length}개의 회차가 등록되었습니다
                        </p>

                        {/* 날짜별로 그룹화된 회차 표시 */}
                        <div className="space-y-3">
                          {(() => {
                            // 날짜별로 그룹화
                            const groupedByDate: { [date: string]: OneDaySession[] } = {};
                            oneDaySessions.forEach(session => {
                              if (!groupedByDate[session.date]) {
                                groupedByDate[session.date] = [];
                              }
                              groupedByDate[session.date].push(session);
                            });

                            // 날짜순으로 정렬
                            const sortedDates = Object.keys(groupedByDate).sort();

                            return sortedDates.map(dateKey => {
                              const sessions = groupedByDate[dateKey];
                              // Parse date safely by splitting the string
                              const [year, month, day] = dateKey.split('-').map(Number);
                              const dateObj = new Date(year, month - 1, day);

                              return (
                                <div key={dateKey} className="bg-white p-3 rounded border border-blue-100">
                                  <div className="font-medium text-blue-900 mb-2">
                                    {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {sessions.map((session) => (
                                      <div
                                        key={session.id}
                                        className="text-xs bg-blue-50 px-3 py-1.5 rounded border border-blue-100"
                                      >
                                        <span className="font-medium text-blue-900">{getSessionNumber(session.id)}회차: </span>
                                        <span className="text-gray-600">
                                          {session.startTime} - {session.endTime}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
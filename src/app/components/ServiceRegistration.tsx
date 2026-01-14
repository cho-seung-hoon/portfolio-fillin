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
} from "lucide-react";
import { format } from "date-fns";

import { MentoringScheduleSection } from "./service-registration/MentoringScheduleSection";
import { MentoringOptionSection } from "./service-registration/MentoringOptionSection";
import { ServiceTypeSelectionSection } from "./service-registration/ServiceTypeSelectionSection";
import { OneDayClassSection, OneDayClassData } from "./service-registration/OneDayClassSection";
import { StudySessionSection, StudySessionData } from "./service-registration/StudySessionSection";

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

export function ServiceRegistration({
  onBack,
}: ServiceRegistrationProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [options, setOptions] = useState<ServiceOption[]>([
    { id: "1", name: "", priceOptions: [] },
  ]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [daySchedules, setDaySchedules] = useState<DaySchedule>({});
  const [selectingStartHour, setSelectingStartHour] = useState<number | null>(null);

  // State for OneDay Class 
  const [oneDayClassData, setOneDayClassData] = useState<OneDayClassData>({ sessions: [] });
  // State for Study
  const [studySessionData, setStudySessionData] = useState<StudySessionData>({ price: 0, seats: 0, sessions: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceType === "1-1-mentoring") {
      console.log({ title, content, serviceType, options, daySchedules });
    } else if (serviceType === "1-n-oneday") {
      console.log({ title, content, serviceType, ...oneDayClassData });
    } else if (serviceType === "1-n-study") {
      console.log({ title, content, serviceType, ...studySessionData });
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

  // 캘린더 관련 함수 (1:1 멘토링용)
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
    } else if (serviceType === "1-n-oneday") {
      return oneDayClassData.sessions.length > 0;
    } else if (serviceType === "1-n-study") {
      return studySessionData.price > 0 && studySessionData.sessions.length > 0;
    }
    return false;
  };

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

          <form className="space-y-6">
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
            <ServiceTypeSelectionSection
              serviceType={serviceType}
              setServiceType={setServiceType}
            />

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

            {/* 원데이 클래스 일정 설정 - 1:N 원데이일 때만 표시 (세션별 가격/인원) */}
            {serviceType === "1-n-oneday" && (
              <OneDayClassSection onChange={setOneDayClassData} />
            )}

            {/* 스터디 일정 설정 - 1:N 스터디일 때만 표시 (전체 가격/인원) */}
            {serviceType === "1-n-study" && (
              <StudySessionSection onChange={setStudySessionData} />
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
                type="button"
                className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                disabled={!isFormValid()}
                onClick={handleSubmit}
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
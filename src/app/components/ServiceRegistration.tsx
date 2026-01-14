
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
  MapPin,
  Calendar as CalendarIcon
} from "lucide-react";

import { ServiceTypeSelectionSection } from "./service-registration/ServiceTypeSelectionSection";
import { OneDayClassSection, OneDayClassData } from "./service-registration/OneDayClassSection";
import { StudySessionSection } from "./service-registration/StudySessionSection";
import { MentoringSection, MentoringData } from "./service-registration/MentoringSection";
import { useStudyRegistrationStore } from "../../store/useStudyRegistrationStore";

interface ServiceRegistrationProps {
  onBack: () => void;
}

export function ServiceRegistration({
  onBack,
}: ServiceRegistrationProps) {
  // Store usage
  const {
    title, setTitle,
    lessonType, setLessonType, // ServiceType
    description, setDescription, // Content
    location, setLocation,
    categoryId, setCategoryId,
    closeAt, setCloseAt,
    // Global Price/Seats (for Study)
    price, seats,
    availableTimeList, // For Study (and others if migrated)
    // Actions/Setters needed? Most work directly.
    setOptionList, // If we were to sync Mentoring
    setAvailableTimeList // If we were to sync others
  } = useStudyRegistrationStore();

  // Local state for Mentoring/OneDay until fully migrated 
  // (We use local state to capture output from children, then merge on submit)
  const [mentoringData, setMentoringData] = useState<MentoringData>({
    options: [],
    schedules: {}
  });

  const [oneDayClassData, setOneDayClassData] = useState<OneDayClassData>({ sessions: [] });

  // Wrapper for ServiceType to sync with store
  const handleServiceTypeChange = (value: string) => {
    setLessonType(value);
  };

  // Helper to convert Local Date+Time string to ISO 8601 (UTC)
  const toLocalISOString = (dateStr: string, timeStr: string) => {
    // Create date object treating input as Local Time
    const localDate = new Date(`${dateStr}T${timeStr}`);
    return localDate.toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare DTO structure
    const requestDTO = {
      title,
      lessonType,
      description,
      location,
      categoryId: 1, // Defaulting for now as UI might be simple input or hidden
      closeAt: closeAt || null,
      price: 0,
      seats: 0,
      optionList: [] as any[],
      availableTimeList: [] as any[]
    };

    if (lessonType === "1-1-mentoring") {
      // Map Mentoring Data to DTO
      // Mentoring Options -> optionList
      requestDTO.optionList = mentoringData.options.map(opt => ({
        name: opt.name,
        // Mentoring options have multiple price options (minute/price). 
        // flexible structure? DTO Option has (name, minute, price).
        // If UI allows multiple prices per option, we might need to flatten or pick one?
        // Assuming flattened: "Basic Consult" -> 30min/10000, 60min/20000.
        // DTO Option seems to be the combination. 
        // We'll flatten here: For each UI Option, for each PriceOption -> DTO Option
      }));
      // Actually, let's look at the DTO. Option(name, minute, price). 
      // Our UI MentoringOption has name, and LIST of priceOptions. 
      // We probably need to flatten: OptionName="Basic - 30min", minute=30, price=...
      const flattenedOptions: any[] = [];
      mentoringData.options.forEach(opt => {
        opt.priceOptions.forEach(po => {
          flattenedOptions.push({
            name: `${opt.name} (${po.duration}분)`,
            minute: Number(po.duration),
            price: Number(po.price)
          });
        });
      });
      requestDTO.optionList = flattenedOptions;

      // Mentoring Schedules -> availableTimeList
      // Mentoring uses "slots".
      const flatTimes: any[] = [];
      Object.entries(mentoringData.schedules).forEach(([dateKey, slots]) => {
        slots.forEach(slot => {
          flatTimes.push({
            startTime: toLocalISOString(dateKey, `${slot.startTime}:00`),
            endTime: toLocalISOString(dateKey, `${slot.endTime}:00`),
            price: 0, // Mentoring price is in Option
            seats: 1  // Usually 1 for 1:1
          });
        });
      });
      requestDTO.availableTimeList = flatTimes;

    } else if (lessonType === "1-n-oneday") {
      // Map OneDay Data
      // OneDay has sessions with individual price/seats
      const flatTimes: any[] = [];
      oneDayClassData.sessions.forEach(session => {
        flatTimes.push({
          startTime: toLocalISOString(session.date, `${session.startTime}:00`),
          endTime: toLocalISOString(session.date, `${session.endTime}:00`),
          price: session.price,
          seats: session.seats
        });
      });
      requestDTO.availableTimeList = flatTimes;

    } else if (lessonType === "1-n-study") {
      // Study Data (Already in Store)
      requestDTO.price = price;
      requestDTO.seats = seats;
      requestDTO.availableTimeList = availableTimeList; // Already formatted in StudySessionSection or close to it
    }

    console.log("RegisterLessonRequest:", requestDTO);
    alert("서비스 등록 요청 (콘솔 확인)");
  };

  const isFormValid = () => {
    if (!title || !description || !lessonType) return false;

    if (lessonType === "1-1-mentoring") {
      return mentoringData.options.length > 0; // Simplified
    } else if (lessonType === "1-n-oneday") {
      return oneDayClassData.sessions.length > 0;
    } else if (lessonType === "1-n-study") {
      return price > 0 && seats > 0 && availableTimeList.length > 0;
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
                </div>

                {/* 서비스 내용 */}
                <div className="space-y-2">
                  <Label htmlFor="content">서비스 내용</Label>
                  <Textarea
                    id="content"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="서비스 상세 설명..."
                    className="min-h-[200px]"
                    required
                  />
                </div>

                {/* 위치 (Location) */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    진행 장소
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 강남역 인근 카페 / 온라인 (Zoom)"
                  />
                </div>

                {/* 마감일 (Deadline) */}
                <div className="space-y-2">
                  <Label htmlFor="closeAt" className="flex items-center gap-2">
                    <CalendarIcon className="size-4" />
                    모집 마감일
                  </Label>
                  <Input
                    id="closeAt"
                    type="date"
                    value={closeAt ? new Date(closeAt).toLocaleDateString('en-CA') : ''} // Display as YYYY-MM-DD
                    onChange={(e) => {
                      if (e.target.value) {
                        setCloseAt(toLocalISOString(e.target.value, "23:59:59"));
                      } else {
                        setCloseAt(null);
                      }
                    }}
                  />
                </div>

              </CardContent>
            </Card>

            {/* 서비스 종류 선택 */}
            <ServiceTypeSelectionSection
              serviceType={lessonType}
              setServiceType={handleServiceTypeChange}
            />

            {/* 1:1 멘토링 */}
            {lessonType === "1-1-mentoring" && (
              <MentoringSection onChange={setMentoringData} />
            )}

            {/* 1:N 원데이 */}
            {lessonType === "1-n-oneday" && (
              <OneDayClassSection onChange={setOneDayClassData} />
            )}

            {/* 1:N 스터디 (상태는 Store에서 관리) */}
            {lessonType === "1-n-study" && (
              <StudySessionSection />
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
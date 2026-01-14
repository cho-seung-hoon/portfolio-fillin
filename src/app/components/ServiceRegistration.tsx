import { useState, useEffect } from "react";
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
  Calendar as CalendarIcon,
  Tag
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { ServiceTypeSelectionSection } from "./service-registration/ServiceTypeSelectionSection";
import { OneDayClassSection } from "./service-registration/OneDayClassSection";
import { StudySessionSection } from "./service-registration/StudySessionSection";
import { MentoringSection } from "./service-registration/MentoringSection";

// Stores
import { useStudyRegistrationStore } from "../../store/useStudyRegistrationStore";
import { useMentoringRegistrationStore } from "../../store/useMentoringRegistrationStore";
import { useOneDayRegistrationStore } from "../../store/useOneDayRegistrationStore";
import { useLessonFormStore } from "../../store/useLessonFormStore";

// API
import { categoryService } from "../../api/category";
import { CategoryResponseDto } from "../../api/types";

interface ServiceRegistrationProps {
  onBack: () => void;
}

export function ServiceRegistration({
  onBack,
}: ServiceRegistrationProps) {
  // --- Global State Management ---
  // Basic Info Store
  const {
    title, setTitle,
    description, setDescription,
    location, setLocation,
    closeAt, setCloseAt,
    lessonType, setLessonType,
    categoryId, setCategoryId
  } = useLessonFormStore();

  // --- Specific Stores ---
  const mentoringStore = useMentoringRegistrationStore();
  const oneDayStore = useOneDayRegistrationStore();
  const studyStore = useStudyRegistrationStore();

  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
        if (data.length > 0 && categoryId === 1) {
          // Optional: Auto-select first if currently default(1) [Or keep 1 if it's "General"]
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [categoryId]);

  // Helper to convert Local Date+Time string to ISO 8601 (UTC)
  const toLocalISOString = (dateStr: string, timeStr: string) => {
    const localDate = new Date(`${dateStr}T${timeStr}`);
    return localDate.toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Base DTO
    const requestDTO = {
      title,
      lessonType,
      description,
      location,
      categoryId,
      closeAt: closeAt || null,
      price: 0,
      seats: 0,
      optionList: [] as any[],
      availableTimeList: [] as any[]
    };

    if (lessonType === "1-1-mentoring") {
      const { mentoringOptions, availableTimeList } = mentoringStore;

      // Flatten Options
      const flattenedOptions: any[] = [];
      mentoringOptions.forEach(opt => {
        opt.priceOptions.forEach(po => {
          flattenedOptions.push({
            name: `${opt.name} (${po.duration}분)`,
            minute: Number(po.duration),
            price: Number(po.price)
          });
        });
      });
      requestDTO.optionList = flattenedOptions;

      // Schedules
      requestDTO.availableTimeList = availableTimeList;

    } else if (lessonType === "1-n-oneday") {
      const { availableTimeList } = oneDayStore;
      // OneDay: store already has ISO times, price, seats.
      requestDTO.availableTimeList = availableTimeList;

    } else if (lessonType === "1-n-study") {
      const { price, seats, availableTimeList } = studyStore;
      requestDTO.price = price;
      requestDTO.seats = seats;
      requestDTO.availableTimeList = availableTimeList;
    }

    console.log("RegisterLessonRequest:", requestDTO);
    alert("서비스 등록 요청 (콘솔 확인)");
  };

  const isFormValid = () => {
    if (!title || !description || !lessonType || !categoryId) return false;

    if (lessonType === "1-1-mentoring") {
      const { mentoringOptions } = mentoringStore;
      return mentoringOptions.length > 0 && mentoringOptions.some(o => o.priceOptions.length > 0);
    } else if (lessonType === "1-n-oneday") {
      const { availableTimeList } = oneDayStore;
      return availableTimeList.length > 0;
    } else if (lessonType === "1-n-study") {
      const { price, seats, availableTimeList } = studyStore;
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

                {/* 카테고리 (Category) */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag className="size-4" />
                    카테고리
                  </Label>
                  <Select
                    value={categoryId.toString()}
                    onValueChange={(val) => setCategoryId(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              setServiceType={setLessonType}
            />

            {/* 1:1 멘토링 */}
            {lessonType === "1-1-mentoring" && (
              <MentoringSection />
            )}

            {/* 1:N 원데이 */}
            {lessonType === "1-n-oneday" && (
              <OneDayClassSection />
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
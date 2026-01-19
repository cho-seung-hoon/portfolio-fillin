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
  Tag,
  Image,
  Upload
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
import { lessonService } from "../../api/lesson"; // Import lessonService
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
    categoryId, setCategoryId,
    thumbnailImage, thumbnailPreview, setThumbnail, // Added Image state
    reset: resetLessonForm
  } = useLessonFormStore();

  // --- Specific Stores ---
  const { mentoringOptions, availableTimeList: mentoringTimeList, reset: resetMentoring } = useMentoringRegistrationStore();
  const { availableTimeList: oneDayTimeList, reset: resetOneDay } = useOneDayRegistrationStore();
  const { price, seats, availableTimeList: studyTimeList, reset: resetStudy } = useStudyRegistrationStore();

  // Reset stores on mount (Cleanup previous state)
  /* 
   * [Policy Change: Session Persist]
   * Do NOT reset on mount. Keep data (Zustand state) alive when navigating back/forward.
   * Reset will only happen on explicit "Submit Success" or explicit "Cancel/Discard".
   */

  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

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

  // Helper to reset all stores
  const resetAllStores = () => {
    resetLessonForm();
    resetMentoring();
    resetOneDay();
    resetStudy();
  };

  const handleCancel = () => {
    // Explicit Cancel triggers data discard
    if (window.confirm("작성 중인 내용이 삭제됩니다. 정말 취소하시겠습니까?")) {
      resetAllStores();
      onBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnailImage) {
      alert("썸네일 이미지를 등록해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map UI Type to API Enum
      const lessonTypeMap: Record<string, "MENTORING" | "ONEDAY" | "STUDY"> = {
        "1-1-mentoring": "MENTORING",
        "1-n-oneday": "ONEDAY",
        "1-n-study": "STUDY"
      };

      const apiLessonType = lessonTypeMap[lessonType] || "MENTORING";

      // Base DTO
      const requestDTO: any = {
        title,
        lessonType: apiLessonType,
        description,
        location,
        categoryId,
        closeAt: closeAt || null,
        price: 0,
        seats: 0,
        optionList: [],
        availableTimeList: []
      };

      if (lessonType === "1-1-mentoring") {
        // Internal Store Struct: { startTime, endTime, price, seats }

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

        // Schedules (Mentoring usually has seats=1 per slot)
        requestDTO.availableTimeList = mentoringTimeList.map(t => ({
          startTime: t.startTime,
          endTime: t.endTime,
          price: t.price,
          seats: 1 // Explicitly set seats to 1 for Mentoring
        }));

      } else if (lessonType === "1-n-oneday") {
        // Internal Store Struct: { startTime, endTime, price, seats }
        // OneDay: store already has ISO times, price, seats.
        // Ensure mapping is correct just in case
        requestDTO.availableTimeList = oneDayTimeList.map(t => ({
          startTime: t.startTime,
          endTime: t.endTime,
          price: t.price,
          seats: t.seats || 1 // Use store seats or default
        }));

      } else if (lessonType === "1-n-study") {
        requestDTO.price = price;
        requestDTO.seats = seats;
        // Study availableTimeList might need checking if it has seats. 
        // Usually Study has top-level seats (capacity). The sessions (AvailableTime) might not need seats or set to 0/1.
        // Let's assume Study sessions don't have individual capacity limits beyond the group limit, or we pass existing structure.
        requestDTO.availableTimeList = studyTimeList.map(t => ({
          startTime: t.startTime,
          endTime: t.endTime,
          price: 0, // Study usually has top-level price
          seats: 0  // Study usually has top-level seats
        }));
      }

      console.log("RegisterLessonRequest:", requestDTO);

      // Call API
      await lessonService.createLesson(requestDTO, thumbnailImage);

      alert("서비스가 성공적으로 등록되었습니다.");

      // Success: Clear data and navigate back
      //resetAllStores();
      //onBack();

    } catch (error) {
      console.error("Failed to create lesson:", error);
      alert("서비스 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!title || !description || !lessonType || !categoryId) return false;

    if (lessonType === "1-1-mentoring") {
      // Use destructured mentoringOptions
      return mentoringOptions.length > 0 && mentoringOptions.some(o => o.priceOptions.length > 0);
    } else if (lessonType === "1-n-oneday") {
      // Use destructured oneDayTimeList
      return oneDayTimeList.length > 0;
    } else if (lessonType === "1-n-study") {
      // Use destructured study store values
      return price > 0 && seats > 0 && studyTimeList.length > 0;
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

                {/* 썸네일 이미지 (Thumbnail) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="size-4" />
                    썸네일 이미지
                  </Label>
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-40 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${thumbnailPreview ? 'border-transparent' : 'border-gray-300'}`}
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    >
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Upload className="size-6 mx-auto mb-1" />
                          <span className="text-xs">이미지 업로드</span>
                        </div>
                      )}
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>서비스를 대표하는 이미지를 올려주세요.</p>
                      <p className="text-xs mt-1 text-gray-400">권장 사이즈: 1200x630px (JPG, PNG)</p>
                    </div>
                  </div>
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
                disabled={!isFormValid() || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  "등록 중..."
                ) : (
                  <>
                    <Save className="size-4" />
                    서비스 등록
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
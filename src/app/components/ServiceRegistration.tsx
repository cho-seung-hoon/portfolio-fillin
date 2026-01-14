
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

import { ServiceTypeSelectionSection } from "./service-registration/ServiceTypeSelectionSection";
import { OneDayClassSection, OneDayClassData } from "./service-registration/OneDayClassSection";
import { StudySessionSection } from "./service-registration/StudySessionSection";
import { MentoringSection, MentoringData } from "./service-registration/MentoringSection";
import { useServiceRegistrationStore } from "../../store/useServiceRegistrationStore";

interface ServiceRegistrationProps {
  onBack: () => void;
}

export function ServiceRegistration({
  onBack,
}: ServiceRegistrationProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [serviceType, setServiceType] = useState("");

  // State for Mentoring
  const [mentoringData, setMentoringData] = useState<MentoringData>({
    options: [],
    schedules: {}
  });

  // State for OneDay Class 
  const [oneDayClassData, setOneDayClassData] = useState<OneDayClassData>({ sessions: [] });

  // Store for Study
  const { studyPrice, studySeats, studySessions } = useServiceRegistrationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceType === "1-1-mentoring") {
      console.log({ title, content, serviceType, ...mentoringData });
    } else if (serviceType === "1-n-oneday") {
      console.log({ title, content, serviceType, ...oneDayClassData });
    } else if (serviceType === "1-n-study") {
      console.log({
        title,
        content,
        serviceType,
        price: studyPrice,
        seats: studySeats,
        sessions: studySessions
      });
    }
    alert("서비스가 등록되었습니다!");
    onBack();
  };

  const isFormValid = () => {
    if (!title || !content || !serviceType) return false;

    if (serviceType === "1-1-mentoring") {
      return mentoringData.options.every(
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
      return studyPrice > 0 && studySeats > 0 && studySessions.length > 0;
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

            {/* 1:1 멘토링 (옵션 + 스케줄) */}
            {serviceType === "1-1-mentoring" && (
              <MentoringSection onChange={setMentoringData} />
            )}

            {/* 원데이 클래스 일정 설정 - 1:N 원데이일 때만 표시 (세션별 가격/인원) */}
            {serviceType === "1-n-oneday" && (
              <OneDayClassSection onChange={setOneDayClassData} />
            )}

            {/* 스터디 일정 설정 - 1:N 스터디일 때만 표시 (전체 가격/인원) */}
            {serviceType === "1-n-study" && (
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
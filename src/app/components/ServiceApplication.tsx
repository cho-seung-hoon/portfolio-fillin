import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ChevronLeft,
  Award,
} from "lucide-react";
import { serviceDetailService } from "../../api/serviceDetail";
import { StudyApplicationView } from "./service-application/StudyApplicationView";
import { OneDayClassApplicationView } from "./service-application/OneDayClassApplicationView";
import { MentoringApplicationView } from "./service-application/MentoringApplicationView";
import { ServiceApplicationUiModel } from "../../types/service-application-ui";

interface ServiceApplicationProps {
  serviceId: string;
  onBack: () => void;
}

export function ServiceApplication({ serviceId, onBack }: ServiceApplicationProps) {
  const [service, setService] = useState<ServiceApplicationUiModel | null>(null);
  const [loading, setLoading] = useState(true);

  // 1:1 Mentoring State
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        // const data = await serviceDetailService.getServiceDetail(serviceId);
        // setService(data);
        // if (data && data.options && data.options.length > 0) {
        //   setSelectedOptionId(data.options[0].id); // Default to first option
        // }
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
              <div className="flex gap-1">
                <button
                  className="px-6 py-3 font-medium transition-colors relative text-[#00C471]"
                >
                  {service.serviceType === "mentoring" && "1:1 멘토링"}
                  {service.serviceType === "oneday" && "1:N 원데이"}
                  {service.serviceType === "study" && "1:N 스터디"}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                </button>
              </div>
            </div>

            {/* 일정 선택 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">일정 선택</h2>

                {service.serviceType === "mentoring" && (
                  <MentoringApplicationView
                    service={service}
                    selectedOptionId={selectedOptionId}
                    onSelectOptionId={setSelectedOptionId}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
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
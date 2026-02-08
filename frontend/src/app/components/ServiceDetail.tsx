import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ServiceDetailSkeleton } from "./ServiceDetailSkeleton";
import { Card, CardContent } from "./ui/card";
import { MentoringScheduleView } from "./service-detail/MentoringScheduleView";
import { OneDayClassScheduleView } from "./service-detail/OneDayClassScheduleView";
import { StudyScheduleView } from "./service-detail/StudyScheduleView";
import { ServiceReviews } from "./service-detail/ServiceReviews";
import {
  Star,
  Users,
  ChevronLeft,
  Award,
} from "lucide-react";
import { serviceDetailService } from "../../api/serviceDetail";
import { LessonDetail } from "../../types/lesson";
import { getImageUrl } from "../../utils/image";

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onNavigateToApplication: () => void;
}

export function ServiceDetail({ serviceId, onBack, onNavigateToApplication }: ServiceDetailProps) {
  const [activeTab, setActiveTab] = useState<"description" | "schedule">("description");
  const [service, setService] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formatNumber = (value?: number | null) => Number(value ?? 0).toLocaleString();

  useEffect(() => {
    const fetchService = async () => {
      setIsLoading(true);
      try {
        const data = await serviceDetailService.getServiceDetail(serviceId);
        setService(data);
      } catch (error) {
        console.error("Failed to fetch service detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  // Inside component
  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service not found</div>;
  }




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
          {/* 메인 컨텐츠 영역 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 상단: 멘토 프로필 & 서비스 정보 */}
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-100">
                  <img
                    src={
                      getImageUrl(service.thumbnail.includes("picsum.photos")
                        ? `${service.thumbnail}${service.thumbnail.includes("?") ? "&" : "?"}random=${service.id}`
                        : service.thumbnail)
                    }
                    alt={service.title}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={getImageUrl(service.mentor.avatar)}
                      alt={service.mentor.name}
                      className="size-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{service.mentor.name}</h2>
                        <Award className="size-5 text-[#00C471]" />
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{service.mentor.introduction}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h1 className="text-2xl font-bold mb-3">{service.title}</h1>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.rating ? service.rating.toFixed(1) : "신규"}</span>
                        <span className="text-gray-500">({service.reviewCount}개 리뷰)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="size-4" />
                        <span>{formatNumber(service.studentCount)}명 수강</span>
                      </div>
                      <div className="px-3 py-1 bg-[#E6F9F2] text-[#00C471] rounded-full text-xs font-medium">
                        {service.serviceType}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 중반: 탭 메뉴 (서비스 설명 / 일정) */}
            <Card>
              <CardContent className="p-0">
                {/* 탭 헤더 */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "description"
                        ? "text-[#00C471] border-b-2 border-[#00C471]"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      서비스 설명
                    </button>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "schedule"
                        ? "text-[#00C471] border-b-2 border-[#00C471]"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      일정
                    </button>
                  </div>
                </div>

                {/* 탭 컨텐츠 */}
                <div className="p-6">
                  {activeTab === "description" ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: service.description.replace(/\n/g, '<br/>').replace(/<strong>/g, '<strong class="text-gray-900">')
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      {/* 일정 타입 표시 (수정 불가, 서비스 타입에 따라 자동 감지) */}
                      <div className="flex gap-2 border-b border-gray-200 pb-2 mb-6">
                        <div className="px-4 py-2 rounded-t-lg font-medium text-sm bg-[#E6F9F2] text-[#00C471]">
                          {service.serviceType === "mentoring" && "1:1 멘토링"}
                          {service.serviceType === "oneday" && "1:N 원데이"}
                          {service.serviceType === "study" && "1:N 스터디"}
                        </div>
                      </div>

                      {/* 1:1 멘토링 타입 */}
                      {service.serviceType === "mentoring" && (
                        <MentoringScheduleView service={service} />
                      )}

                      {/* 1:N 원데이 타입 */}
                      {service.serviceType === "oneday" && (
                        <OneDayClassScheduleView service={service} />
                      )}

                      {/* 1:N 스터디 타입 */}
                      {service.serviceType === "study" && (
                        <StudyScheduleView service={service} />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 하단: 리뷰 섹션 */}
            <ServiceReviews service={service} />
          </div>

          {/* 우측 사이드바: 신청 버튼 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      {service.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₩{formatNumber(service.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {(service.serviceType === 'oneday' || service.serviceType === 'mentoring') && <span className="text-lg text-gray-500 font-medium mr-1">최저</span>}
                        ₩{formatNumber(service.price)}
                      </span>
                      {service.originalPrice && (
                        <span className="text-sm font-medium text-red-500">
                          {Math.round((1 - service.price / service.originalPrice) * 100)}% 할인
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={onNavigateToApplication}
                    className="w-full bg-[#00C471] hover:bg-[#00B366] text-white py-6 text-lg font-medium"
                  >
                    서비스 신청하기
                  </Button>

                  <div className="mt-6 space-y-3 text-sm">

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="size-4" />
                      <span>현재 {formatNumber(service.studentCount)}명 수강 중</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star className="size-4" />
                      <span>만족도 {service.rating ? `${service.rating.toFixed(1)}/5.0` : "신규"}</span>
                    </div>
                  </div>


                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
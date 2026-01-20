import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  ChevronLeft,
  Award,
} from "lucide-react";
import { StudyApplicationView } from "./lesson-application/StudyApplicationView";
import { OneDayClassApplicationView } from "./lesson-application/OneDayClassApplicationView";
import { MentoringApplicationView } from "./lesson-application/MentoringApplicationView";
import { LessonApplicationUiModel } from "../../types/lesson-application-ui";
import { mapApiToLesson } from "../../utils/lesson-application-mapper";
import { getImageUrl } from "../../utils/image";

import { applicationService, ScheduleCreateRequest } from "../../api/lesson-application-service";
import { LessonApplicationSkeleton } from "./LessonApplicationSkeleton";
import { OrderConfirmDialog } from "./OrderConfirmDialog";
import { PaymentDialog } from "./PaymentDialog";
import client from "../../api/client";
import { useAuthStore } from "../../stores/authStore";

interface LessonApplicationProps {
  lessonId: string;
  onBack: () => void;
}

export function LessonApplication({ lessonId, onBack }: LessonApplicationProps) {

  const [lesson, setLesson] = useState<LessonApplicationUiModel | null>(null);
  const [loading, setLoading] = useState(true);

  // 1:1 Mentoring State
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [message, setMessage] = useState("");

  // Payment & Order States
  const [isOrderConfirmDialogOpen, setIsOrderConfirmDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [scheduleId, setScheduleId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentOrderName, setPaymentOrderName] = useState<string>("");
  const [paymentOrderId, setPaymentOrderId] = useState<string>("");

  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await applicationService.getLessonApplicationData(lessonId);
        if (!data) return;

        const uiData = mapApiToLesson(data);
        setLesson(uiData);
        if (uiData && uiData.options && uiData.options.length > 0) {
          setSelectedOptionId(uiData.options[0].optionId); // Default to first option
        }
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading || !lesson) {
    return <LessonApplicationSkeleton onBack={onBack} />;
  }

  const selectedOption = lesson.options?.find(opt => opt.optionId === selectedOptionId);

  const handlePayment = async () => {
    if (!lesson) return;

    // Validation
    if (lesson.lessonType === "mentoring") {
      if (!selectedOption) {
        alert("레슨 옵션을 선택해주세요.");
        return;
      }
      if (!selectedSlot) {
        alert("일정을 선택해주세요.");
        return;
      }
    } else if (lesson.lessonType === "oneday") {
      if (!selectedSlot) {
        alert("일정을 선택해주세요.");
        return;
      }
    }

    // Construct Payload
    const request: ScheduleCreateRequest = {
      lessonId: lessonId,
      optionId: null,
      availableTimeId: null,
      startTime: null,
      message: message,
    };

    if (lesson.lessonType === "mentoring") {
      request.optionId = selectedOptionId;
      request.availableTimeId = selectedSlot.availableTimeId;
      request.startTime = selectedSlot.startTime;
    } else if (lesson.lessonType === "oneday") {
      request.availableTimeId = selectedSlot.availableTimeId;
    } else if (lesson.lessonType === "study") {
      // Study usually applies to the whole course
    }

    // Call API
    const responseScheduleId = await applicationService.createSchedule(request);
    if (responseScheduleId) {
      setScheduleId(responseScheduleId);
      setIsOrderConfirmDialogOpen(true);
    } else {
      alert("신청에 실패했습니다.");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await client.post("/v1/payments/checkout", {
        scheduleId: scheduleId
      });

      if (response.data.status === 200) {
        setPaymentAmount(response.data.data.amount);
        setPaymentOrderName(response.data.data.orderName);
        setPaymentOrderId(response.data.data.orderId);
        setIsOrderConfirmDialogOpen(false);
        setIsPaymentDialogOpen(true);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("결제 정보를 불러오는 데 실패했습니다.");
    }
  };

  // 가격 표시 로직
  const getDisplayPrice = () => {
    if (lesson.lessonType === "oneday") {
      return selectedSlot ? selectedSlot.price : 0;
    }
    if (lesson.lessonType === "study") {
      return lesson.schedules["1-n-study"]?.price || 0;
    }
    return selectedOption ? selectedOption.price : 0;
  };

  const displayPrice = getDisplayPrice();
  const formatPrice = (value?: number | null) => Number(value ?? 0).toLocaleString();


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
            {/* 레슨 정보 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">레슨 정보</h2>
                <div className="flex items-start gap-4">
                  <img
                    src={getImageUrl(lesson.mentor.profileImage)}
                    alt={lesson.mentor.nickname}
                    className="size-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{lesson.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="size-4 text-[#00C471]" />
                      <span>{lesson.mentor.nickname}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 일정 선택 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">일정 선택</h2>

                {lesson.lessonType === "mentoring" && (
                  <MentoringApplicationView
                    lesson={lesson}
                    selectedOptionId={selectedOptionId}
                    onSelectOptionId={setSelectedOptionId}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                )}

                {lesson.lessonType === "oneday" && (
                  <OneDayClassApplicationView
                    lesson={lesson}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                )}

                {lesson.lessonType === "study" && (
                  <StudyApplicationView lesson={lesson} />
                )}
              </CardContent>
            </Card>

            {/* 요청사항 - Always show once a base selection is made (or always for study) */}
            {(lesson.lessonType === "study" || selectedOption || (lesson.lessonType === "oneday" && selectedSlot)) && (
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
                      <span className="text-gray-600">레슨 금액</span>
                      <span className="font-medium">
                        ₩{formatPrice(displayPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">총 결제 금액</span>
                      <span className="text-xl font-bold text-[#00C471]">
                        ₩{formatPrice(displayPrice)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-bold bg-[#00C471] hover:bg-[#00B066]"
                    disabled={
                      (lesson.lessonType === "mentoring" && (!selectedOption || !selectedSlot)) ||
                      (lesson.lessonType === "oneday" && !selectedSlot) ||
                      (lesson.lessonType === "study" && false) // Study is usually ready if loaded
                    }
                    onClick={handlePayment}
                  >
                    신청하기
                  </Button>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-500 text-center">
                결제 시 레슨 이용 약관에 동의하게 됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderConfirmDialog
        open={isOrderConfirmDialogOpen}
        onOpenChange={setIsOrderConfirmDialogOpen}
        onConfirm={handleConfirmOrder}
        service={{
          ...lesson,
          serviceType: lesson.lessonType,
          thumbnail: lesson.thumbnailImage,
        }}
        selectedOption={selectedOption}
        selectedSlot={lesson.lessonType === 'mentoring' ? selectedSlot?.time : selectedSlot}
        selectedDate={lesson.lessonType === 'mentoring' ? (selectedSlot ? new Date(selectedSlot.startTime) : null) : null}
        totalPrice={displayPrice}
      />

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        price={paymentAmount}
        orderName={paymentOrderName}
        orderId={paymentOrderId}
        customerName={user?.name || "사용자"}
        customerEmail={user?.email || ""}
      />
    </div>
  );
}
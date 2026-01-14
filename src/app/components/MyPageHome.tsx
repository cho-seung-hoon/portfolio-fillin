import { Sparkles, Calendar, ChevronRight, Clock, User, MessageSquare, MapPin, FileText, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MyPageCalendar } from "./MyPageCalendar";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { reviewService } from "../../api/review";
import { useEffect } from "react";

interface MyPageHomeProps {
  userName: string;
  onTabChange?: (tab: string) => void;
}

interface ScheduleDetail {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  mentee?: string;
  mentor?: string;
  participants?: number;
  requestContent: string;
  description: string;
  location: string;
  category: string;
  duration: number;
  status: "대기" | "확정" | "취소" | "완료";
}

const statusColors = {
  대기: "bg-yellow-50 text-yellow-700 border-yellow-200",
  확정: "bg-blue-50 text-blue-700 border-blue-200",
  취소: "bg-red-50 text-red-700 border-red-200",
  완료: "bg-[#E6F9F2] text-[#00C471] border-[#00C471]/20",
};

// Mock detailed data
const mockDetailedSchedules: { [key: number]: ScheduleDetail } = {
  1: {
    id: 1,
    title: "React 심화 과정 1:1 멘토링",
    date: "2024.01.15",
    time: "14:00",
    endTime: "15:00",
    type: "1:1 멘토링",
    mentee: "김멘티",
    requestContent: "React Hooks에 대해 깊이 있게 배우고 싶습니다. 특히 useEffect와 커스텀 훅 작성에 대해 질문이 있습니다.",
    description: "React의 핵심 개념부터 고급 패턴까지 체계적으로 학습하는 심화 과정입니다.",
    location: "온라인 (Zoom)",
    category: "프론트엔드",
    duration: 60,
    status: "확정",
  },
  2: {
    id: 2,
    title: "프론트엔드 원데이 클래스",
    date: "2024.01.18",
    time: "10:00",
    endTime: "12:00",
    type: "원데이",
    participants: 12,
    requestContent: "실무에서 바로 사용할 수 있는 프론트엔드 개발 스킬을 배우고 싶습니다.",
    description: "최신 프론트엔드 기술 스택을 활용한 실전 프로젝트 구축 원데이 클래스입니다.",
    location: "온라인 (Google Meet)",
    category: "프론트엔드",
    duration: 120,
    status: "확정",
  },
  3: {
    id: 3,
    title: "TypeScript 스터디",
    date: "2024.01.20",
    time: "19:00",
    endTime: "21:00",
    type: "스터디",
    participants: 8,
    requestContent: "TypeScript의 고급 타입 시스템과 제네릭에 대해 학습하고 싶습니다.",
    description: "TypeScript의 타입 시스템을 깊이 있게 다루는 스터디 세션입니다.",
    location: "온라인 (Discord)",
    category: "프론트엔드",
    duration: 120,
    status: "대기",
  },
  // 승인 대기 신청 (mentorConfirmations)
  101: {
    id: 101,
    title: "React 심화 과정",
    date: "2024.01.20",
    time: "14:00",
    endTime: "15:00",
    type: "1:1 멘토링",
    mentee: "김멘티",
    requestContent: "React의 고급 개념과 최적화 기법을 배우고 싶습니다.",
    description: "React의 핵심 개념부터 고급 패턴까지 체계적으로 학습하는 심화 과정입니다.",
    location: "온라인 (Zoom)",
    category: "프론트엔드",
    duration: 60,
    status: "대기",
  },
  102: {
    id: 102,
    title: "Next.js 프로젝트 리뷰",
    date: "2024.01.22",
    time: "10:00",
    endTime: "11:30",
    type: "1:1 멘토링",
    mentee: "이학생",
    requestContent: "Next.js 프로젝트 구조와 최적화 방법에 대해 리뷰받고 싶습니다.",
    description: "Next.js 실전 프로젝트에 대한 상세한 코드 리뷰와 피드백을 제공합니다.",
    location: "온라인 (Zoom)",
    category: "프론트엔드",
    duration: 90,
    status: "대기",
  },
  103: {
    id: 103,
    title: "프론트엔드 원데이",
    date: "2024.01.25",
    time: "15:00",
    endTime: "17:00",
    type: "원데이",
    participants: 1,
    mentee: "박개발",
    requestContent: "최신 프론트엔드 트렌드와 실무 스킬을 배우고 싶습니다.",
    description: "최신 프론트엔드 기술 스택을 활용한 실전 프로젝트 구축 원데이 클래스입니다.",
    location: "온라인 (Google Meet)",
    category: "프론트엔드",
    duration: 120,
    status: "대기",
  },
  // 멘토 승인 대기 (menteeConfirmations)
  201: {
    id: 201,
    title: "React 고급 테크닉",
    date: "2024.01.18",
    time: "14:00",
    endTime: "15:00",
    type: "1:1 멘토링",
    mentor: "박멘토",
    requestContent: "React의 고급 패턴과 성능 최적화에 대해 배우고 싶습니다.",
    description: "React 고급 패턴과 실무 테크닉을 심화 학습하는 멘토링입니다.",
    location: "온라인 (Zoom)",
    category: "프론트엔드",
    duration: 60,
    status: "대기",
  },
  202: {
    id: 202,
    title: "TypeScript 마스터클래스",
    date: "2024.01.21",
    time: "10:00",
    endTime: "12:00",
    type: "원데이",
    mentor: "최강사",
    requestContent: "TypeScript 고급 타입 시스템과 실전 활용법을 배우고 싶습니다.",
    description: "TypeScript의 고급 타입 시스템을 마스터하는 심화 과정입니다.",
    location: "온라인 (Google Meet)",
    category: "프론트엔드",
    duration: 120,
    status: "대기",
  },
};

export function MyPageHome({ userName, onTabChange }: MyPageHomeProps) {
  const [approvalTab, setApprovalTab] = useState<"received" | "sent">("received");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [unwrittenReviewCount, setUnwrittenReviewCount] = useState(0);

  useEffect(() => {
    const fetchUnwrittenReviewCount = async () => {
      try {
        const response = await reviewService.getUnwrittenReviews(0, 1);
        setUnwrittenReviewCount(response.totalElements);
      } catch (error) {
        console.error("Failed to fetch unwritten review count:", error);
      }
    };
    fetchUnwrittenReviewCount();
  }, []);

  const handleScheduleClick = (scheduleId: number) => {
    const detail = mockDetailedSchedules[scheduleId];
    if (detail) {
      setSelectedSchedule(detail);
      setIsDetailModalOpen(true);
    }
  };

  const handleStatusChange = (newStatus: "대기" | "확정" | "취소" | "완료") => {
    if (selectedSchedule) {
      // TODO: API 호출하여 상태 업데이트
      console.log("상태 변경:", {
        scheduleId: selectedSchedule.id,
        oldStatus: selectedSchedule.status,
        newStatus: newStatus,
      });

      // Update local state
      setSelectedSchedule({
        ...selectedSchedule,
        status: newStatus,
      });

      alert(`상태가 "${newStatus}"로 변경되었습니다.`);
    }
  };

  // Mock data
  const mockData = {
    stats: {
      upcomingSchedules: 5,
      mentorApprovals: 2,
      receivedRequests: 3,
    },
    upcomingSchedules: [
      {
        id: 1,
        title: "React 심화 과정 1:1 멘토링",
        date: "2024.01.15",
        time: "14:00",
        type: "1:1 멘토링",
        mentee: "김멘티",
      },
      {
        id: 2,
        title: "프론트엔드 원데이 클래스",
        date: "2024.01.18",
        time: "10:00",
        type: "원데이",
        participants: 12,
      },
      {
        id: 3,
        title: "TypeScript 스터디",
        date: "2024.01.20",
        time: "19:00",
        type: "스터디",
        participants: 8,
      },
      {
        id: 4,
        title: "Next.js 1:1 토링",
        date: "2024.01.22",
        time: "16:00",
        type: "1:1 멘토링",
        mentee: "이학생",
      },
      {
        id: 5,
        title: "웹 개발 원데이",
        date: "2024.01.25",
        time: "13:00",
        type: "원데이",
        participants: 15,
      },
    ],
    mentorConfirmations: [
      {
        id: 101,
        service: "React 심화 과정",
        name: "김멘티",
        type: "1:1 멘토링",
        requestedDate: "2024.01.20",
        requestedTime: "14:00",
      },
      {
        id: 102,
        service: "Next.js 프로젝트 리뷰",
        name: "이학생",
        type: "1:1 멘토링",
        requestedDate: "2024.01.22",
        requestedTime: "10:00",
      },
      {
        id: 103,
        service: "프론트엔드 원데이",
        name: "박개발",
        type: "원데이",
        requestedDate: "2024.01.25",
        requestedTime: "15:00",
      },
    ],
    menteeConfirmations: [
      {
        id: 201,
        service: "React 고급 테크닉",
        mentor: "박멘토",
        type: "1:1 멘토링",
        requestedDate: "2024.01.18",
        requestedTime: "14:00",
      },
      {
        id: 202,
        service: "TypeScript 마스터클래스",
        mentor: "최강사",
        type: "원데이",
        requestedDate: "2024.01.21",
        requestedTime: "10:00",
      },
    ],
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Message */}
          <h1 className="text-3xl">
            <span className="font-bold">{userName}</span>님 안녕하세요!
          </h1>

          {/* 작성가능한 리뷰 */}
          <Card
            className="border bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onTabChange?.("reviews")}
          >
            <CardContent className="py-2.5 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="size-4 text-orange-600" />
                  <span className="text-sm text-orange-700">작성가능한 리뷰</span>
                </div>
                <div className="text-lg text-orange-900">{unwrittenReviewCount} 건</div>
              </div>
            </CardContent>
          </Card>

          {/* 예정 스케줄 */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>예정 스케줄</CardTitle>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">
                    {mockData.stats.upcomingSchedules} 건
                  </span>
                </div>
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  스케줄 관리
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {mockData.upcomingSchedules.length > 0 ? (
                <div className="space-y-2">
                  {mockData.upcomingSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => handleScheduleClick(schedule.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <Calendar className="size-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-0.5">{schedule.title}</div>
                          <div className="text-xs text-gray-600 mb-1.5">
                            {schedule.date} · {schedule.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {schedule.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {schedule.participants ? `${schedule.participants}명 참여` : `멘티: ${schedule.mentee}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-400">
                  예정된 스케줄이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 승인 대기 - Tabs for Received/Sent */}
          <Card>
            <CardHeader className="pb-3">
              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-gray-200">
                <button
                  onClick={() => setApprovalTab("received")}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${approvalTab === "received"
                    ? "text-[#00C471]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  승인 대기 신청 ({mockData.stats.receivedRequests})
                  {approvalTab === "received" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
                  )}
                </button>
                <button
                  onClick={() => setApprovalTab("sent")}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${approvalTab === "sent"
                    ? "text-[#00C471]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  멘토 승인 대기 ({mockData.stats.mentorApprovals})
                  {approvalTab === "sent" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {approvalTab === "received" ? (
                // Mentor View: 본인이 승인해야 할 신청
                <>
                  {mockData.mentorConfirmations.length > 0 ? (
                    <div className="space-y-2">
                      {mockData.mentorConfirmations.map((confirmation) => (
                        <div
                          key={confirmation.id}
                          className="p-3 border border-gray-200 rounded-lg hover:border-[#00C471] transition-colors cursor-pointer"
                          onClick={() => handleScheduleClick(confirmation.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <User className="size-4 text-[#00C471]" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-0.5">{confirmation.service}</div>
                              <div className="text-xs text-gray-600 mb-1.5">
                                신청자: {confirmation.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#00C471]/20 text-[#00C471] rounded text-xs">
                                  {confirmation.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {confirmation.requestedDate} · {confirmation.requestedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-400">
                      승인 대기 신청이 없습니다.
                    </div>
                  )}
                </>
              ) : (
                // Mentee View: 멘토에게 승인받아야 할 요청
                <>
                  {mockData.menteeConfirmations.length > 0 ? (
                    <div className="space-y-2">
                      {mockData.menteeConfirmations.map((confirmation) => (
                        <div
                          key={confirmation.id}
                          className="p-3 border border-gray-200 rounded-lg hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => handleScheduleClick(confirmation.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <User className="size-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-0.5">{confirmation.service}</div>
                              <div className="text-xs text-gray-600 mb-1.5">
                                멘토: {confirmation.mentor}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                  {confirmation.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {confirmation.requestedDate} · {confirmation.requestedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-400">
                      멘토 승인 대기 목록이 없습니다.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-1">
          <MyPageCalendar />
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSchedule?.title}</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              상세한 스케줄 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-6 p-6">
              {/* 예약 정보 섹션 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">예약 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="size-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">일시</div>
                      <div className="text-sm font-medium">
                        {selectedSchedule.date} {selectedSchedule.time} - {selectedSchedule.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">
                        {selectedSchedule.mentee ? "멘티" : selectedSchedule.mentor ? "멘토" : "참여자"}
                      </div>
                      <div className="text-sm font-medium">
                        {selectedSchedule.mentee || selectedSchedule.mentor ||
                          (selectedSchedule.participants ? `${selectedSchedule.participants}명` : "-")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">요청사항</div>
                      <div className="text-sm font-medium">
                        {selectedSchedule.requestContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 레슨 정보 섹션 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">레슨 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Tag className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">레슨 유형</div>
                      <div className="text-sm font-medium">{selectedSchedule.type}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">레슨 설명</div>
                      <div className="text-sm font-medium">
                        {selectedSchedule.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">레슨 장소</div>
                      <div className="text-sm font-medium">{selectedSchedule.location}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Tag className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">카테고리</div>
                      <div className="text-sm font-medium">{selectedSchedule.category}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">진행 시간</div>
                      <div className="text-sm font-medium">{selectedSchedule.duration}분</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  {selectedSchedule.status === "대기" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleStatusChange("확정")}
                      >
                        확정
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleStatusChange("취소")}
                      >
                        일정 취소
                      </Button>
                    </>
                  )}

                  {selectedSchedule.status === "확정" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleStatusChange("취소")}
                      >
                        일정 취소
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#00C471] text-[#00C471] hover:bg-[#E6F9F2]"
                        onClick={() => handleStatusChange("완료")}
                      >
                        완료
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
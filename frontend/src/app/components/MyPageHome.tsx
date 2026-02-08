import { Sparkles, Calendar, ChevronRight, Clock, User, MessageSquare, MapPin, FileText, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MyPageCalendar } from "./MyPageCalendar";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { reviewService } from "../../api/review";
import { scheduleService } from "../../api/schedule";
import { useEffect } from "react";
import { ScheduleListResponse, ScheduleDetailResponse, ScheduleStatus } from "../../api/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuthStore } from "../../stores/authStore";

interface MyPageHomeProps {
  userName: string;
  onTabChange?: (tab: string) => void;
}

const statusColors: Record<ScheduleStatus, string> = {
  PAYMENT_PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVAL_PENDING: "bg-orange-50 text-orange-700 border-orange-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  CANCELED: "bg-red-50 text-red-700 border-red-200",
  COMPLETED: "bg-[#E6F9F2] text-[#00C471] border-[#00C471]/20",
};

const statusLabels: Record<ScheduleStatus, string> = {
  PAYMENT_PENDING: "결제 대기",
  APPROVAL_PENDING: "승인 대기",
  APPROVED: "승인",
  CANCELED: "취소",
  COMPLETED: "완료",
};

export function MyPageHome({ userName, onTabChange }: MyPageHomeProps) {
  const { user } = useAuthStore();
  const [approvalTab, setApprovalTab] = useState<"received" | "sent">("received");
  const [selectedSchedule, setSelectedSchedule] = useState<(ScheduleListResponse & { role?: "MENTOR" | "MENTEE" }) | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [unwrittenReviewCount, setUnwrittenReviewCount] = useState(0);

  // Data states
  // unified schedule state
  const [allUpcomingSchedules, setAllUpcomingSchedules] = useState<(ScheduleListResponse & { role: "MENTOR" | "MENTEE" })[]>([]);
  const [mentorConfirmations, setMentorConfirmations] = useState<ScheduleListResponse[]>([]);
  const [menteeConfirmations, setMenteeConfirmations] = useState<ScheduleListResponse[]>([]);

  // Pagination
  const [visibleScheduleCount, setVisibleScheduleCount] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unwritten review count
        const reviewsPromise = reviewService.getUnwrittenReviews(0, 1);

        // Fetch upcoming schedules (Consolidated)
        const upcomingSchedulesPromise = scheduleService.getUpcomingSchedules({
          from: new Date().toISOString(),
          status: "APPROVED",
          page: 0,
          size: 40 // Larger size to cover both roles
        });

        // Fetch pending requests (Received: Mentor needs to approve)
        const mentorConfirmationsPromise = scheduleService.searchSchedules({
          participantRole: "MENTOR",
          status: "APPROVAL_PENDING",
          page: 0,
          size: 20
        });

        // Fetch pending requests (Sent: Mentee waiting for approval)
        const menteeConfirmationsPromise = scheduleService.searchSchedules({
          participantRole: "MENTEE",
          status: "APPROVAL_PENDING",
          page: 0,
          size: 20
        });

        const [reviewsRes, upcomingRes, mentorConfRes, menteeConfRes] = await Promise.all([
          reviewsPromise,
          upcomingSchedulesPromise,
          mentorConfirmationsPromise,
          menteeConfirmationsPromise
        ]);

        setUnwrittenReviewCount(reviewsRes.totalElements);

        // Map roles based on user's name
        const combined = upcomingRes.content.map(s => {
          const isMentor = s.mentorNickname === user?.name;
          return {
            ...s,
            role: (isMentor ? "MENTOR" : "MENTEE") as "MENTOR" | "MENTEE"
          };
        }).sort((a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        setAllUpcomingSchedules(combined);
        setMentorConfirmations(mentorConfRes.content);
        setMenteeConfirmations(menteeConfRes.content);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const handleScheduleClick = (schedule: ScheduleListResponse & { role?: "MENTOR" | "MENTEE" }) => {
    setSelectedSchedule(schedule);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (newStatus: ScheduleStatus) => {
    if (!selectedSchedule) return;

    try {
      await scheduleService.updateStatus(selectedSchedule.scheduleId, newStatus);
      setIsDetailModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    return format(new Date(isoString), "yyyy.MM.dd HH:mm", { locale: ko });
  };


  return (
    <div className="p-8">
      {/* ... (Grid content remains same) ... */}
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
                    {allUpcomingSchedules.length} 건
                  </span>
                </div>
                <button
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => onTabChange?.("schedule")}
                >
                  스케줄 관리
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                {allUpcomingSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {allUpcomingSchedules.slice(0, visibleScheduleCount).map((schedule) => {
                      const isMentor = schedule.role === "MENTOR";
                      const themeColor = isMentor ? "blue" : "purple";
                      const borderColor = isMentor ? "border-blue-200 hover:border-blue-400" : "border-purple-200 hover:border-purple-400";

                      return (
                        <div
                          key={`${schedule.role}-${schedule.scheduleTimeId}`}
                          className={`p-4 border rounded-lg transition-all cursor-pointer bg-white hover:shadow-sm ${borderColor}`}
                          onClick={() => handleScheduleClick(schedule)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Date Badge */}
                            <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-lg border ${isMentor ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-purple-50 border-purple-100 text-purple-600"
                              }`}>
                              <span className="text-xs font-semibold">{format(new Date(schedule.startTime), "M월", { locale: ko })}</span>
                              <span className="text-xl font-bold">{format(new Date(schedule.startTime), "d")}</span>
                            </div>

                            <div className="flex-1 space-y-2">
                              {/* Header: Role Badge & Time */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${isMentor
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-purple-100 text-purple-700 border-purple-200"
                                    }`}>
                                    {isMentor ? "멘토링 (진행)" : "멘토링 (수강)"}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {format(new Date(schedule.startTime), "a h:mm", { locale: ko })}
                                    {" - "}
                                    {format(new Date(schedule.endTime), "a h:mm", { locale: ko })}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500`}>
                                  {schedule.optionName}
                                </span>
                              </div>

                              {/* Title */}
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {schedule.lessonTitle.replace(schedule.mentorNickname, "").replace(/\(\s*\)|\[\s*\]/g, "").trim()}
                              </div>

                              {/* Footer: User Info */}
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User className="size-3.5" />
                                <span>
                                  {isMentor ? `멘티: ${schedule.menteeNickname}` : `멘토: ${schedule.mentorNickname}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Load More Button */}
                    {allUpcomingSchedules.length > visibleScheduleCount && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full text-gray-500 hover:text-gray-900"
                          onClick={() => setVisibleScheduleCount(prev => prev + 5)}
                        >
                          더보기 ({allUpcomingSchedules.length - visibleScheduleCount}건 남음)
                        </Button>
                      </div>
                    )}

                    {/* Collapse Button */}
                    {visibleScheduleCount > 5 && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full text-gray-400 hover:text-gray-600"
                          onClick={() => setVisibleScheduleCount(5)}
                        >
                          접기
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-lg text-gray-400">
                    <Calendar className="size-8 mx-auto mb-2 opacity-50" />
                    <p>예정된 스케줄이 없습니다.</p>
                  </div>
                )}
              </div>
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
                  승인 대기 신청 ({mentorConfirmations.length})
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
                  멘토 승인 대기 ({menteeConfirmations.length})
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
                  {mentorConfirmations.length > 0 ? (
                    <div className="space-y-2">
                      {mentorConfirmations.map((confirmation) => (
                        <div
                          key={confirmation.scheduleTimeId}
                          className="p-3 border border-gray-200 rounded-lg hover:border-[#00C471] transition-colors cursor-pointer"
                          onClick={() => handleScheduleClick({ ...confirmation, role: "MENTOR" })}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <User className="size-4 text-[#00C471]" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-0.5">{confirmation.lessonTitle}</div>
                              <div className="text-xs text-gray-600 mb-1.5">
                                신청자: {confirmation.menteeNickname}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#00C471]/20 text-[#00C471] rounded text-xs">
                                  {confirmation.optionName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(confirmation.startTime)}
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
                  {menteeConfirmations.length > 0 ? (
                    <div className="space-y-2">
                      {menteeConfirmations.map((confirmation) => (
                        <div
                          key={confirmation.scheduleTimeId}
                          className="p-3 border border-gray-200 rounded-lg hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => handleScheduleClick({ ...confirmation, role: "MENTEE" })}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <User className="size-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-0.5">{confirmation.lessonTitle}</div>
                              <div className="text-xs text-gray-600 mb-1.5">
                                멘토: {confirmation.mentorNickname}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                  {confirmation.optionName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDateTime(confirmation.startTime)}
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
      <ScheduleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        schedule={selectedSchedule}
        onStatusChange={handleStatusChange}
        isMentor={selectedSchedule?.role === "MENTOR"}
      />
    </div>
  );
}
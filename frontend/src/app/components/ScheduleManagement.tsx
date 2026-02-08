import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

import { scheduleService } from "../../api/schedule";
import {
  ScheduleListResponse,
  ScheduleStatus,
  ScheduleSortType
} from "../../api/types";
import { Skeleton } from "./ui/skeleton";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuthStore } from "../../stores/authStore";

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

const ITEMS_PER_PAGE = 5;

export function ScheduleManagement() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [sortField, setSortField] = useState<"reservationDate" | "className">("reservationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleListResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleListResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // isDetailLoading is handled inside the modal now

  // Temporary filter states (before applying)
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all");

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      let sortType: ScheduleSortType | undefined;

      if (sortField === "reservationDate") {
        sortType = sortOrder === "asc" ? "START_TIME_ASC" : "START_TIME_DESC";
      }

      const condition = {
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        keyword: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter as ScheduleStatus,
        sortType: sortType,
      };

      let response;
      if (activeTab === "upcoming") {
        response = await scheduleService.getUpcomingSchedules({ ...condition, from: now });
      } else {
        response = await scheduleService.getPastSchedules({ ...condition, to: now });
      }

      setSchedules(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [activeTab, currentPage, searchQuery, statusFilter, sortField, sortOrder]);

  const handleTabChange = (tab: "upcoming" | "past") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
    setTempSearchQuery("");
    setTempStatusFilter("all");
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setStatusFilter(tempStatusFilter);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (schedule: ScheduleListResponse) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSort = () => {
    // Currently only supporting sorting by start time via API for now based on DTO
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setSortField("reservationDate");
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    return format(new Date(isoString), "yyyy.MM.dd HH:mm", { locale: ko });
  };

  const totalPages = Math.ceil(totalElements / ITEMS_PER_PAGE);

  return (
    <div className="p-8">
      <h2 className="text-3xl mb-6 font-bold">스케줄 관리</h2>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange("upcoming")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "upcoming"
            ? "text-[#00C471]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          예정
          {activeTab === "upcoming" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("past")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === "past"
            ? "text-[#00C471]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          과거
          {activeTab === "past" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
          )}
        </button>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search by Class Title */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="클래스 제목 검색..."
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  className="pl-9 bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>

              {/* Status Filter */}
              <Select value={tempStatusFilter} onValueChange={setTempStatusFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="진행 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                총 <span className="font-medium text-[#00C471]">{totalElements}</span>건의 스케줄
              </div>
              <Button
                size="sm"
                onClick={applyFilters}
                className="bg-[#00C471] hover:bg-[#00B366]"
              >
                적용
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-16 text-center">순번</TableHead>
                  <TableHead>클래스 제목</TableHead>
                  <TableHead>옵션명</TableHead>
                  <TableHead>멘토 닉네임</TableHead>
                  <TableHead>멘티 닉네임</TableHead>
                  <TableHead>
                    <button
                      onClick={handleSort}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                    >
                      진행일시
                      <ArrowUpDown className="size-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-center">진행상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="p-4">
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : schedules.length > 0 ? (
                  schedules.map((schedule, index) => (
                    <TableRow
                      key={schedule.scheduleTimeId}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(schedule)}
                    >
                      <TableCell className="text-center font-medium text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {schedule.lessonTitle}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge variant="secondary" className="font-normal bg-gray-100 text-gray-600 border-none">
                          {schedule.optionName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{schedule.mentorNickname}</TableCell>
                      <TableCell className="text-gray-700">{schedule.menteeNickname}</TableCell>
                      <TableCell className="text-gray-600">
                        {formatDateTime(schedule.startTime)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`${statusColors[schedule.status]} border px-2.5 py-0.5 rounded-full`}
                        >
                          {statusLabels[schedule.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400">
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {/* Pagination controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`h-8 w-8 p-0 ${currentPage === page ? "bg-[#00C471] hover:bg-[#00B366]" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={selectedSchedule}
        onStatusChange={async (status) => {
          if (!selectedSchedule) return;
          try {
            await scheduleService.updateStatus(selectedSchedule.scheduleId, status);
            setIsModalOpen(false);
            window.location.reload();
          } catch (error) {
            console.error("Status update failed:", error);
            alert("상태 변경에 실패했습니다.");
          }
        }}
        isMentor={user?.name === selectedSchedule?.mentorNickname}
      />
    </div>
  );
}

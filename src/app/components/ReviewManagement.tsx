import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Star, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";



interface WrittenReview {
  id: string;
  classTitle: string;
  optionName: string;
  mentorNickname: string; // Changed from menteeNickname
  reservationDate: string;
  rating: number;
  content: string;
}

import { reviewService } from "../../api/review";
import { SuccessResponse, PageResponse, MyReviewResponseDTO, UnwrittenReviewResponseDTO } from "../../api/types";
import { useEffect } from "react";
import { Pagination } from "./Pagination"; // Assuming Pagination is in the same directory



import { Skeleton } from "./ui/skeleton";
import { formatDateWithLocale, formatDateTimeWithLocale } from "../../utils/date";

export function ReviewManagement() {
  const [activeTab, setActiveTab] = useState<"pending" | "written">("pending");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<UnwrittenReviewResponseDTO | null>(null);
  const [viewingReview, setViewingReview] = useState<WrittenReview | null>(null); // For read-only view
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [writtenReviews, setWrittenReviews] = useState<WrittenReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<UnwrittenReviewResponseDTO[]>([]);

  // Pagination states
  const [pendingPage, setPendingPage] = useState(1);
  const [writtenPage, setWrittenPage] = useState(1);
  const [totalPendingPages, setTotalPendingPages] = useState(1);
  const [totalWrittenPages, setTotalWrittenPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (activeTab === "written") {
      fetchWrittenReviews(writtenPage);
    } else {
      fetchPendingReviews(pendingPage);
    }
  }, [activeTab, writtenPage, pendingPage]);

  const fetchPendingReviews = async (page: number) => {
    setLoading(true);
    try {
      // API expects 0-indexed page
      const pageResponse = await reviewService.getUnwrittenReviews(page - 1, itemsPerPage);
      setPendingReviews(pageResponse.content);
      // Ensure totalPages is at least 1
      setTotalPendingPages(Math.max(1, Math.ceil(pageResponse.totalElements / itemsPerPage)));
    } catch (error) {
      console.error("Failed to fetch pending reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWrittenReviews = async (page: number) => {
    setLoading(true);
    try {
      const pageResponse = await reviewService.getMyReviews(page - 1, itemsPerPage);
      const reviews = pageResponse.content.map(r => ({
        id: r.reviewId,
        classTitle: r.lessonName,
        optionName: r.optionName,
        mentorNickname: r.mentorNickname,
        reservationDate: r.reservationDate,
        rating: r.score,
        content: r.content
      }));
      setWrittenReviews(reviews);
      setTotalWrittenPages(Math.max(1, Math.ceil(pageResponse.totalElements / itemsPerPage)));
    } catch (error) {
      console.error("Failed to fetch written reviews", error);
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the file)


  const handleOpenReviewModal = (review: UnwrittenReviewResponseDTO) => {
    setSelectedReview(review);
    setViewingReview(null);
    setRating(0);
    setHoverRating(0);
    setReviewContent("");
    setIsReviewModalOpen(true);
  };

  const handleOpenViewModal = (review: WrittenReview) => {
    setViewingReview(review);
    setSelectedReview(null);
    setRating(review.rating);
    setReviewContent(review.content);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview) return;
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (!reviewContent.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    try {
      await reviewService.createReview({
        scheduleId: selectedReview.scheduleId,
        score: rating,
        content: reviewContent,
      });

      console.log("Review submitted:", {
        scheduleId: selectedReview.scheduleId,
        rating,
        content: reviewContent,
      });
      setIsReviewModalOpen(false);
      setRating(0);
      setReviewContent("");
      alert("리뷰가 등록되었습니다.");

      // Refresh pending reviews
      fetchPendingReviews(pendingPage);
      // Refresh written reviews if we were on the written tab (though likely we are on pending tab)
      // fetchWrittenReviews(writtenPage); 
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("리뷰 등록에 실패했습니다.");
    }
  };

  const renderStarRating = (currentRating: number) => {
    const fullStars = Math.floor(currentRating);
    const hasHalfStar = currentRating % 1 !== 0;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            // Full star
            return (
              <Star
                key={star}
                className="size-4 fill-yellow-400 text-yellow-400"
              />
            );
          } else if (star === fullStars + 1 && hasHalfStar) {
            // Half star
            return (
              <div key={star} className="relative size-4">
                <Star className="size-4 text-gray-300" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          } else {
            // Empty star
            return <Star key={star} className="size-4 text-gray-300" />;
          }
        })}
        <span className="ml-1 text-sm text-gray-600">({currentRating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl mb-6">리뷰 및 평점</h2>

      <Card>
        <CardHeader>
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "pending"
                ? "text-[#00C471]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              작성가능한 리뷰
              {activeTab === "pending" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("written")}
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "written"
                ? "text-[#00C471]"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              작성한 리뷰
              {activeTab === "written" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "pending" ? (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                총{" "}
                <span className="font-medium text-[#00C471]">
                  {pendingReviews.length}
                </span>
                건의 작성 가능한 리뷰
              </div>
              <div className="border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-20 text-center">순번</TableHead>
                      <TableHead>클래스 제목</TableHead>
                      <TableHead>옵션명</TableHead>
                      <TableHead>멘토 닉네임</TableHead>
                      <TableHead>예약일자</TableHead>
                      <TableHead className="w-32 text-center">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : pendingReviews.length > 0 ? (
                      pendingReviews.map((review, index) => (
                        <TableRow key={review.scheduleId} className="hover:bg-gray-50">
                          <TableCell className="text-center font-medium">
                            {(pendingPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {review.lessonName}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {review.optionName}
                          </TableCell>
                          <TableCell>{review.mentorNickname}</TableCell>
                          <TableCell className="text-gray-600">
                            {formatDateTimeWithLocale(review.reservationDate)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              className="bg-[#00C471] hover:bg-[#00B366]"
                              onClick={() => handleOpenReviewModal(review)}
                            >
                              <Pencil className="size-4 mr-1" />
                              리뷰 작성
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-gray-400"
                        >
                          작성 가능한 리뷰가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={pendingPage}
                  totalPages={totalPendingPages}
                  onPageChange={setPendingPage}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                총{" "}
                <span className="font-medium text-[#00C471]">
                  {writtenReviews.length}
                </span>
                건의 작성한 리뷰
              </div>
              <div className="border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-20 text-center">순번</TableHead>
                      <TableHead>클래스 제목</TableHead>
                      <TableHead>옵션명</TableHead>
                      <TableHead>멘토 닉네임</TableHead>
                      <TableHead>예약일자</TableHead>
                      <TableHead className="w-40">별점</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-written-${index}`}>
                          <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : writtenReviews.length > 0 ? (
                      writtenReviews.map((review, index) => (
                        <TableRow
                          key={review.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOpenViewModal(review)}
                        >
                          <TableCell className="text-center font-medium">
                            {(writtenPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {review.classTitle}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {review.optionName}
                          </TableCell>
                          <TableCell>{review.mentorNickname}</TableCell>
                          <TableCell className="text-gray-600">
                            {formatDateWithLocale(review.reservationDate)}
                          </TableCell>
                          <TableCell>
                            {renderStarRating(review.rating)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-gray-400"
                        >
                          작성한 리뷰가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={writtenPage}
                  totalPages={totalWrittenPages}
                  onPageChange={setWrittenPage}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 리뷰 작성 모달 */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {viewingReview ? "리뷰 상세" : "리뷰 작성"}
            </DialogTitle>
          </DialogHeader>

          {(selectedReview || viewingReview) && (
            <div className="space-y-6">
              {/* 클래스 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedReview ? selectedReview.lessonName : viewingReview?.classTitle}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>옵션: {selectedReview ? selectedReview.optionName : viewingReview?.optionName}</p>
                  <p>멘토: {selectedReview ? selectedReview.mentorNickname : viewingReview?.mentorNickname}</p>
                  <p>수강일: {formatDateTimeWithLocale(selectedReview ? selectedReview.reservationDate : viewingReview?.reservationDate || "")}</p>
                </div>
              </div>

              {/* 별점 선택 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">별점 {viewingReview ? "확인" : "선택"}</span>
                  {rating > 0 && (
                    <span className="text-sm text-gray-600">({rating.toFixed(1)}점)</span>
                  )}
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (hoverRating || rating);

                    return (
                      <button
                        key={star}
                        type="button"
                        className={`relative w-8 h-8 transition-transform hover:scale-110 ${viewingReview ? "cursor-default" : "cursor-pointer"}`}
                        onMouseEnter={() => !viewingReview && setHoverRating(star)}
                        onMouseLeave={() => !viewingReview && setHoverRating(0)}
                        onClick={() => !viewingReview && setRating(star)}
                        disabled={!!viewingReview}
                      >
                        <Star
                          className={`size-8 ${isSelected
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="space-y-3">
                <label className="font-medium block">
                  리뷰 내용
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="멘토링에 대한 솔직한 후기를 남겨주세요. 구체적인 내용일수록 다른 수강생들에게 도움이 됩니다."
                  className="min-h-[150px] resize-none"
                  readOnly={!!viewingReview}
                />
                <div className="text-sm text-gray-500 text-right">
                  {reviewContent.length} / 1000자
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  취소
                </Button>
                {!viewingReview && (
                  <Button
                    className="bg-[#00C471] hover:bg-[#00B366]"
                    onClick={handleSubmitReview}
                  >
                    리뷰 제출
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

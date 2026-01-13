package com.kosa.fillinv.review.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import com.kosa.fillinv.review.dto.LessonReviewListResponseDTO;
import com.kosa.fillinv.review.dto.MyReviewResponseDTO;
import com.kosa.fillinv.review.dto.UnwrittenReviewResponseDTO;
import com.kosa.fillinv.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private static final int MAX_PAGE_SIZE = 100;

    @GetMapping("/lessons/{lessonId}/reviews")
    public SuccessResponse<LessonReviewListResponseDTO> getLessonReviewList(
            @PathVariable("lessonId") String lessonId,
            @PageableDefault(size = 20) Pageable pageable) {
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            pageable = PageRequest.of(pageable.getPageNumber(), MAX_PAGE_SIZE, pageable.getSort());
        }
        LessonReviewListResponseDTO reviewList = reviewService.getReviewListByLesson(lessonId, pageable);
        return SuccessResponse.success(HttpStatus.OK, reviewList);
    }

    @GetMapping("/reviews/me")
    public SuccessResponse<Page<MyReviewResponseDTO>> getMyReviews(
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomMemberDetails userDetails) {
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            pageable = PageRequest.of(pageable.getPageNumber(), MAX_PAGE_SIZE, pageable.getSort());
        }
        String memberId = userDetails.memberId();
        return SuccessResponse.success(HttpStatus.OK, reviewService.getMyReviews(memberId, pageable));
    }

    @GetMapping("/reviews/unwritten")
    public SuccessResponse<Page<UnwrittenReviewResponseDTO>> getUnwrittenReviews(
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal CustomMemberDetails userDetails) {
        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            pageable = PageRequest.of(pageable.getPageNumber(), MAX_PAGE_SIZE, pageable.getSort());
        }
        String memberId = userDetails.memberId();
        return SuccessResponse.success(HttpStatus.OK, reviewService.getUnwrittenReviews(memberId, pageable));
    }
}

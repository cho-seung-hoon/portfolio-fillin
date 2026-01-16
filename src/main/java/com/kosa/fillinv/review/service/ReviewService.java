package com.kosa.fillinv.review.service;

import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.review.dto.*;
import com.kosa.fillinv.review.entity.Review;
import com.kosa.fillinv.review.exception.ReviewException;
import com.kosa.fillinv.review.repository.ReviewRepository;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.exception.ScheduleException;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public LessonReviewListResponseDTO getReviewListByLesson(String lessonId, Pageable pageable) {
        Double averageScore = reviewRepository.findAverageScoreByLessonId(lessonId);
        Page<LessonReviewResponseDTO> reviews = reviewRepository
                .findReviewsWithNicknameByLessonId(lessonId, pageable)
                .map(LessonReviewResponseDTO::from);

        return LessonReviewListResponseDTO.of(averageScore, reviews.getTotalElements(), reviews);
    }

    @Transactional(readOnly = true)
    public Page<MyReviewResponseDTO> getMyReviews(String memberId, Pageable pageable) {
        return reviewRepository.findByWriterId(memberId, pageable)
                .map(MyReviewResponseDTO::from);
    }

    @Transactional(readOnly = true)
    public Page<UnwrittenReviewResponseDTO> getUnwrittenReviews(String memberId, Pageable pageable) {
        return scheduleRepository.findUnwrittenReviews(memberId, pageable)
                .map(UnwrittenReviewResponseDTO::from);
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getAverageScoreByLessonIds(Set<String> lessonIds) {
        List<LessonAvgScore> averageScoresByLessonIds = reviewRepository.findAverageScoreByLessonIds(lessonIds);

        return averageScoresByLessonIds.stream().collect(
                Collectors.toMap(
                        LessonAvgScore::lessonId,
                        LessonAvgScore::averageScore));
    }

    @Transactional
    public ReviewCreateResponseDTO createReview(String memberId, ReviewRequestDTO requestDTO) {
        Schedule schedule = scheduleRepository.findById(requestDTO.scheduleId())
                .orElseThrow(ScheduleException.ScheduleNotFound::new);

        if (schedule.getStatus() != ScheduleStatus.COMPLETED) {
            throw new ReviewException(ErrorCode.REVIEW_NOT_ALLOWED);
        }

        if (!schedule.getMenteeId().equals(memberId)) {
            throw new ReviewException(ErrorCode.ACCESS_DENIED);
        }

        if (reviewRepository.existsByScheduleId(schedule.getId())) {
            throw new ReviewException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .id(UUID.randomUUID().toString())
                .score(requestDTO.score())
                .content(requestDTO.content())
                .writerId(memberId)
                .lessonId(schedule.getLessonId())
                .scheduleId(schedule.getId())
                .build();

        reviewRepository.save(review);

        return ReviewCreateResponseDTO.from(review.getId());
    }
}

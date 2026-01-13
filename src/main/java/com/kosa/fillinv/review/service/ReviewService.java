package com.kosa.fillinv.review.service;

import com.kosa.fillinv.review.dto.*;
import com.kosa.fillinv.review.repository.ReviewRepository;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
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
                        LessonAvgScore::averageScore
                )
        );
    }
}

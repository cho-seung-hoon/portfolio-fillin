package com.kosa.fillinv.review.service;

import com.kosa.fillinv.review.dto.LessonReviewListResponseDTO;
import com.kosa.fillinv.review.dto.LessonReviewResponseDTO;
import com.kosa.fillinv.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public LessonReviewListResponseDTO getReviewListByLesson(String lessonId, Pageable pageable) {
        Double averageScore = reviewRepository.findAverageScoreByLessonId(lessonId);
        Page<LessonReviewResponseDTO> reviews = reviewRepository
                .findReviewsWithNicknameByLessonId(lessonId, pageable)
                .map(LessonReviewResponseDTO::from);

        return LessonReviewListResponseDTO.of(averageScore, reviews.getTotalElements(), reviews);
    }
}

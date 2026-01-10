package com.kosa.fillinv.review.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
@Builder
public class LessonReviewListResponseDTO {
    private Double averageScore;
    private Long totalReviewCount;
    private Page<LessonReviewResponseDTO> reviews;

    public static LessonReviewListResponseDTO of(
            Double averageScore,
            Long totalReviewCount,
            Page<LessonReviewResponseDTO> reviews
    ) {
        return LessonReviewListResponseDTO.builder()
                .averageScore(averageScore != null ? averageScore : 0.0)
                .totalReviewCount(totalReviewCount)
                .reviews(reviews)
                .build();
    }
}

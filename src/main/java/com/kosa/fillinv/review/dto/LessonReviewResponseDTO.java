package com.kosa.fillinv.review.dto;

import com.kosa.fillinv.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class LessonReviewResponseDTO {
    private String reviewId;
    private Integer score;
    private String content;
    private String writerId;
    private String nickname;
    private String lessonId;
    private Instant createdAt;

    public static LessonReviewResponseDTO from(ReviewWithNicknameVO vo) {
        Review review = vo.getReview();
        return LessonReviewResponseDTO.builder()
                .reviewId(review.getId())
                .score(review.getScore())
                .content(review.getContent())
                .writerId(review.getWriterId())
                .nickname(vo.getNickname())
                .lessonId(review.getLessonId())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

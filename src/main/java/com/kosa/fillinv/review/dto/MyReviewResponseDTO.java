package com.kosa.fillinv.review.dto;

import com.kosa.fillinv.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class MyReviewResponseDTO {
    private String reviewId;
    private Integer score;
    private String content;
    private String lessonId;
    private String scheduleId;
    private String lessonName;
    private Instant createdAt;
    private String optionName;
    private Instant reservationDate;
    private String mentorNickname;

    public static MyReviewResponseDTO from(MyReviewVO vo) {
        Review r = vo.review();
        return MyReviewResponseDTO.builder()
                .reviewId(r.getId())
                .score(r.getScore())
                .content(r.getContent())
                .lessonId(r.getLessonId())
                .scheduleId(r.getScheduleId())
                .lessonName(vo.lessonName())
                .createdAt(r.getCreatedAt())
                .optionName(vo.optionName())
                .reservationDate(vo.reservationDate())
                .mentorNickname(vo.mentorNickname())
                .build();
    }
}

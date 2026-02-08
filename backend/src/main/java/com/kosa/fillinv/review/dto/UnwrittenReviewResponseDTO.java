package com.kosa.fillinv.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class UnwrittenReviewResponseDTO {
    private String scheduleId;
    private String lessonName;
    private String lessonId;
    private String optionName;
    private Instant reservationDate;
    private String mentorNickname;

    public static UnwrittenReviewResponseDTO from(UnwrittenReviewVO vo) {
        return UnwrittenReviewResponseDTO.builder()
                .scheduleId(vo.scheduleId())
                .lessonName(vo.lessonName())
                .lessonId(vo.lessonId())
                .optionName(vo.optionName())
                .reservationDate(vo.reservationDate())
                .mentorNickname(vo.mentorNickname())
                .build();
    }
}

package com.kosa.fillinv.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequestDTO(
        @NotBlank(message = "스케줄 ID는 필수입니다.") String scheduleId,

        @NotNull(message = "별점은 필수입니다.") @Min(value = 1, message = "별점은 최소 1점입니다.") @Max(value = 5, message = "별점은 최대 5점입니다.") Integer score,

        @NotBlank(message = "리뷰 내용은 필수입니다.") String content) {
}

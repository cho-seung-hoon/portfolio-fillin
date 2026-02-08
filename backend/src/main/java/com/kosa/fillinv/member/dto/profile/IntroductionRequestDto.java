package com.kosa.fillinv.member.dto.profile;

import lombok.Builder;

@Builder
public record IntroductionRequestDto(
        String introduction,
        Long categoryId) {
}

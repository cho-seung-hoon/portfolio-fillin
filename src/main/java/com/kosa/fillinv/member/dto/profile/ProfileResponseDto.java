package com.kosa.fillinv.member.dto.profile;

import com.kosa.fillinv.category.dto.CategoryResponseDto;
import lombok.Builder;

@Builder
public record ProfileResponseDto(
        String imageUrl,
        String nickname,
        String email,
        String phoneNum,
        String introduction,
        CategoryResponseDto category) {
}

package com.kosa.fillinv.member.dto.profile;

import com.kosa.fillinv.category.dto.CategoryResponseDto;
import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.entity.Profile;

public record ProfileResponseDto(
        String memberId,
        String imageUrl,
        String nickname,
        String email,
        String phoneNum,
        String introduction,
        CategoryResponseDto category) {
    public static ProfileResponseDto of(Member member, Profile profile, Category category) {
        return new ProfileResponseDto(
                member.getId(),
                profile != null ? profile.getImage() : null,
                member.getNickname(),
                member.getEmail(),
                member.getPhoneNum(),
                profile != null ? profile.getIntroduce() : null,
                category != null ? CategoryResponseDto.of(category) : null
        );
    }
}

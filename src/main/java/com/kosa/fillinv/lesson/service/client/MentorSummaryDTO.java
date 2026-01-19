package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;

public record MentorSummaryDTO(
        String mentorId,
        String nickname,
        String profileImage,
        String introduction
) {
    public static MentorSummaryDTO of(ProfileResponseDto profile) {
        return new MentorSummaryDTO(
                profile.memberId(),
                profile.nickname(),
                profile.imageUrl(),
                profile.introduction()
        );
    }
}

package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProfileClientImpl implements ProfileClient {

    private final MemberService memberService;

    @Override
    public Map<String, MentorSummaryDTO> getMentors(Set<String> mentorIds) {
        return memberService.getAllProfilesByMemberIds(mentorIds).values().stream()
                .collect(Collectors.toMap(ProfileResponseDto::memberId, MentorSummaryDTO::of));
    }

    @Override
    public MentorSummaryDTO readMentorById(String mentorId) {
        return MentorSummaryDTO.of(memberService.getProfile(mentorId));
    }
}

package com.kosa.fillinv.member.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.member.dto.profile.IntroductionRequestDto;
import com.kosa.fillinv.member.dto.profile.NicknameRequestDto;
import com.kosa.fillinv.member.dto.profile.ProfileImageRequestDto;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final MemberService memberService;

    @GetMapping("/me")
    public SuccessResponse<ProfileResponseDto> getMyProfile(@AuthenticationPrincipal CustomMemberDetails userDetails) {
        return SuccessResponse.success(HttpStatus.OK, memberService.getProfile(userDetails.getMemberId()));
    }

    @PatchMapping("/me/image")
    public SuccessResponse<Void> updateProfileImage(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody ProfileImageRequestDto requestDto) {
        memberService.updateProfileImage(userDetails.getMemberId(), requestDto.image());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/nickname")
    public SuccessResponse<Void> updateNickname(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody NicknameRequestDto requestDto) {
        memberService.updateNickname(userDetails.getMemberId(), requestDto.nickname());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/introduction")
    public SuccessResponse<Void> updateIntroduction(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody IntroductionRequestDto requestDto) {
        memberService.updateIntroduction(userDetails.getMemberId(), requestDto);
        return SuccessResponse.success(HttpStatus.OK);
    }
}

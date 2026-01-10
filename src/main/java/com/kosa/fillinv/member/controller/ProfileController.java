package com.kosa.fillinv.member.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.member.dto.IntroductionRequestDto;
import com.kosa.fillinv.member.dto.NicknameRequestDto;
import com.kosa.fillinv.member.dto.ProfileImageRequestDto;
import com.kosa.fillinv.member.dto.ProfileResponseDto;
import com.kosa.fillinv.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final MemberService memberService;

    @GetMapping("/me")
    public SuccessResponse<ProfileResponseDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return SuccessResponse.success(HttpStatus.OK, memberService.getProfile(userDetails.getUsername()));
    }

    @PatchMapping("/me/image")
    public SuccessResponse<Void> updateProfileImage(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ProfileImageRequestDto requestDto) {
        memberService.updateProfileImage(userDetails.getUsername(), requestDto.getImage());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/nickname")
    public SuccessResponse<Void> updateNickname(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NicknameRequestDto requestDto) {
        memberService.updateNickname(userDetails.getUsername(), requestDto.getNickname());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/introduction")
    public SuccessResponse<Void> updateIntroduction(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody IntroductionRequestDto requestDto) {
        memberService.updateIntroduction(userDetails.getUsername(), requestDto);
        return SuccessResponse.success(HttpStatus.OK);
    }
}

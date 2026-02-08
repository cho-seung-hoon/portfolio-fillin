package com.kosa.fillinv.member.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.member.dto.profile.IntroductionRequestDto;
import com.kosa.fillinv.member.dto.profile.NicknameRequestDto;
import com.kosa.fillinv.member.dto.profile.PhoneNumRequestDto;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final MemberService memberService;

    @GetMapping("/me")
    public SuccessResponse<ProfileResponseDto> getMyProfile(@AuthenticationPrincipal CustomMemberDetails userDetails) {
        return SuccessResponse.success(HttpStatus.OK, memberService.getProfile(userDetails.getUsername()));
    }

    @PatchMapping("/me/image")
    public SuccessResponse<Void> updateProfileImage(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestPart("image") MultipartFile image) {
        memberService.updateProfileImage(userDetails.getUsername(), image);
        return SuccessResponse.success(HttpStatus.OK);
    }

    @DeleteMapping("/me/image")
    public SuccessResponse<Void> deleteProfileImage(@AuthenticationPrincipal CustomMemberDetails userDetails) {
        memberService.deleteProfileImage(userDetails.getUsername());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/nickname")
    public SuccessResponse<Void> updateNickname(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody NicknameRequestDto requestDto) {
        memberService.updateNickname(userDetails.getUsername(), requestDto.nickname());
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/introduction")
    public SuccessResponse<Void> updateIntroduction(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @RequestBody IntroductionRequestDto requestDto) {
        memberService.updateIntroduction(userDetails.getUsername(), requestDto);
        return SuccessResponse.success(HttpStatus.OK);
    }

    @PatchMapping("/me/phone")
    public SuccessResponse<Void> updatePhoneNum(@AuthenticationPrincipal CustomMemberDetails userDetails,
            @Valid @RequestBody PhoneNumRequestDto requestDto) {
        memberService.updatePhoneNum(userDetails.getUsername(), requestDto.phoneNum());
        return SuccessResponse.success(HttpStatus.OK);
    }
}

package com.kosa.fillinv.member.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.member.dto.member.SignUpDto;
import com.kosa.fillinv.member.service.MemberService;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/signup")
    public SuccessResponse<Void> signUp(@Valid @RequestBody SignUpDto signUpDto) {
        memberService.signUp(signUpDto);
        return SuccessResponse.success(HttpStatus.CREATED);
    }

    @DeleteMapping("/withdraw")
    public SuccessResponse<Void> withdraw(@AuthenticationPrincipal CustomMemberDetails userDetails) {
        memberService.deleteMember(userDetails.getUsername());
        return SuccessResponse.success(HttpStatus.OK);
    }
}

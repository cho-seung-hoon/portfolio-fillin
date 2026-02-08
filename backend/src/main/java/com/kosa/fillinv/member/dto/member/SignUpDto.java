package com.kosa.fillinv.member.dto.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Builder
public record SignUpDto(
        @NotBlank @Email String email,

        @NotBlank String password,

        @NotBlank String nickname,

        @NotBlank String phoneNum) {
}

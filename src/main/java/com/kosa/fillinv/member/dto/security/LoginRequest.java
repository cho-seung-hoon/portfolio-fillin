package com.kosa.fillinv.member.dto.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LoginRequest(
        @NotBlank @Email String email,

        @NotBlank String password) {
}

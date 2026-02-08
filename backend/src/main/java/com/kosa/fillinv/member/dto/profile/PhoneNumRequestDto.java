package com.kosa.fillinv.member.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PhoneNumRequestDto(
        @NotBlank(message = "전화번호는 필수 입력값입니다.")
        @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 입력 가능합니다.")
        String phoneNum) {
}

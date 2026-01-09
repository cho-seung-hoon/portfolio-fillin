package com.kosa.fillinv.global.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.*;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Server Error
    SERVER_ERROR(INTERNAL_SERVER_ERROR, "S01", "서버 오류가 발생했습니다."),

    //Global Error
    RESOURCE_NOT_FOUND(NOT_FOUND, "G01", "요청한 자원을 찾을 수 없습니다"),
    NOT_SUPPORTED(BAD_REQUEST, "G02", "지원하지 않는 요청입니다"),
    ;

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}

package com.kosa.fillinv.global.exception;

import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public ErrorResponse handleException(final Exception e) {
        final ErrorCode errorCode = ErrorCode.SERVER_ERROR;
        log.error(errorCode.getMessage(), e);
        return ErrorResponse.error(errorCode);
    }

    @ExceptionHandler(CustomGlobalException.class)
    public ResponseEntity<ErrorResponse> handleCustomGlobalException(final CustomGlobalException e) {
        log.warn(e.getMessage(), e);
        final ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(new ErrorResponse(errorCode.getHttpStatus().value(), errorCode.getCode(), e.getMessage()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNoResourceFoundException(
            final NoResourceFoundException e) {
        final ErrorCode errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        log.warn("Resource not found: {}", e.getResourcePath());
        return ErrorResponse.error(errorCode);
    }

}

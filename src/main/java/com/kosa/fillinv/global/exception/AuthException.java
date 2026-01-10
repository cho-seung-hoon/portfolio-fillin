package com.kosa.fillinv.global.exception;

import com.kosa.fillinv.global.response.ErrorCode;

public class AuthException extends CustomGlobalException {

    public AuthException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static class LoginFailed extends AuthException {
        public LoginFailed() {
            super(ErrorCode.LOGIN_FAILED);
        }
    }

    public static class InvalidToken extends AuthException {
        public InvalidToken() {
            super(ErrorCode.INVALID_TOKEN);
        }
    }

    public static class Unauthorized extends AuthException {
        public Unauthorized() {
            super(ErrorCode.UNAUTHORIZED);
        }
    }

    public static class AccessDenied extends AuthException {
        public AccessDenied() {
            super(ErrorCode.ACCESS_DENIED);
        }
    }
}

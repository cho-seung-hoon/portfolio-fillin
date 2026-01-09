package com.kosa.fillinv.global.exception;

import com.kosa.fillinv.global.response.ErrorCode;

public class ResourceException extends CustomGlobalException{

    protected ResourceException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static class NotFound extends ResourceException {
        public NotFound(String message) {
            super(ErrorCode.RESOURCE_NOT_FOUND, message);
        }
    }

    public static class InvalidArgument extends ResourceException {
        public InvalidArgument(String message) { super(ErrorCode.INVALID_ARGUMENT, message);}
    }
}

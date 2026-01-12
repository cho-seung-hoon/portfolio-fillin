package com.kosa.fillinv.category.exception;

import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.exception.CustomGlobalException;

public class CategoryException extends CustomGlobalException {

    public CategoryException(ErrorCode errorCode) {
        super(errorCode);
    }

    public CategoryException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static class NotFound extends CategoryException {
        public NotFound() {
            super(ErrorCode.CATEGORY_NOT_FOUND);
        }
    }
}

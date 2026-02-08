package com.kosa.fillinv.review.exception;

import com.kosa.fillinv.global.exception.CustomGlobalException;
import com.kosa.fillinv.global.response.ErrorCode;
import lombok.Getter;

@Getter
public class ReviewException extends CustomGlobalException {

    public ReviewException(ErrorCode errorCode) {
        super(errorCode);
    }
}

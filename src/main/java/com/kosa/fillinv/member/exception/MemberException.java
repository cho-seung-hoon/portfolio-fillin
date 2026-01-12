package com.kosa.fillinv.member.exception;

import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.exception.CustomGlobalException;

public class MemberException extends CustomGlobalException {

    public MemberException(ErrorCode errorCode) {
        super(errorCode);
    }

    public MemberException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static class MemberNotFound extends MemberException {
        public MemberNotFound() {
            super(ErrorCode.MEMBER_NOT_FOUND);
        }
    }

    public static class ProfileNotFound extends MemberException {
        public ProfileNotFound() {
            super(ErrorCode.PROFILE_NOT_FOUND);
        }
    }
}

package com.kosa.fillinv.schedule.exception;

import com.kosa.fillinv.global.exception.CustomGlobalException;
import com.kosa.fillinv.global.response.ErrorCode;
import lombok.Getter;

@Getter
public class ScheduleException extends CustomGlobalException {

    public ScheduleException(ErrorCode errorCode) {
        super(errorCode);
    }

    public static class ScheduleNotFound extends ScheduleException {
        public ScheduleNotFound() {
            super(ErrorCode.RESOURCE_NOT_FOUND);
        }
    }
}

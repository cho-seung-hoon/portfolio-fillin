package com.kosa.fillinv.lesson.exception;

public enum LessonError {

    // 공통 생성 오류
    TITLE_REQUIRED("레슨 제목은 필수입니다."),
    LESSON_TYPE_REQUIRED("레슨 유형은 필수입니다."),
    THUMBNAIL_IMAGE_REQUIRED("썸네일 이미지는 필수입니다."),
    DESCRIPTION_REQUIRED("레슨 설명은 필수입니다."),
    LOCATION_REQUIRED("레슨 장소는 필수입니다."),
    MENTOR_ID_REQUIRED("멘토 정보는 필수입니다."),
    CATEGORY_ID_REQUIRED("카테고리는 필수입니다.");

    private final String message;

    LessonError(String message) {
        this.message = message;
    }
}

package com.kosa.fillinv.lesson.error;

public class LessonError {

    public static final String TITLE_REQUIRED = "레슨 제목은 필수입니다.";
    public static final String LESSON_TYPE_REQUIRED = "레슨 유형은 필수입니다.";
    public static final String THUMBNAIL_IMAGE_REQUIRED = "썸네일 이미지는 필수입니다.";
    public static final String DESCRIPTION_REQUIRED = "레슨 설명은 필수입니다.";
    public static final String LOCATION_REQUIRED = "레슨 장소는 필수입니다.";
    public static final String MENTOR_ID_REQUIRED = "멘토 정보는 필수입니다.";
    public static final String CATEGORY_ID_REQUIRED = "카테고리는 필수입니다.";
    public static String LESSON_NOT_FOUND_MESSAGE_FORMAT(String lessonId) {
        return String.format("해당 레슨 ID( %s )는 존재하지 않습니다.", lessonId);
    }
    public static String INVALID_LESSON_TYPE(String lessonType) {
        return String.format("레슨 유형( %s )이 유효하지 않습니다.", lessonType);
    }
    public static String INVALID_SEAT = "좌석 수는 1개 이상이어야 합니다.";
    public static final String LESSON_PRICE_INVALID = "가격 정보가 올바르지 않습니다.";
    public static final String OPTION_REQUIRED = "옵션은 필수입니다.";
    public static final String OPTION_PRICE_INVALID = "옵션 가격 정보가 올바르지 않습니다.";
    public static final String AVAILABLE_TIME_REQUIRED = "이용 가능 시간은 필수입니다.";
    public static final String AVAILABLE_TIME_PRICE_INVALID = "이용 가능 시간의 가격 정보가 올바르지 않습니다.";
}

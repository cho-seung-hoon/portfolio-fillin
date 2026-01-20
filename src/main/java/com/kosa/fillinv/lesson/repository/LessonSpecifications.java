package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import org.springframework.data.jpa.domain.Specification;

public class LessonSpecifications {

    private LessonSpecifications() {
    }

    public static Specification<Lesson> search(
            String keyword,
            LessonType lessonType,
            Long categoryId,
            String mentorId
    ) {
        return Specification.where(deletedAtIsNull())
                .and(keywordContains(keyword))
                .and(lessonTypeEq(lessonType))
                .and(categoryIdEq(categoryId))
                .and(mentorIdEq(mentorId));
    }

    public static Specification<Lesson> mentorIdEq(String mentorId) {
        return (root, query, cb) -> {
            if (mentorId == null || mentorId.isBlank()) {
                return null;
            }
            return cb.equal(root.get("mentorId"), mentorId);
        };
    }

    public static Specification<Lesson> deletedAtIsNull() {
        return (root, query, cb) ->
                cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Lesson> keywordContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            return cb.like(root.get("title"), "%" + keyword + "%");
        };
    }

    private static Specification<Lesson> lessonTypeEq(LessonType lessonType) {
        return (root, query, cb) -> {
            if (lessonType == null) {
                return null;
            }
            return cb.equal(root.get("lessonType"), lessonType);
        };
    }

    private static Specification<Lesson> categoryIdEq(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return null;
            }
            return cb.equal(root.get("categoryId"), categoryId);
        };
    }
}

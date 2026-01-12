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
            Long categoryId
    ) {
        return Specification
                .where(keywordContains(keyword))
                .and(lessonTypeEq(lessonType))
                .and(categoryIdEq(categoryId));
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

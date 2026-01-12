package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String>, JpaSpecificationExecutor<Lesson> {

    Optional<Lesson> findByIdAndDeletedAtIsNull(String id);

    List<Lesson> findAllByDeletedAtIsNull();

    List<Lesson> findAllByTitleContaining(String keyword);

    List<Lesson> findAllByLessonType(LessonType lessonType);

    List<Lesson> findAllByCategoryId(Long categoryId);

    List<Lesson> findAllByOrderByCreatedAtDesc();

    List<Lesson> findAllByOrderByPriceDesc();

    List<Lesson> findAllByOrderByPriceAsc();
}

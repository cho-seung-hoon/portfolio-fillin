package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String>, JpaSpecificationExecutor<Lesson> {

    Optional<Lesson> findByIdAndDeletedAtIsNull(String id);

    List<Lesson> findAllByDeletedAtIsNull();

    List<Lesson> findAllByTitleContainingAndDeletedAtIsNull(String keyword);

    List<Lesson> findAllByLessonTypeAndDeletedAtIsNull(LessonType lessonType);

    List<Lesson> findAllByCategoryIdAndDeletedAtIsNull(Long categoryId);

    List<Lesson> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Lesson> findAllByDeletedAtIsNullOrderByPriceDesc();

    List<Lesson> findAllByDeletedAtIsNullOrderByPriceAsc();

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Lesson l SET l.popularityScore = 0.0")
    void resetAllPopularityScores();
}

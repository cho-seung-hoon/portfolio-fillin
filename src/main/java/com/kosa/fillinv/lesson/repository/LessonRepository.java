package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, String> {

    Optional<Lesson> findByIdAndDeletedAtIsNull(String id);
    List<Lesson> findAllByDeletedAtIsNull();

}

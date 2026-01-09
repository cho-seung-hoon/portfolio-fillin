package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, String> {
    List<Option> findAllByLessonId(String lessonId);
}

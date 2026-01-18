package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.LessonTemp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonTempRepository extends JpaRepository<LessonTemp, String> {
}

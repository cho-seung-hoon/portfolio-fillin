package com.kosa.fillinv.lesson.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "lesson_temp")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LessonTemp {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "lesson_id", nullable = false)
    private String lessonId;

    @Column(name = "score", nullable = false)
    private Double score;

    @Builder
    public LessonTemp(String lessonId, Double score) {
        this.id = UUID.randomUUID().toString();
        this.lessonId = lessonId;
        this.score = score;
    }
}

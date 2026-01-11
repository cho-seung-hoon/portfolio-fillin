package com.kosa.fillinv.lesson.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "lessons")
public class Lesson {

    @Id
    @Column(name = "lesson_id", nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    private LessonType lessonType; // 1:1, 1:N 등

    @Column(name = "thumbnail_image", nullable = false)
    private String thumbnailImage;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "close_at")
    private LocalDateTime closeAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "mentor_id", nullable = false)
    private String mentorId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

}

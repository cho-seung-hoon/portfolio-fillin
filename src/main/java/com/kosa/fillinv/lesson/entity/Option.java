package com.kosa.fillinv.lesson.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "options")
@NoArgsConstructor
@Getter
public class Option {

    @Id
    @Column(name = "option_id", nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "minute", nullable = false)
    private Integer minute;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Setter
    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Builder
    public Option(String id,
                  String name,
                  Integer minute,
                  Integer price,
                  Lesson lesson) {
        this.id = id;
        this.name = name;
        this.minute = minute;
        this.price = price;
        this.lesson = lesson;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = null;
        this.deletedAt = null;
    }

    public void delete() {
        deletedAt = LocalDateTime.now();
    }
}

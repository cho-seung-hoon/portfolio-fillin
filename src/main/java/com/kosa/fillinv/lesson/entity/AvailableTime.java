package com.kosa.fillinv.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "available_times")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvailableTime {

    @Id
    @Column(name = "available_time_id", nullable = false)
    private String id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

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
    public AvailableTime(String id,
                         Lesson lesson,
                         LocalDate date,
                         LocalTime startTime,
                         LocalTime endTime,
                         Integer price) {
        this.id = id;
        this.lesson = lesson;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = null;
        this.deletedAt = null;
    }

    public void delete() {
        deletedAt = LocalDateTime.now();
    }
}

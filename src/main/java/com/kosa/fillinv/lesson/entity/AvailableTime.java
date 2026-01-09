package com.kosa.fillinv.lesson.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.*;

@Entity
@Table(name = "available_times")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvailableTime extends BaseEntity {

    @Id
    @Column(name = "available_time_id", nullable = false)
    private String id;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Setter
    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Builder
    public AvailableTime(String id,
                         Lesson lesson,
                         Instant startTime,
                         Instant endTime,
                         Integer price) {
        this.id = id;
        this.lesson = lesson;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
    }
}

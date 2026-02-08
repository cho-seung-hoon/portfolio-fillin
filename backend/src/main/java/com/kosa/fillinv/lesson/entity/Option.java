package com.kosa.fillinv.lesson.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "options")
@NoArgsConstructor
@Getter
public class Option extends BaseEntity {

    @Id
    @Column(name = "option_id", nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "minute", nullable = false)
    private Integer minute;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Setter(AccessLevel.PACKAGE)
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
    }
}

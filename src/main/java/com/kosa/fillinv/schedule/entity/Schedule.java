package com.kosa.fillinv.schedule.entity;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Table(name = "schedules")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Schedule {

    @Id
    @Column(name = "schedule_id", nullable = false)
    private String id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ScheduleStatus status;

    @Column(name = "request_content")
    private String requestContent;

    /* ===== Lesson Snapshot ===== */
    // 레슨 하나 당 없거나 한 개 또는 여러 개의 스케쥴 존재
    @Column(name = "lesson_type", nullable = false)
    private String lessonType;

    @Column(name = "lesson_description", nullable = false)
    private String lessonDescription;

    @Column(name = "lesson_location", nullable = false)
    private String lessonLocation;

    @Column(name = "lesson_category_name", nullable = false)
    private String lessonCategoryName;

    @Column(name = "lesson_mentor_id", nullable = false)
    private String mentor;

    /* ===== Option Snapshot ===== */
    // 옵션 하나 당 없거나 한 개 또는 여러 개의 스케쥴 존재
    @Column(name = "option_name", nullable = false)
    private String optionName;

    @Column(name = "option_minute", nullable = false)
    private Integer optionMinute;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "lesson_id")
    private String lessonId;

    @Column(name = "mentee_id")
    private String mentee;

    @Column(name = "option_id")
    private String optionId;

    // 스케쥴 생성 메서드
    public static Schedule create(Lesson lesson, ScheduleCreateRequest request, String memberId) {
        return Schedule.builder() // 빌더 코드 숨김
                .mentee(memberId)
                .lessonId(lesson.getId())
                .lessonLocation(lesson.getLocation())
                .date(request.date())
                .build();
    }
}
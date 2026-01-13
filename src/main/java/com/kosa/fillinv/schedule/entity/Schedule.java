package com.kosa.fillinv.schedule.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.Option;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Getter
@ToString
@Table(name = "schedules")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Schedule extends BaseEntity {

    @Id
    @Column(name = "schedule_id", nullable = false)
    private String id;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ScheduleStatus status;

    @Column(name = "request_content")
    private String requestContent;

    /* ===== Lesson Snapshot ===== */
    // 레슨 하나 당 없거나 한 개 또는 여러 개의 스케쥴 존재
    @Column(name = "lesson_title", nullable = false)
    private String lessonTitle;

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

    @Column(name = "lesson_id")
    private String lessonId;

    @Column(name = "mentee_id")
    private String mentee;

    @Column(name = "option_id")
    private String optionId;

    /* ===== AvailableTime ===== */
    @ManyToOne(fetch = FetchType.LAZY) // 하나의 시간대에 여러 개의 스케쥴이 생길 수 있음
    @JoinColumn(name = "available_time_id")
    private AvailableTime availableTime;

    // 스케쥴 생성 메서드
    public static Schedule create(Lesson lesson, Option option, AvailableTime availableTime, Instant startTime, String menteeId) {
        // 시작 시간 + 옵션 분(minutes) =  종료 시간
        Instant endTime = startTime.plus(option.getMinute(), ChronoUnit.MINUTES);

        // 장소가 null인 경우 "장소 미정"으로 설정
        String location = (lesson.getLocation() != null) ? lesson.getLocation() : "장소 미정";

        return Schedule.builder() // 빌더 코드 숨김
                .id(UUID.randomUUID().toString()) // UUID 적용

                // 멘토 정보: Lesson 엔티티에 저장된 mentorId 사용
                .mentor(lesson.getMentorId()) // 멘토 id 저장 (레슨 개설자)

                // 컨트롤러에서 @AuthenticationPrincipal을 통해 전달받은 현재 로그인 사용자의 ID
                .mentee(menteeId)// 멘티 - (레슨 수강신청자)
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .lessonType(lesson.getLessonType().toString())
                .lessonDescription(lesson.getDescription())
                .lessonLocation(location)
                .lessonCategoryName(String.valueOf(lesson.getCategoryId()))

                .optionId(option.getId())
                .optionName(option.getName())
                .optionMinute(option.getMinute())
                .price(option.getPrice())

                .availableTime(availableTime) // AvailableTime 엔티티와 연관 설정

                // 시간 정보 - 한국 표준시 적용
                .startTime(startTime)
                .endTime(endTime)

                .status(ScheduleStatus.PAYMENT_PENDING) // 초기 상태 설정 (결제 대기)
                .build();
    }
}

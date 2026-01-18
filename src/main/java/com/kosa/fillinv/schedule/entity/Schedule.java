package com.kosa.fillinv.schedule.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "schedules")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Schedule extends BaseEntity {

    @Id
    @Column(name = "schedule_id", nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ScheduleStatus status;

    @Column(name = "request_content")
    private String requestContent;

    /* ===== Lesson Snapshot ===== */
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

    @Column(name = "mentor_nickname", nullable = false)
    private String mentorNickname;

    /* ===== Option Snapshot ===== */
    /* 옵션은 MENTORING 레슨만 사용 */
    @Column(name = "option_name")
    private String optionName;

    @Column(name = "option_minute")
    private Integer optionMinute;

    @Column(name = "price")
    private Integer price;

    /* 외부 테이블 키 */
    @Column(name = "lesson_id", nullable = false)
    private String lessonId;

    @Column(name = "mentee_id", nullable = false)
    private String menteeId;

    @Column(name = "lesson_mentor_id", nullable = false)
    private String mentorId;

    // MENTORING 레슨에서 사용
    @Column(name = "option_id")
    private String optionId;

    // ONEDAY 레슨에서 사용
    @Column(name = "available_time_id")
    private String availableTimeId;

    // STUDY 레슨은 여러 scheduleTime을 가질 수 있기 때문에 List 사용
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL)
    private List<ScheduleTime> scheduleTimeList = new ArrayList<>();

    public void addScheduleTime(ScheduleTime scheduleTime) {
        scheduleTime.setSchedule(this); // 양방향 연관관계 설정
        this.scheduleTimeList.add(scheduleTime);
    }

    public void addScheduleTime(List<ScheduleTime> scheduleTimeList) {
        scheduleTimeList.forEach(this::addScheduleTime);
    }

    public void markPaymentCompleted() {
        if (status != ScheduleStatus.PAYMENT_PENDING) return;
        this.status = ScheduleStatus.APPROVAL_PENDING;
    }
}

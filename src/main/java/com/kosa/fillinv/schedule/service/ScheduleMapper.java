package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import java.util.ArrayList;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduleMapper {

    private final ScheduleValidator validator;

    public Schedule buildBaseSchedule( // 스케쥴 기본 정보 설정
            Lesson lesson,
            String memberId,
            Option option,
            AvailableTime availableTime,
            Integer price
    ) {
        Category category = validator.getCategory(lesson.getCategoryId());
        Member mentor = validator.getMentor(lesson.getMentorId());

        return Schedule.builder()
                .id(UUID.randomUUID().toString())
                .mentorId(lesson.getMentorId())
                .menteeId(memberId)
                .mentorNickname(mentor.getNickname())
                .lessonId(lesson.getId())
                .lessonTitle(lesson.getTitle())
                .lessonType(lesson.getLessonType().name())
                .lessonDescription(lesson.getDescription())
                .lessonLocation(
                        lesson.getLocation() != null ? lesson.getLocation() : "장소 미정"
                )
                .lessonCategoryName(category.getName())
                .price(price)
                .optionId(option != null ? option.getId() : null)
                .optionName(option != null ? option.getName() : null)
                .optionMinute(option != null ? option.getMinute() : null)
                .availableTimeId(availableTime != null ? availableTime.getId() : null)
                .status(ScheduleStatus.PAYMENT_PENDING)
                .scheduleTimeList(new ArrayList<>())
                .build();
    }
}

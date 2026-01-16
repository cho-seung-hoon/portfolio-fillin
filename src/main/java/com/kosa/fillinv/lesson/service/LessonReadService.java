package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;
import com.kosa.fillinv.lesson.service.client.ProfileClient;
import com.kosa.fillinv.lesson.service.client.ReviewClient;
import com.kosa.fillinv.lesson.service.client.StockClient;
import com.kosa.fillinv.lesson.service.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.kosa.fillinv.lesson.error.LessonError.*;

@Component
@RequiredArgsConstructor
public class LessonReadService {

    private final LessonService lessonService;

    private final ReviewClient reviewClient;

    private final ProfileClient profileClient;

    private final StockClient stockClient;

    public Page<LessonThumbnail> search() {
        return search(LessonSearchCondition.defaultCondition());
    }

    public Page<LessonThumbnail> search(LessonSearchCondition condition) {
        condition = condition == null ? LessonSearchCondition.defaultCondition() : condition;

        Page<LessonDTO> lessonPage = lessonService.searchLesson(condition);

        Set<String> mentorIds = lessonPage.stream()
                .map(LessonDTO::mentorId)
                .collect(Collectors.toSet());
        Set<String> lessonIds = lessonPage.stream()
                .map(LessonDTO::id)
                .collect(Collectors.toSet());

        Map<String, MentorSummaryDTO> mentorMap = profileClient.getMentors(mentorIds);
        Map<String, Float> averageRating = reviewClient.getAverageRating(lessonIds);

        return lessonPage.map(lesson -> {
            MentorSummaryDTO mentor = mentorMap.get(lesson.mentorId());
            Float rating = averageRating.get(lesson.id());
            return LessonThumbnail.of(lesson, mentor, rating);
        });
    }

    public LessonDetailResult detail(LessonDetailCommand request) {

        LessonDTO lessonDTO = lessonService.readLessonById(request.lessonId())
                .orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(request.lessonId())));

        MentorSummaryDTO mentorSummaryDTO = profileClient.readMentorById(lessonDTO.mentorId());

        Set<String> keys = Set.of();
        if (lessonDTO.lessonType() == LessonType.STUDY) {
            keys = Set.of(lessonDTO.id());
        } else if (lessonDTO.lessonType() == LessonType.ONEDAY) {
            keys = lessonDTO.availableTimeDTOList().stream()
                    .map(AvailableTimeDTO::id)
                    .collect(Collectors.toSet());
        }

        Map<String, Integer> stockMap = keys.isEmpty() ?
                new HashMap<>() :
                new HashMap<>(stockClient.getStock(keys));
        for (String key : keys) {
            // Stock에서 조회되지 않은 남은 좌석 수가 있다면 Exception 대신 0으로 초기화
            stockMap.putIfAbsent(key, 0);
        }

        Integer lessonRemainSeats = null;
        Map<String, Integer> availableTimeRemainSeats = null;

        if (lessonDTO.lessonType() == LessonType.STUDY) {
            lessonRemainSeats = stockMap.get(lessonDTO.id());
        } else if (lessonDTO.lessonType() == LessonType.ONEDAY) {
            availableTimeRemainSeats = stockMap;
        }

        return LessonDetailResult.of(mentorSummaryDTO, lessonDTO, lessonRemainSeats, availableTimeRemainSeats);
    }
}

package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;
import com.kosa.fillinv.lesson.service.client.ProfileClient;
import com.kosa.fillinv.lesson.service.client.ReviewClient;
import com.kosa.fillinv.lesson.service.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

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

        return LessonDetailResult.of(mentorSummaryDTO, lessonDTO);
    }
}

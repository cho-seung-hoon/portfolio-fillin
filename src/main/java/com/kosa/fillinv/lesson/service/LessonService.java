package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.exception.InvalidLessonCreateException;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.service.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.kosa.fillinv.lesson.exception.LessonError.*;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;

    @Transactional
    public CreateLessonResult createLesson(CreateLessonCommand command) {
        Lesson lesson = createLessonEntity(command);

        command.optionCommandList().stream()
                .map(c -> createOption(lesson, c))
                .forEach(lesson::addOption);

        command.availableTimeCommandList().stream()
                .map(c -> createAvailableTimeEntity(lesson, c))
                .forEach(lesson::addAvailableTime);

        Lesson saved = lessonRepository.save(lesson);

        return CreateLessonResult.of(saved);
    }

    public Optional<LessonDTO> readLessonById(String id) {
        return findActiveLesson(id).map(LessonDTO::of);
    }

    public List<LessonDTO> readLessonAll() {
        return lessonRepository.findAllByDeletedAtIsNull().stream().map(LessonDTO::of).toList();
    }


    @Transactional
    public UpdateLessonResult updateLesson(String lessonId, UpdateLessonCommand command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow();

        lesson.updateTitle(command.title());
        lesson.updateThumbnailImage(command.thumbnailImage());
        lesson.updateDescription(command.description());
        lesson.updateLocation(command.location());
        lesson.updateCloseAt(command.closeAt());
        lesson.updateCategoryId(command.categoryId());

        return UpdateLessonResult.of(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(String lessonId) {
        findActiveLesson(lessonId).ifPresent(Lesson::delete);
    }

    @Transactional
    public CreateAvailableTimeResult addAvailableTime(String lessonId, CreateAvailableTimeCommand command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow();

        AvailableTime availableTime = createAvailableTimeEntity(lesson, command);
        lesson.addAvailableTime(availableTime);
        lessonRepository.save(lesson);

        return CreateAvailableTimeResult.of(availableTime);
    }

    @Transactional
    public List<CreateAvailableTimeResult> addAvailableTime(String lessonId, List<CreateAvailableTimeCommand> command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow();

        List<AvailableTime> availableTimeList = command.stream().map(c -> createAvailableTimeEntity(lesson, c)).toList();
        lesson.addAvailableTime(availableTimeList);;
        lessonRepository.save(lesson);

        return availableTimeList.stream().map(CreateAvailableTimeResult::of).toList();
    }

    @Transactional
    public void deleteAvailableTime(String lessonId, String availableTimeId) {
        findActiveLesson(lessonId).ifPresent(l -> {
            l.removeAvailableTime(availableTimeId);
        });
    }

    @Transactional
    public void deleteAvailableTime(String lessonId, List<String> availableTimeIdList) {
        findActiveLesson(lessonId).ifPresent(l -> {
            l.removeAvailableTime(availableTimeIdList);
        });
    }

    @Transactional
    public CreateOptionResult addOption(String lessonId, CreateOptionCommand command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow();

        Option option = createOption(lesson, command);
        lesson.addOption(option);
        lessonRepository.save(lesson);

        return CreateOptionResult.of(option);
    }

    @Transactional
    public List<CreateOptionResult> addOption(String lessonId, List<CreateOptionCommand> commandList) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow();

        List<Option> optionList = commandList.stream().map(c -> createOption(lesson, c)).toList();
        lesson.addOption(optionList);
        lessonRepository.save(lesson);

        return optionList.stream().map(CreateOptionResult::of).toList();
    }

    @Transactional
    public void deleteOption(String lessonId, String optionId) {
        findActiveLesson(lessonId).ifPresent(l -> {
            l.removeOption(optionId);
        });
    }

    @Transactional
    public void deleteOption(String lessonId, List<String> optionIdList) {
        findActiveLesson(lessonId).ifPresent(l -> {
            l.removeOption(optionIdList);
        });
    }

    private Optional<Lesson> findActiveLesson(String id) {
        return lessonRepository.findByIdAndDeletedAtIsNull(id);
    }

    private Option createOption(Lesson lesson, CreateOptionCommand command) {

        return Option.builder()
                .id(UUID.randomUUID().toString())
                .lesson(lesson)
                .minute(command.minute())
                .name(command.name())
                .price(command.price())
                .build();

    }

    private AvailableTime createAvailableTimeEntity(Lesson lesson, CreateAvailableTimeCommand command) {

        return AvailableTime.builder()
                .id(UUID.randomUUID().toString())
                .lesson(lesson)
                .date(command.date())
                .startTime(command.startTime())
                .endTime(command.endTime())
                .price(command.price())
                .build();
    }

    private Lesson createLessonEntity(CreateLessonCommand command) {

        if (command.title() == null || command.title().isBlank()) {
            throw new InvalidLessonCreateException(TITLE_REQUIRED);
        }

        if (command.lessonType() == null) {
            throw new InvalidLessonCreateException(LESSON_TYPE_REQUIRED);
        }

        if (command.thumbnailImage() == null || command.thumbnailImage().isBlank()) {
            throw new InvalidLessonCreateException(THUMBNAIL_IMAGE_REQUIRED);
        }

        if (command.description() == null || command.description().isBlank()) {
            throw new InvalidLessonCreateException(DESCRIPTION_REQUIRED);
        }

        if (command.location() == null || command.location().isBlank()) {
            throw new InvalidLessonCreateException(LOCATION_REQUIRED);
        }

        if (command.mentorId() == null || command.mentorId().isBlank()) {
            throw new InvalidLessonCreateException(MENTOR_ID_REQUIRED);
        }

        if (command.categoryId() == null) {
            throw new InvalidLessonCreateException(CATEGORY_ID_REQUIRED);
        }

        return Lesson.builder()
                .id(UUID.randomUUID().toString())
                .title(command.title())
                .lessonType(command.lessonType())
                .thumbnailImage(command.thumbnailImage())
                .description(command.description())
                .location(command.location())
                .mentorId(command.mentorId())
                .categoryId(command.categoryId())
                .closeAt(command.closeAt())
                .build();
    }
}

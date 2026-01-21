package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.repository.AvailableTimeRepository;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.LessonSpecifications;
import com.kosa.fillinv.lesson.repository.OptionRepository;
import com.kosa.fillinv.lesson.service.dto.*;
import com.kosa.fillinv.stock.entity.Stock;
import com.kosa.fillinv.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.kosa.fillinv.lesson.error.LessonError.*;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final OptionRepository optionRepository;
    private final StockRepository stockRepository;

    public Page<LessonDTO> searchLesson(LessonSearchCondition condition) {
        Sort sortBy = condition.sortType().toSort();
        PageRequest pageRequest = PageRequest.of(condition.page(), condition.size(), sortBy);
        Specification<Lesson> search = LessonSpecifications.search(condition.keyword(), condition.lessonType(), condition.categoryPath(), condition.mentorId());

        return lessonRepository.findAll(search, pageRequest).map(LessonDTO::of);
    }

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

        if (saved.getLessonType() == LessonType.ONEDAY) {
            stockRepository.saveAll(createStockEntityForOnedayLesson(saved));
        } else if (saved.getLessonType() == LessonType.STUDY) {
            stockRepository.save(createStockEntityForStudyLesson(saved));
        }

        if (saved.getLessonType() == LessonType.MENTORING) {
            int minPrice = saved.getOptionList().stream().mapToInt(Option::getPrice).min().orElse(0);
            saved.updateMinPrice(minPrice);
        } else if (saved.getLessonType() == LessonType.ONEDAY) {
            int minPrice = saved.getAvailableTimeList().stream().mapToInt(AvailableTime::getPrice).min().orElse(0);
            saved.updateMinPrice(minPrice);
        }

        return CreateLessonResult.of(saved);
    }

    public Optional<LessonDTO> readLessonById(String id) {
        return findActiveLesson(id)
                .map(lesson -> {
                    List<AvailableTime> availableTimes = findAllActiveAvailableTime(lesson.getId());
                    List<Option> options = findAllActiveOption(lesson.getId());
                    return LessonDTO.of(lesson, availableTimes, options);
                });
    }

    public List<LessonDTO> readLessonAll() {
        return lessonRepository.findAllByDeletedAtIsNull().stream().map(LessonDTO::of).toList();
    }


    @Transactional
    public UpdateLessonResult updateLesson(String lessonId, UpdateLessonCommand command, String ownerId) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.validateOwnership(ownerId);

        lesson.updateTitle(command.title());
        lesson.updateThumbnailImage(command.thumbnailImage());
        lesson.updateDescription(command.description());
        lesson.updateLocation(command.location());
        lesson.updateCloseAt(command.closeAt());
        lesson.updateCategory(command.categoryId(), command.categoryPath());

        return UpdateLessonResult.of(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(String lessonId, String ownerId) {
        Lesson lesson = findActiveLesson(lessonId)
                .orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.validateOwnership(ownerId);

        lesson.delete();
    }

    @Transactional
    public CreateAvailableTimeResult addAvailableTime(String lessonId, CreateAvailableTimeCommand command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        AvailableTime availableTime = createAvailableTimeEntity(lesson, command);
        lesson.addAvailableTime(availableTime);
        lessonRepository.save(lesson);

        return CreateAvailableTimeResult.of(availableTime);
    }

    @Transactional
    public List<CreateAvailableTimeResult> addAvailableTime(String lessonId, List<CreateAvailableTimeCommand> commandList) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        List<AvailableTime> availableTimeList = commandList.stream().map(c -> createAvailableTimeEntity(lesson, c)).toList();
        lesson.addAvailableTime(availableTimeList);

        lessonRepository.save(lesson);

        return availableTimeList.stream().map(CreateAvailableTimeResult::of).toList();
    }

    @Transactional
    public void deleteAvailableTime(String lessonId, String availableTimeId) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.removeAvailableTime(availableTimeId);
    }

    @Transactional
    public void deleteAvailableTime(String lessonId, List<String> availableTimeIdList) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.removeAvailableTime(availableTimeIdList);
    }

    @Transactional
    public CreateOptionResult addOption(String lessonId, CreateOptionCommand command) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        Option option = createOption(lesson, command);
        lesson.addOption(option);
        lessonRepository.save(lesson);

        return CreateOptionResult.of(option);
    }

    @Transactional
    public List<CreateOptionResult> addOption(String lessonId, List<CreateOptionCommand> commandList) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        List<Option> optionList = commandList.stream().map(c -> createOption(lesson, c)).toList();
        lesson.addOption(optionList);
        lessonRepository.save(lesson);

        return optionList.stream().map(CreateOptionResult::of).toList();
    }

    @Transactional
    public void deleteOption(String lessonId, String optionId) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.removeOption(optionId);
    }

    @Transactional
    public void deleteOption(String lessonId, List<String> optionIdList) {
        Lesson lesson = findActiveLesson(lessonId).orElseThrow(() -> new ResourceException.NotFound(LESSON_NOT_FOUND_MESSAGE_FORMAT(lessonId)));

        lesson.removeOption(optionIdList);
    }

    private Optional<Lesson> findActiveLesson(String id) {
        return lessonRepository.findByIdAndDeletedAtIsNull(id);
    }

    private List<AvailableTime> findAllActiveAvailableTime(String id) {
        return availableTimeRepository.findAllByLessonIdAndDeletedAtIsNull(id);
    }

    private List<Option> findAllActiveOption(String id) {
        return optionRepository.findAllByLessonIdAndDeletedAtIsNull(id);
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
        if (lesson.getLessonType() == LessonType.ONEDAY && (command.seats() == null || command.seats() <= 0)) {
            throw new ResourceException.InvalidArgument(INVALID_SEAT);
        }

        return AvailableTime.builder()
                .id(UUID.randomUUID().toString())
                .lesson(lesson)
                .startTime(command.startTime())
                .endTime(command.endTime())
                .price(command.price())
                .seats(command.seats())
                .build();
    }

    private Lesson createLessonEntity(CreateLessonCommand command) {

        if (command.title() == null || command.title().isBlank()) {
            throw new ResourceException.InvalidArgument(TITLE_REQUIRED);
        }

        if (command.lessonType() == null) {
            throw new ResourceException.InvalidArgument(LESSON_TYPE_REQUIRED);
        }

        if (command.thumbnailImage() == null || command.thumbnailImage().isBlank()) {
            throw new ResourceException.InvalidArgument(THUMBNAIL_IMAGE_REQUIRED);
        }

        if (command.description() == null || command.description().isBlank()) {
            throw new ResourceException.InvalidArgument(DESCRIPTION_REQUIRED);
        }

        if (command.location() == null || command.location().isBlank()) {
            throw new ResourceException.InvalidArgument(LOCATION_REQUIRED);
        }

        if (command.mentorId() == null || command.mentorId().isBlank()) {
            throw new ResourceException.InvalidArgument(MENTOR_ID_REQUIRED);
        }

        if (command.categoryId() == null) {
            throw new ResourceException.InvalidArgument(CATEGORY_ID_REQUIRED);
        }

        if (command.lessonType() == LessonType.STUDY) {
            if (command.seats() == null || command.seats() <= 0) {
                throw new ResourceException.InvalidArgument(INVALID_SEAT);
            }
        }

        Lesson.LessonBuilder lessonBuilder = Lesson.builder()
                .id(UUID.randomUUID().toString())
                .title(command.title())
                .lessonType(command.lessonType())
                .thumbnailImage(command.thumbnailImage())
                .description(command.description())
                .location(command.location())
                .mentorId(command.mentorId())
                .categoryId(command.categoryId())
                .categoryPath(command.categoryPath())
                .closeAt(command.closeAt());

        if (command.lessonType() == LessonType.STUDY) {
            lessonBuilder.price(command.price());
            lessonBuilder.seats(command.seats());
        }

        return lessonBuilder.build();
    }

    private List<Stock> createStockEntityForOnedayLesson(Lesson lesson) {
        return lesson.getAvailableTimeList().stream()
                .map(at -> Stock.builder()
                        .id(UUID.randomUUID().toString())
                        .serviceKey(at.getId())
                        .quantity(at.getSeats())
                        .build())
                .toList();
    }

    private Stock createStockEntityForStudyLesson(Lesson lesson) {
        return Stock.builder()
                .id(UUID.randomUUID().toString())
                .serviceKey(lesson.getId())
                .quantity(lesson.getSeats())
                .build();
    }
}

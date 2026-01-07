package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.Option;
import com.kosa.fillinv.lesson.exception.InvalidLessonCreateException;
import com.kosa.fillinv.lesson.repository.AvailableTimeRepository;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.OptionRepository;
import com.kosa.fillinv.lesson.service.dto.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.kosa.fillinv.lesson.entity.LessonType;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;

@Transactional
@SpringBootTest
@ActiveProfiles("local")
class LessonServiceTest {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private OptionRepository optionRepository;
    @Autowired
    private AvailableTimeRepository availableTimeRepository;


    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("레슨을 생성한다.")
    void createLesson() {
        // given
        CreateLessonCommand command = createCommand();

        // when
        CreateLessonResult lesson = lessonService.createLesson(command);
        entityManager.flush(); entityManager.clear();

        // then
        Lesson result = lessonRepository.findById(lesson.id()).orElseThrow();
        assertEquals(command.description(), result.getDescription());
        assertEquals(command.lessonType(), result.getLessonType());
        assertEquals(command.thumbnailImage(), result.getThumbnailImage());
        assertEquals(command.location(), result.getLocation());
        assertEquals(command.mentorId(), result.getMentorId());
        assertEquals(command.categoryId(), result.getCategoryId());
        assertEquals(command.closeAt(), result.getCloseAt());
        assertEquals(command.availableTimeCommandList().size(), result.getAvailableTimeList().size());
        assertEquals(command.optionCommandList().size(), result.getOptionList().size());
    }

    @ParameterizedTest(name = "[{index}] {0}")
    @CsvSource(
            value = {
                    // description | lessonType | thumbnail | description | location | mentorId | categoryId
                    "lessonType 누락,        , ONE.png, 설명, 서울, mentor-1, 1",
                    "thumbnailImage 누락, MENTORING, , 설명, 서울, mentor-1, 1",
                    "description 누락,    MENTORING, ONE.png, , 서울, mentor-1, 1",
                    "mentorId 누락,       MENTORING, ONE.png, 설명, 서울, , 1",
                    "categoryId 누락,     MENTORING, ONE.png, 설명, 서울, mentor-1, "
            },
            nullValues = {""}
    )
    @DisplayName("레슨 필수 항목이 누락되면 예외를 던진다.")
    void createLessonWithMissingRequiredField(
            String caseName,
            LessonType lessonType,
            String thumbnailImage,
            String description,
            String location,
            String mentorId,
            Long categoryId
    ) {
        // given
        CreateLessonCommand command = createCommand(
                lessonType,
                thumbnailImage,
                description,
                location,
                mentorId,
                categoryId,
                Collections.EMPTY_LIST,
                Collections.EMPTY_LIST
        );

        // when & then
        assertThatThrownBy(() -> lessonService.createLesson(command))
                .isInstanceOf(InvalidLessonCreateException.class);
    }

    @Test
    @DisplayName("id로 레슨을 조회한다.")
    void readLessonById() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());
        entityManager.flush(); entityManager.clear();

        // when
        LessonDTO result = lessonService.readLessonById(created.id()).orElseThrow();

        // then

        assertEquals(created.description(), result.description());
        assertEquals(created.lessonType(), result.lessonType());
        assertEquals(created.thumbnailImage(), result.thumbnailImage());
        assertEquals(created.location(), result.location());
        assertEquals(created.mentorId(), result.mentorId());
        assertEquals(created.categoryId(), result.categoryId());
        assertEquals(created.closeAt(), result.closeAt());
        assertEquals(created.availableTimeDTOList().size(), result.availableTimeDTOList().size());
        assertEquals(created.optionResultList().size(), result.optionDTOList().size());
    }

    @Test
    @DisplayName("레슨 목록을 조회한다.")
    void readLessonAll() {
        // given
        lessonService.createLesson(createCommand());
        lessonService.createLesson(createCommand());

        // when
        List<LessonDTO> lessons = lessonService.readLessonAll();

        // then
        assertTrue(lessons.size() >= 2);
    }

    @Test
    @DisplayName("레슨을 수정한다.")
    void updateLesson() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        UpdateLessonCommand updateCommand = new UpdateLessonCommand(
                "updated-thumbnail.png",
                "수정된 설명",
                "부산",
                1L,
                LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).plusDays(7)
        );

        // when
        UpdateLessonResult updated =
                lessonService.updateLesson(created.id(), updateCommand);

        // then
        assertEquals(updateCommand.thumbnailImage() , updated.thumbnailImage());
        assertEquals(updateCommand.description(), updated.description());
        assertEquals(updateCommand.location(), updated.location());
        assertEquals(updateCommand.categoryId(), updated.categoryId());
        assertEquals(updateCommand.closeAt(), updated.closeAt());
    }

    @Test
    @DisplayName("레슨을 삭제한다. 레슨을 삭제하면 포한됨 옵션(Option)과 가능한 시간(availableTime)도 삭제된다")
    void deleteLesson() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        // when
        lessonService.deleteLesson(created.id());
        entityManager.flush(); entityManager.clear();

        // then
        Optional<LessonDTO> result = lessonService.readLessonById(created.id());
        List<Option> allByLessonId = optionRepository.findAllByLessonId(created.id()).stream().filter(op -> op.getDeletedAt() == null).toList();
        List<AvailableTime> allByLessonId1 = availableTimeRepository.findAllByLessonId(created.id()).stream().filter(at -> at.getDeletedAt() == null).toList();

        assertTrue(result.isEmpty());
        assertTrue(allByLessonId.isEmpty());
        assertTrue(allByLessonId1.isEmpty());
    }

    @Test
    @DisplayName("레슨에 가능한 시간(availableTime)을 추가한다.")
    void addAvailableTime() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());
        CreateAvailableTimeCommand command = createAvailableTimeCommand();

        // when
        lessonService.addAvailableTime(created.id(), command);
        entityManager.flush();
        entityManager.clear();

        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();

        // then
        assertEquals(created.availableTimeDTOList().size() + 1, lessonDTO.availableTimeDTOList().size());
        assertTrue(
                created.availableTimeDTOList().stream()
                        .anyMatch(at ->
                            at.startTime().equals(command.startTime()) &&
                                    at.endTime().equals(command.endTime()) &&
                                    at.price().equals(command.price()) &&
                                    at.lessonId().equals(lessonDTO.id())
                        )
        );
    }

    @Test
    @DisplayName("레슨에 가능한 시간(availableTime)을 여러개 추가한다.")
    void addAvailableTimeAll() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        LocalDateTime start1 = LocalDateTime.of(2025, 1, 10, 14, 0);
        LocalDateTime end1   = LocalDateTime.of(2025, 1, 10, 16, 0);

        LocalDateTime start2 = LocalDateTime.of(2025, 1, 17, 14, 0);
        LocalDateTime end2   = LocalDateTime.of(2025, 1, 17, 16, 0);

        List<CreateAvailableTimeCommand> commands = List.of(
                createAvailableTimeCommand(start1, end1, 1000),
                createAvailableTimeCommand(start2, end2, 2000)
        );

        // when
        lessonService.addAvailableTime(created.id(), commands);
        entityManager.flush();
        entityManager.clear();

        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();

        // then
        assertEquals(created.availableTimeDTOList().size() + commands.size(), lessonDTO.availableTimeDTOList().size());

        assertTrue(
                lessonDTO.availableTimeDTOList().stream()
                        .anyMatch(at ->
                                at.startTime().equals(start1.toLocalTime().truncatedTo(ChronoUnit.MINUTES)) &&
                                        at.endTime().equals(end1.toLocalTime().truncatedTo(ChronoUnit.MINUTES)) &&
                                        at.price() == 1000
                        )
        );

        assertTrue(
                lessonDTO.availableTimeDTOList().stream()
                        .anyMatch(at ->
                                at.startTime().withNano(0).equals(start2.toLocalTime().truncatedTo(ChronoUnit.MINUTES)) &&
                                        at.endTime().withNano(0).equals(end2.toLocalTime().truncatedTo(ChronoUnit.MINUTES)) &&
                                        at.price() == 2000
                        )
        );

    }

    @Test
    @DisplayName("레슨에서 가능한 시간(availableTime)을 삭제한다")
    void deleteAvailableTime() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        LocalDateTime start1 = LocalDateTime.of(2025, 1, 10, 14, 0);
        LocalDateTime end1   = LocalDateTime.of(2025, 1, 10, 16, 0);

        LocalDateTime start2 = LocalDateTime.of(2025, 1, 17, 14, 0);
        LocalDateTime end2   = LocalDateTime.of(2025, 1, 17, 16, 0);

        List<CreateAvailableTimeCommand> commands = List.of(
                createAvailableTimeCommand(start1, end1, 1000),
                createAvailableTimeCommand(start2, end2, 2000)
        );

        List<CreateAvailableTimeResult> createAvailableTimeResults = lessonService.addAvailableTime(created.id(), commands);

        // when
        lessonService.deleteAvailableTime(created.id(), createAvailableTimeResults.get(0).id());
        entityManager.flush();
        entityManager.clear();

        // then
        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();
        assertEquals(created.availableTimeDTOList().size() + commands.size() - 1, lessonDTO.availableTimeDTOList().size());
    }

    @Test
    @DisplayName("레슨에서 가능한 시간(availableTime)을 여러개 삭제한다")
    void deleteAvailableTimeAll() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        LocalDateTime start1 = LocalDateTime.of(2025, 1, 10, 14, 0);
        LocalDateTime end1   = LocalDateTime.of(2025, 1, 10, 16, 0);

        LocalDateTime start2 = LocalDateTime.of(2025, 1, 17, 14, 0);
        LocalDateTime end2   = LocalDateTime.of(2025, 1, 17, 16, 0);

        List<CreateAvailableTimeCommand> commands = List.of(
                createAvailableTimeCommand(start1, end1, 1000),
                createAvailableTimeCommand(start2, end2, 2000)
        );

        List<CreateAvailableTimeResult> createAvailableTimeResults = lessonService.addAvailableTime(created.id(), commands);

        // when
        lessonService.deleteAvailableTime(created.id(), createAvailableTimeResults.stream().map(CreateAvailableTimeResult::id).toList());
        entityManager.flush();
        entityManager.clear();

        // then
        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();
        assertEquals(created.availableTimeDTOList().size(), lessonDTO.availableTimeDTOList().size());
    }

    @Test
    @DisplayName("레슨에 옵션(Option)을 추가한다.")
    void addOption() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());
        CreateOptionCommand command = createOptionCommand();

        // when
        lessonService.addOption(created.id(), command);
        entityManager.flush();
        entityManager.clear();

        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();

        // then
        assertEquals(created.optionResultList().size() + 1, lessonDTO.optionDTOList().size());
        assertTrue(
                lessonDTO.optionDTOList().stream()
                        .anyMatch(op ->
                                op.name().equals(command.name()) &&
                                        op.minute().equals(command.minute()) &&
                                        op.price().equals(command.price())

                        )
        );
    }

    @Test
    @DisplayName("레슨에 옵션(Option)을 여러개 추가한다.")
    void addOptionAll() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        CreateOptionCommand command1 = createOptionCommand("option1", 30, 1000);
        CreateOptionCommand command2 = createOptionCommand("option2", 60, 2000);

        List<CreateOptionCommand> commandList = List.of(command1 ,command2);

        // when
        lessonService.addOption(created.id(), commandList);
        entityManager.flush();
        entityManager.clear();

        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();

        // then
        assertEquals(created.optionResultList().size() + 2, lessonDTO.optionDTOList().size());

        assertTrue(
                lessonDTO.optionDTOList().stream()
                        .anyMatch(op ->
                                op.name().equals(command1.name()) &&
                                        Objects.equals(op.minute(), command1.minute()) &&
                                        Objects.equals(op.price(), command1.price())
                        )
        );
        assertTrue(
                lessonDTO.optionDTOList().stream()
                        .anyMatch(op ->
                                op.name().equals(command2.name()) &&
                                        Objects.equals(op.minute(), command2.minute()) &&
                                        Objects.equals(op.price(), command2.price())
                        )
        );

    }

    @Test
    @DisplayName("레슨에서 옵션(Option)을 삭제한다")
    void deleteOption() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        CreateOptionCommand command1 = createOptionCommand("option1", 30, 1000);
        CreateOptionCommand command2 = createOptionCommand("option2", 60, 2000);

        List<CreateOptionCommand> commandList = List.of(command1 ,command2);

        List<CreateOptionResult> createOptionResults = lessonService.addOption(created.id(), commandList);

        // when
        lessonService.deleteOption(created.id(), createOptionResults.get(0).id());
        entityManager.flush();
        entityManager.clear();

        // then
        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();
        assertEquals(created.optionResultList().size() + commandList.size() - 1, lessonDTO.optionDTOList().size());
    }

    @Test
    @DisplayName("레슨에서 옵션(Option)을 여러개 삭제한다")
    void deleteOptionAll() {
        // given
        CreateLessonResult created = lessonService.createLesson(createCommand());

        CreateOptionCommand command1 = createOptionCommand("option1", 30, 1000);
        CreateOptionCommand command2 = createOptionCommand("option2", 60, 2000);

        List<CreateOptionCommand> commandList = List.of(command1 ,command2);

        List<CreateOptionResult> createOptionResults = lessonService.addOption(created.id(), commandList);

        // when
        lessonService.deleteOption(created.id(), createOptionResults.stream().map(CreateOptionResult::id).toList());
        entityManager.flush();
        entityManager.clear();

        // then
        LessonDTO lessonDTO = lessonService.readLessonById(created.id()).orElseThrow();
        assertEquals(created.optionResultList().size(), lessonDTO.optionDTOList().size());
    }



    private CreateOptionCommand createOptionCommand() {
        return new CreateOptionCommand(
                "option name",
                30,
                20000
        );
    }

    private CreateOptionCommand createOptionCommand(
            String name,
            Integer minute,
            Integer price) {
        return new CreateOptionCommand(
                name,
                minute,
                price
        );
    }

    private CreateLessonCommand createCommand() {
        return new CreateLessonCommand(
                LessonType.ONEDAY,
                "thumbnail.png",
                "테스트 레슨 설명",
                "서울",
                "mentor-1",
                1L,
                LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).plusDays(1),
                List.of(createOptionCommand("option1", 30, 1000), createOptionCommand("option2", 60, 2000)),
                List.of(createAvailableTimeCommand())
        );
    }

    private CreateAvailableTimeCommand createAvailableTimeCommand() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        return new CreateAvailableTimeCommand(
                now.toLocalDate(),
                now.toLocalTime(),
                now.plusHours(2).toLocalTime(),
                10000
        );
    }

    private CreateAvailableTimeCommand createAvailableTimeCommand(
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer price) {
        return new CreateAvailableTimeCommand(
                startTime.toLocalDate(),
                startTime.toLocalTime(),
                endTime.toLocalTime(),
                price
        );
    }

    private CreateLessonCommand createCommand(
            LessonType lessonType,
            String thumbnailImage,
            String description,
            String location,
            String mentorId,
            Long categoryId,
            List<CreateOptionCommand> optionList,
            List<CreateAvailableTimeCommand> availableTimeList
    ) {
        return new CreateLessonCommand(
                lessonType,
                thumbnailImage,
                description,
                location,
                mentorId,
                categoryId,
                LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS).plusDays(1),
                optionList,
                availableTimeList
        );
    }


}
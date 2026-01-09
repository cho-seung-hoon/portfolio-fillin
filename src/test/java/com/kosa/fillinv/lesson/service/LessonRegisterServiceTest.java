package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;
import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;


@SpringBootTest
@Transactional
@ActiveProfiles("local")
class LessonRegisterServiceTest {

    @Autowired
    private LessonRegisterService lessonRegisterService;

    @MockitoSpyBean
    private FileStorage fileStorage;

    @Test
    @DisplayName("썸네일과 함께 강의 등록한다.")
    public void registerLesson() {
        // given
        RegisterLessonCommand command = createSampleCommand();
        MultipartFile file = createSampleFile();

        // when
        CreateLessonResult createLessonResult = lessonRegisterService.registerLesson(command, file);

        // then
        assertThat(fileStorage.exists(createLessonResult.thumbnailImage())).isTrue();
        fileStorage.delete(createLessonResult.thumbnailImage());

        assertThat(createLessonResult.thumbnailImage()).isNotEmpty();
        assertThat(createLessonResult.id()).isNotNull();
        assertThat(createLessonResult.title()).isEqualTo(command.title());
        assertThat(createLessonResult.lessonType().name()).isEqualTo(command.lessonType());
        assertThat(createLessonResult.description()).isEqualTo(command.description());
        assertThat(createLessonResult.location()).isEqualTo(command.location());
        assertThat(createLessonResult.mentorId()).isEqualTo(command.mentorId());
        assertThat(createLessonResult.categoryId()).isEqualTo(command.categoryId());
        assertThat(createLessonResult.closeAt()).isEqualTo(command.closeAt());
        assertThat(createLessonResult.price()).isEqualTo(command.price());
        assertThat(createLessonResult.optionResultList().size()).isEqualTo(command.optionList().size());
        assertThat(createLessonResult.availableTimeDTOList().size()).isEqualTo(command.availableTimeList().size());
    }

    @Test
    @DisplayName("강의 생성 실패 시 업로드된 파일을 삭제한다")
    void deleteFileWhenCreateLessonFails() {
        // given
        RegisterLessonCommand invalidCommand = createInvalidCommand();
        MultipartFile file = createSampleFile();

        // when
        try {
            lessonRegisterService.registerLesson(invalidCommand, file);
        } catch (Exception e) {
            // 예외는 의도된 것 → 무시
        }

        // then
        verify(fileStorage, times(1))
                .delete(anyString());
    }

    private RegisterLessonCommand createInvalidCommand() {
        return new RegisterLessonCommand(
                "",
                "",
                "",
                "",
                "",
                1L,
                Instant.parse("2025-01-31T23:59:59Z"),
                null,
                List.of(),
                List.of()
        );
    }

    private MultipartFile createSampleFile() {
        MultipartFile file;
        Path filePath = Paths.get("src/test/resources/files/dummy.png");
        try (InputStream is = Files.newInputStream(filePath)) {
            file = new MockMultipartFile(
                    "file",
                    filePath.getFileName().toString(),
                    Files.probeContentType(filePath),
                    is
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return file;
    }

    private RegisterLessonCommand createSampleCommand() {
        return new RegisterLessonCommand(
                "백엔드 개발자 멘토링",        // title
                "MENTORING",                 // lessonType
                "주니어 백엔드 개발자를 위한 1:1 멘토링 레슨입니다.", // description
                "서울 강남구",               // location
                "mentor-123",                // mentorId
                1L,                          // categoryId
                Instant.parse("2025-01-31T23:59:59Z"), // closeAt
                null,                        // price (레슨 전체 가격, 필요 없으면 null)
                List.of(
                        new RegisterLessonCommand.Option("30분 멘토링", 30, 30000),
                        new RegisterLessonCommand.Option("60분 멘토링", 60, 55000)
                ),
                List.of(
                        new RegisterLessonCommand.AvailableTime(
                                Instant.parse("2025-01-10T05:00:00Z"),
                                Instant.parse("2025-01-10T07:00:00Z"),
                                50000
                        ),
                        new RegisterLessonCommand.AvailableTime(
                                Instant.parse("2025-01-17T05:00:00Z"),
                                Instant.parse("2025-01-17T07:00:00Z"),
                                50000
                        )
                )
        );
    }

}
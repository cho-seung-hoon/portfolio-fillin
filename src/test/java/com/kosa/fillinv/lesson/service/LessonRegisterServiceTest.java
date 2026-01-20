package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.service.CategoryService;
import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.global.util.UploadFileResult;
import com.kosa.fillinv.lesson.service.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;


@SpringBootTest
@Transactional
@ActiveProfiles("local")
class LessonRegisterServiceTest {

    private static final String LESSON_ID = "lesson-001";
    private static final String OWNER_ID = "member-001";
    @Autowired
    private LessonRegisterService lessonRegisterService;
    @MockitoSpyBean
    private FileStorage fileStorage;
    @MockitoSpyBean
    private LessonService lessonService;
    @MockitoBean
    private CategoryService categoryService;

    private EditLessonCommand defaultCommand() {
        return new EditLessonCommand(
                "수정된 제목",
                "수정된 설명",
                "ONLINE",
                2L,
                Instant.parse("2026-03-01T00:00:00Z")
        );
    }

    @Test
    @DisplayName("썸네일과 함께 강의 등록한다.")
    public void registerLesson() {
        // given
        RegisterLessonCommand command = createSampleCommand();
        MultipartFile file = createSampleFile();

        given(categoryService.getCategoryById(1L))
                .willReturn(new Category(1L, "name", new Category(), "0:1"));

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
        assertThat(createLessonResult.categoryPath()).isEqualTo("0:1");
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

    @Test
    @DisplayName("모든 필드가 주어지면 정상적으로 수정된다")
    void edit_all_fields() {
        // given
        EditLessonCommand command = defaultCommand();

        MockMultipartFile file =
                new MockMultipartFile(
                        "thumbnail",
                        "updated-image.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "fake-image".getBytes()
                );
        UploadFileResult upload =
                new UploadFileResult("lesson/thumbnail.png", "thumbnail.png");

        given(fileStorage.upload(file)).willReturn(upload);

        UpdateLessonResult result = mock(UpdateLessonResult.class);

        ArgumentCaptor<UpdateLessonCommand> captor =
                ArgumentCaptor.forClass(UpdateLessonCommand.class);

        given(lessonService.updateLesson(eq(LESSON_ID), captor.capture(), eq(OWNER_ID)))
                .willReturn(result);

        // when
        lessonRegisterService.editLesson(LESSON_ID, command, file, OWNER_ID);

        // then
        UpdateLessonCommand update = captor.getValue();

        assertThat(update.title()).isEqualTo("수정된 제목");
        assertThat(update.thumbnailImage()).isEqualTo("thumbnail.png");
        assertThat(update.description()).isEqualTo("수정된 설명");
        assertThat(update.location()).isEqualTo("ONLINE");
        assertThat(update.categoryId()).isEqualTo(2L);
        assertThat(update.closeAt())
                .isEqualTo(Instant.parse("2026-03-01T00:00:00Z"));
    }

    @Test
    @DisplayName("파일이 없으면 thumbnail은 null로 전달된다")
    void edit_without_thumbnail() {
        // given
        EditLessonCommand command = defaultCommand();

        UpdateLessonResult result = mock(UpdateLessonResult.class);

        ArgumentCaptor<UpdateLessonCommand> captor =
                ArgumentCaptor.forClass(UpdateLessonCommand.class);

        given(lessonService.updateLesson(eq(LESSON_ID), captor.capture(), eq(OWNER_ID)))
                .willReturn(result);

        // when
        lessonRegisterService.editLesson(LESSON_ID, command, null, OWNER_ID);

        // then
        UpdateLessonCommand update = captor.getValue();

        assertThat(update.thumbnailImage()).isNull();
        verify(fileStorage, never()).upload(any());
    }

    @Test
    @DisplayName("null 필드는 수정되지 않는다")
    void edit_partial_fields() {
        // given
        EditLessonCommand command = new EditLessonCommand(
                null,                       // title 변경 안 함
                "설명만 수정",
                null,                       // location 유지
                null,                       // category 유지
                null                        // closeAt 유지
        );

        ArgumentCaptor<UpdateLessonCommand> captor =
                ArgumentCaptor.forClass(UpdateLessonCommand.class);

        given(lessonService.updateLesson(eq(LESSON_ID), captor.capture(), eq(OWNER_ID)))
                .willReturn(mock(UpdateLessonResult.class));

        // when
        lessonRegisterService.editLesson(LESSON_ID, command, null, OWNER_ID);

        // then
        UpdateLessonCommand update = captor.getValue();

        assertThat(update.title()).isNull();
        assertThat(update.description()).isEqualTo("설명만 수정");
        assertThat(update.location()).isNull();
        assertThat(update.categoryId()).isNull();
        assertThat(update.closeAt()).isNull();
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
                null,
                List.of(
                        new RegisterLessonCommand.Option("30분 멘토링", 30, 30000),
                        new RegisterLessonCommand.Option("60분 멘토링", 60, 55000)
                ),
                List.of(
                        new RegisterLessonCommand.AvailableTime(
                                Instant.parse("2025-01-10T05:00:00Z"),
                                Instant.parse("2025-01-10T07:00:00Z"),
                                50000,
                                null
                        ),
                        new RegisterLessonCommand.AvailableTime(
                                Instant.parse("2025-01-17T05:00:00Z"),
                                Instant.parse("2025-01-17T07:00:00Z"),
                                50000,
                                null
                        )
                )
        );
    }

}
package com.kosa.fillinv.lesson.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosa.fillinv.lesson.controller.dto.EditLessonRequest;
import com.kosa.fillinv.lesson.controller.dto.RegisterLessonRequest;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.service.LessonRegisterService;
import com.kosa.fillinv.lesson.service.dto.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class LessonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LessonRegisterService lessonRegisterService;

    @Test
    @DisplayName("인증된 사용자 이름을 UserDetails에서 읽어 Service 레이어 정상적으로 전달한다.")
    @WithMockUser(username = "member-001")
    void register() throws Exception {
        // given
        RegisterLessonRequest request = new RegisterLessonRequest(
                "Spring 강의",
                "MENTORING",
                "Spring Boot + JPA 실전 강의",
                "ONLINE",
                1L,
                Instant.parse("2026-02-01T23:59:59Z"),
                30000,
                5,
                List.of(),
                List.of()
        );

        MockMultipartFile requestPart =
                new MockMultipartFile(
                        "request",
                        "",
                        MediaType.APPLICATION_JSON_VALUE,
                        objectMapper.writeValueAsBytes(request)
                );

        MockMultipartFile thumbnail =
                new MockMultipartFile(
                        "thumbnail",
                        "image.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "fake-image".getBytes()
                );

        given(lessonRegisterService.registerLesson(
                any(RegisterLessonCommand.class),
                any(MultipartFile.class)
        )).willReturn(defaultResult("lesson-001", "member-001"));

        // when & then
        mockMvc.perform(
                        multipart("/api/v1/lessons")
                                .file(requestPart)
                                .file(thumbnail)
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lessonId")
                        .value("lesson-001"));

        // mentorId가 인증 정보에서 왔는지 검증
        ArgumentCaptor<RegisterLessonCommand> captor =
                ArgumentCaptor.forClass(RegisterLessonCommand.class);

        verify(lessonRegisterService)
                .registerLesson(captor.capture(), any());

        assertThat(captor.getValue().mentorId())
                .isEqualTo("member-001");
    }

    @Test
    @DisplayName("인증된 사용자가 수업을 수정하면 lessonId와 memberId가 Service로 정상 전달된다.")
    @WithMockUser(username = "member-001")
    void editLesson() throws Exception {
        // given
        String lessonId = "lesson-001";

        EditLessonRequest request = new EditLessonRequest(
                "수정된 Spring 강의",
                "내용 수정",
                "OFFLINE",
                2L,
                Instant.parse("2026-03-01T23:59:59Z")
        );

        MockMultipartFile requestPart =
                new MockMultipartFile(
                        "request",
                        "",
                        MediaType.APPLICATION_JSON_VALUE,
                        objectMapper.writeValueAsBytes(request)
                );

        MockMultipartFile thumbnail =
                new MockMultipartFile(
                        "thumbnail",
                        "updated-image.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "fake-image".getBytes()
                );

        given(lessonRegisterService.editLesson(
                any(String.class),
                any(EditLessonCommand.class),
                any(MultipartFile.class),
                any(String.class)
        )).willReturn(defaultUpdateResult(lessonId, "member-001"));

        // when & then
        mockMvc.perform(
                        multipart("/api/v1/lessons/{lessonId}", lessonId)
                                .file(requestPart)
                                .file(thumbnail)
                                .with(req -> {
                                    req.setMethod("PATCH"); // multipart + PATCH
                                    return req;
                                })
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lessonId").value(lessonId));

        // Service로 전달된 값 검증
        ArgumentCaptor<String> lessonIdCaptor =
                ArgumentCaptor.forClass(String.class);

        ArgumentCaptor<EditLessonCommand> commandCaptor =
                ArgumentCaptor.forClass(EditLessonCommand.class);

        ArgumentCaptor<String> memberIdCaptor =
                ArgumentCaptor.forClass(String.class);

        verify(lessonRegisterService).editLesson(
                lessonIdCaptor.capture(),
                commandCaptor.capture(),
                any(MultipartFile.class),
                memberIdCaptor.capture()
        );

        assertThat(lessonIdCaptor.getValue()).isEqualTo(lessonId);
        assertThat(memberIdCaptor.getValue()).isEqualTo("member-001");

        EditLessonCommand command = commandCaptor.getValue();
        assertThat(command.title()).isEqualTo("수정된 Spring 강의");
        assertThat(command.location()).isEqualTo("OFFLINE");
        assertThat(command.categoryId()).isEqualTo(2L);
    }

    public static CreateLessonResult defaultResult(String lessonId, String mentorId) {
        return  new CreateLessonResult(
                lessonId,
                "Spring 백엔드 멘토링",
                LessonType.MENTORING,
                "https://cdn.example.com/thumbnail/lesson-001.png",
                "Spring, JPA, 트랜잭션 중심의 실전 멘토링입니다.",
                "ONLINE",
                mentorId,
                1L,
                "",
                Instant.parse("2026-01-01T10:00:00Z"),
                Instant.parse("2026-01-31T23:59:59Z"),
                50000,
                Instant.parse("2026-01-01T10:00:00Z"),
                null,
                List.of(),
                List.of()
        );
    }

    private UpdateLessonResult defaultUpdateResult(String lessonId, String mentorId) {
        return new UpdateLessonResult(
                lessonId,
                "수정된 Spring 강의",
                LessonType.MENTORING,
                "https://cdn.example.com/thumbnail/lesson-001.png",
                "내용 수정",
                "OFFLINE",
                mentorId,
                2L,
                Instant.parse("2026-03-01T23:59:59Z"),
                Instant.parse("2026-01-01T10:00:00Z"),
                Instant.parse("2026-02-01T10:00:00Z"),
                null
        );
    }

//    @TestConfiguration
//    static class TestJacksonConfig {
//
//        @Bean
//        ObjectMapper objectMapper() {
//            return JsonMapper.builder()
//                    .addModule(new JavaTimeModule())
//                    .build();
//        }
//    }
}
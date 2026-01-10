package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.service.dto.LessonSearchCondition;
import com.kosa.fillinv.lesson.service.dto.LessonThumbnail;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;

import static org.junit.jupiter.api.Assertions.*;

import com.kosa.fillinv.lesson.service.client.MentorSummaryDTO;
import com.kosa.fillinv.lesson.service.client.ProfileClient;
import com.kosa.fillinv.lesson.service.client.ReviewClient;
import com.kosa.fillinv.lesson.service.dto.LessonDTO;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.data.domain.PageImpl;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LessonReadServiceTest {

    private LessonService lessonService;
    private ProfileClient profileClient;
    private ReviewClient reviewClient;

    private LessonReadService lessonReadService;

    @BeforeEach
    void setUp() {
        lessonService = mock(LessonService.class);
        profileClient = mock(ProfileClient.class);
        reviewClient = mock(ReviewClient.class);

        lessonReadService = new LessonReadService(lessonService, reviewClient, profileClient);
    }

    @Test
    @DisplayName("lessonId로 조회한 mentor, review 데이터를 적절하게 매핑한다.")
    void lessonThumbnailTest() {
        // given
        LessonDTO lesson1 = create("lesson-001", "Java 강의",  LessonType.MENTORING,"mentor-001", 1L);
        LessonDTO lesson2 = create("lesson-002", "Spring 강의", LessonType.ONEDAY,"mentor-002", 2L);
        Page<LessonDTO> lessonPage = new PageImpl<>(List.of(lesson1, lesson2));

        when(lessonService.searchLesson(any(LessonSearchCondition.class)))
                .thenReturn(lessonPage);

        // profile mock: mentorId → MentorSummaryDTO
        when(profileClient.getMentors(any(Set.class)))
                .thenReturn(Map.of(
                        "mentor-001", new MentorSummaryDTO("mentor-001", "홍길동"),
                        "mentor-002", new MentorSummaryDTO("mentor-002", "임꺽정")
                ));

        // review mock: lessonId → averageRating
        when(reviewClient.getAverageRating(any(Set.class)))
                .thenReturn(Map.of(
                        "lesson-001", 4.5f,
                        "lesson-002", 3.8f
                ));

        // when
        Page<LessonThumbnail> thumbnails = lessonReadService.search();

        // then
        assertThat(thumbnails).hasSize(2);

        LessonThumbnail t1 = thumbnails.getContent().get(0);
        assertThat(t1.lessonId()).isEqualTo("lesson-001");
        assertThat(t1.mentorNickName()).isEqualTo("홍길동");
        assertThat(t1.rating()).isEqualTo(4.5f);

        LessonThumbnail t2 = thumbnails.getContent().get(1);
        assertThat(t2.lessonId()).isEqualTo("lesson-002");
        assertThat(t2.mentorNickName()).isEqualTo("임꺽정");
        assertThat(t2.rating()).isEqualTo(3.8f);

        // verify 호출 여부
        verify(profileClient, times(1)).getMentors(any(Set.class));
        verify(reviewClient, times(1)).getAverageRating(any(Set.class));
        verify(lessonService, times(1)).searchLesson(any(LessonSearchCondition.class));
    }

    public static LessonDTO create(
            String id,
            String title,
            LessonType lessonType,
            String mentorId,
            Long categoryId
    ) {
        Instant now = Instant.now();

        return new LessonDTO(
                id,
                title,
                lessonType,
                "default-thumbnail.png",        // 기본 썸네일
                "설명 없음",                     // 기본 description
                "온라인",                        // 기본 location
                mentorId,
                categoryId,
                now,                             // createdAt
                now.plusSeconds(3600 * 24),      // closeAt: +1일
                10000,
                now,                             // updatedAt
                null,                             // deletedAt
                Collections.emptyList(),          // availableTimeDTOList
                Collections.emptyList()           // optionDTOList
        );
    }
}
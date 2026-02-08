package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.AvailableTime;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonType;
import com.kosa.fillinv.lesson.entity.Option;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class LessonRepositoryTest {

    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private AvailableTimeRepository availableTimeRepository;
    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void findWithOptionAndAvailableTime() {
        // given
        String lessonId = "lesson-111";
        Lesson lesson = createLesson(lessonId);
        List<Option> optionList = List.of(new Option("option-001", "option1", 30, 1000, lesson));
        List<AvailableTime> availableTimeList = List.of(
                new AvailableTime("at-001", lesson, Instant.now(), Instant.now(), 10000, 1),
                new AvailableTime("at-002", lesson, Instant.now(), Instant.now(), 20000, 2),
                new AvailableTime("at-003", lesson, Instant.now(), Instant.now(), 30000, 3)
        );

        lesson.addAvailableTime(availableTimeList);
        lesson.addOption(optionList);

        lessonRepository.save(lesson);
        entityManager.flush(); entityManager.clear();

        // when
        List<AvailableTime> allByLessonIdAndDeletedAtIsNull = availableTimeRepository.findAllByLessonIdAndDeletedAtIsNull(lessonId);
        List<Option> allByLessonIdAndDeletedAtIsNull1 = optionRepository.findAllByLessonIdAndDeletedAtIsNull(lessonId);

        // then
        assertThat(allByLessonIdAndDeletedAtIsNull.size()).isEqualTo(availableTimeList.size());
        assertThat(allByLessonIdAndDeletedAtIsNull1.size()).isEqualTo(optionList.size());
    }

    private Lesson createLesson(String lessonId) {
        return new Lesson(
                lessonId,
                "title",
                LessonType.ONEDAY,
                "thumbnail.png",
                "테스트 레슨 설명",
                "서울",
                "mentor-1",
                1L,
                "",
                Instant.now().truncatedTo(ChronoUnit.SECONDS).plus(7, ChronoUnit.DAYS),
                10000,
                null
        );
    }
}
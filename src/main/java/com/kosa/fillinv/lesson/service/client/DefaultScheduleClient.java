package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.lesson.service.dto.LessonCountVO;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DefaultScheduleClient implements ScheduleClient {

    private final ScheduleRepository scheduleRepository;

    @Override
    public Map<String, Integer> countByLessonIdInAndStatusIn(
            Collection<String> lessonIds,
            Collection<ScheduleStatus> statuses
    ) {
        return scheduleRepository.countByLessonIdInAndStatusIn(lessonIds, statuses)
                .stream()
                .collect(
                        Collectors.toMap(LessonCountVO::lessonId, vo -> vo.count().intValue())
                );
    }

    @Override
    public Integer countByLessonIdAndStatusIn(String lessonId, Collection<ScheduleStatus> statuses) {
        Long count = scheduleRepository.countByLessonIdAndStatusIn(lessonId, statuses);
        return count != null ? count.intValue() : 0;
    }
}

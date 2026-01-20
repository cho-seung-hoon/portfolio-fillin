package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.schedule.entity.ScheduleStatus;

import java.util.Collection;
import java.util.Map;

public interface ScheduleClient {
    Map<String, Integer> countByLessonIdInAndStatusIn(Collection<String> lessonIds,
            Collection<ScheduleStatus> statuses);

    Integer countByLessonIdAndStatusIn(String lessonId, Collection<ScheduleStatus> statuses);
}

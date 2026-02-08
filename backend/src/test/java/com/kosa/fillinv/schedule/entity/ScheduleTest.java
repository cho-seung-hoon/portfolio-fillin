package com.kosa.fillinv.schedule.entity;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ScheduleTest {

    @Test
    void addSchedule() {
        Schedule schedule = new Schedule();

        ScheduleTime scheduleTime = new ScheduleTime();

        schedule.addScheduleTime(scheduleTime);

        assertThat(scheduleTime.getSchedule()).isEqualTo(schedule);
        assertThat(schedule.getScheduleTimeList()).hasSize(1);
    }

    @Test
    void addMultipleScheduleTime() {
        Schedule schedule = new Schedule();

        List<ScheduleTime> scheduleTimeList = List.of(
                new ScheduleTime(),
                new ScheduleTime(),
                new ScheduleTime()
        );

        schedule.addScheduleTime(scheduleTimeList);

        assertThat(schedule.getScheduleTimeList()).hasSize(3);
        assertThat(schedule.getScheduleTimeList()).containsAll(scheduleTimeList);
        scheduleTimeList.stream().map(ScheduleTime::getSchedule).forEach(s -> assertThat(s).isEqualTo(schedule));
    }
}
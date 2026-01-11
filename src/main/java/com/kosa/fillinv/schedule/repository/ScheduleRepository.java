package com.kosa.fillinv.schedule.repository;

import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, String> {

    //Pageable 방식 - return type을 page로 할 경우 pagenation 처리 가능

    // 스케쥴 상세 조회
    Page<Schedule> findByLessonId(String lessonId, Pageable pageable);

    // 상태 일치 스케쥴 찾기
    Page<Schedule> findByStatus(ScheduleStatus status, Pageable pageable);

    // 멘티 스케쥴 조회
    Page<Schedule> findByMentee(String memberId, Pageable pageable);

    // 멘토 스케쥴 조회
    Page<Schedule> findByMentor(String memberId, Pageable pageable);
}
package com.kosa.fillinv.schedule.repository;

import com.kosa.fillinv.review.dto.UnwrittenReviewVO;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {

    //Pageable 방식 - return type을 page로 할 경우 pagenation 처리 가능

    // 레슨별 스케쥴 목록 조회
    Page<Schedule> findByLessonId(String lessonId, Pageable pageable);

    // 상태 일치 스케쥴 찾기
    Page<Schedule> findByStatus(ScheduleStatus status, Pageable pageable);

    @Query("SELECT new com.kosa.fillinv.review.dto.UnwrittenReviewVO(s.id, s.lessonTitle, s.lessonId, s.optionName, s.createdAt, m.nickname) " +
            "FROM Schedule s " +
            "JOIN Lesson l ON s.lessonId = l.id " +
            "JOIN Member m ON l.mentorId = m.id " +
            "WHERE s.menteeId = :menteeId " +
            "AND s.status = com.kosa.fillinv.schedule.entity.ScheduleStatus.COMPLETED " +
            "AND NOT EXISTS (SELECT r FROM Review r WHERE r.scheduleId = s.id)")
    Page<UnwrittenReviewVO> findUnwrittenReviews(@Param("menteeId") String menteeId, Pageable pageable);

    // 멘티 스케쥴 조회 (Batch Fetch Size가 N+1 문제를 알아서 최적화)
    Page<Schedule> findByMenteeId(String memberId, Pageable pageable);

    // 멘토 스케쥴 조회 (Batch Fetch Size가 N+1 문제를 알아서 최적화)
    Page<Schedule> findByMentorId(String memberId, Pageable pageable);
}

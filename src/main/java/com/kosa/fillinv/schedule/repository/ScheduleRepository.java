package com.kosa.fillinv.schedule.repository;

import com.kosa.fillinv.lesson.service.dto.LessonCountVO;
import com.kosa.fillinv.review.dto.UnwrittenReviewVO;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

import java.time.Instant;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {


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

    // 멤버(멘토 또는 멘티) 관련 스케쥴을 필터링하여 조회 (시작 시간으로 오름차순 정렬)
    @Query("SELECT s FROM Schedule s " +
            "LEFT JOIN s.scheduleTimeList st " +
            "WHERE (s.mentorId = :memberId OR s.menteeId = :memberId) " + // 스케쥴의 멘토나 멘티가 로그인한 사람의 경우를 찾기
            "AND (:title IS NULL OR s.lessonTitle LIKE %:title%) " + // 제목 필터
            "AND (:start IS NULL OR st.startTime >= :start) " + // 시작 지점 조건
            "AND (:end IS NULL OR st.startTime < :end) " + // 종료 지점 조건
            "AND (:status IS NULL OR s.status = :status)")
    // 기본 정렬 (과거 조회의 경우 Pageable에서 DESC)
    Page<Schedule> findAllByMemberIdWithFilter(
            @Param("memberId") String memberId,
            @Param("title") String title,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("status") ScheduleStatus status,
            Pageable pageable
    );

    ScheduleStatus status(ScheduleStatus status);

    @Query("SELECT new com.kosa.fillinv.lesson.service.dto.LessonCountVO(s.lessonId, COUNT(s)) " +
            "FROM Schedule s " +
            "WHERE s.lessonId IN :lessonIds AND s.status IN :statuses " +
            "GROUP BY s.lessonId")
    List<LessonCountVO> countByLessonIdInAndStatusIn(@Param("lessonIds") Collection<String> lessonIds, @Param("statuses") Collection<ScheduleStatus> statuses);

    Long countByLessonIdAndStatusIn(String lessonId, Collection<ScheduleStatus> statuses);

    @Query("SELECT s.lessonId, COUNT(s) FROM Schedule s JOIN Lesson l ON s.lessonId = l.id WHERE s.createdAt >= :startDate AND s.deletedAt IS NULL AND l.deletedAt IS NULL GROUP BY s.lessonId")
    List<Object[]> countByLessonIdAndCreatedAtAfter(@Param("startDate") Instant startDate);
}

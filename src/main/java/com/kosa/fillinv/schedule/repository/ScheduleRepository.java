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

    // 멘티 스케쥴 + 시간 목록 조회 (N+1 문제 해결용) / JOIN FETCH를 사용해 스케쥴 s와 연결된 시간 목록 scheduleTimeList을 한 번에 가져옴 (근데 s.menteeId = :memberId 즉 멤버 아이디가 일치하는 값만)
    // JOIN FETCH 하면서 Pageable 사용 시, Spring Data JPA의 한계로 인해 distinct를 사용해야 함
    @Query("SELECT s FROM Schedule s JOIN FETCH s.scheduleTimeList WHERE s.menteeId = :memberId")
    Page<Schedule> findByMenteeIdWithTimes(String memberId, Pageable pageable);

    // 멘토 스케쥴 + 시간 목록 조회 (N+1 문제 해결용)
    @Query("SELECT s FROM Schedule s JOIN FETCH s.scheduleTimeList WHERE s.mentorId = :memberId")
    Page<Schedule> findByMentorIdWithTimes(String memberId, Pageable pageable);
}

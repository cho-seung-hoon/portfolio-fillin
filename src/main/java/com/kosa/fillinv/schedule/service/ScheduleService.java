package com.kosa.fillinv.schedule.service;

import com.kosa.fillinv.global.exception.BusinessException;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.schedule.dto.request.ScheduleCreateRequest;
import com.kosa.fillinv.schedule.entity.Schedule;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true) // 기본적으로 모든 메서드는 읽기 전용 트랜잭션으로 동작
@RequiredArgsConstructor // final이 붙은 필드의 생성자를 자동으로 생성
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final LessonRepository lessonRepository;

    // 스케쥴 생성
    @Transactional
    public void createSchedule(String memberId, String lessonId, ScheduleCreateRequest request) {
        // 레슨 조회
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new BusinessException(ErrorCode.LESSON_NOT_FOUND));

        // Factory Method를 통한 스케쥴 생성
        schedule schedule = Schedule.create(lesson, request, memberId);

        scheduleRepository.save(schedule);
    }

    // 스케쥴 상세 조회
    // 제목, 상태, 페이지, 오늘 기준(true일 경우 오늘 이후 스케쥴), 오름차순

    // 상태 일치 스케쥴 조회(결제 대기, 승인 대기, 승인, 취소, 완료)

//    // 사용자는 멘토랑 멘티의 역할 구분 없이 원하면 두가지 기능을 모두 사용 가능
//    // 수강 신청한 스케쥴 목록 조회(단건 / 멘티 모드) - get
//    public Page<ScheduleReponse> getMenteeSchedules(String memberId, Pageable pageable) {
//        // DB에서 사용자의 ID가 적힌 스케쥴 전부 찾기
//        Page<Schedule> schedules = scheduleRepository.findByMentee(memberId, pageable);
//        // entity -> dto 변환
//        return schedules.map(ScheduleListResponse::from);
//    }
//
//    // 가르치는 수업의 스케쥴 목록 조회(단건 / 멘토 모드) - get
//    public Page<ScheduleResponse> getMentorSchedules(String memberId, Pageable pageable) {
//        // DB에서 사용자가 멘토인 수업에 달린 스케쥴 전부 찾기
//        Page<Schedule> schedules = scheduleRepository.findByMentor(memberId, pageable);
//        return schedules.map(ScheduleListResponse::from);
//    }
}

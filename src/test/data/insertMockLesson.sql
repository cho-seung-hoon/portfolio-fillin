use fillinv;

INSERT INTO lessons (
    lesson_id,
    title,
    lesson_type,
    thumbnail_image,
    description,
    location,
    close_at,
    created_at,
    mentor_id,
    category_id,
    price
) VALUES
-- MENTORING / category 1
('lesson-001', 'Spring 백엔드 1:1 멘토링', 'MENTORING',
 'thumb1.png', 'Spring 기반 백엔드 개발 멘토링',
 '서울 강남',
 '2026-03-01 00:00:00',
 '2026-01-01 09:00:00',
 'mentor-001', 1, 50000),

-- MENTORING / category 2
('lesson-002', 'Java 취업 면접 멘토링', 'MENTORING',
 'thumb2.png', 'Java 백엔드 면접 대비 멘토링',
 '서울 판교',
 '2026-03-03 00:00:00',
 '2026-01-02 09:00:00',
 'mentor-002', 2, 55000),

-- MENTORING / category 3
('lesson-003', '백엔드 커리어 1:1 멘토링', 'MENTORING',
 'thumb3.png', '백엔드 개발자 커리어 상담',
 NULL,
 '2026-03-05 00:00:00',
 '2026-01-03 09:00:00',
 'mentor-003', 3, 45000),

-- ONEDAY / category 1
('lesson-004', 'Spring Boot 원데이 클래스', 'ONEDAY',
 'thumb4.png', 'Spring Boot 핵심 기능 실습',
 '서울 홍대',
 '2026-03-07 00:00:00',
 '2026-01-04 09:00:00',
 'mentor-001', 1, 30000),

-- ONEDAY / category 2
('lesson-005', 'Java 컬렉션 원데이 클래스', 'ONEDAY',
 'thumb5.png', 'Java 컬렉션 프레임워크 집중 학습',
 '서울 잠실',
 '2026-03-09 00:00:00',
 '2026-01-05 09:00:00',
 'mentor-002', 2, 28000),

-- ONEDAY / category 3
('lesson-006', '백엔드 프로젝트 원데이 실습', 'ONEDAY',
 'thumb6.png', '간단한 백엔드 프로젝트 실습',
 '서울 종로',
 '2026-03-11 00:00:00',
 '2026-01-06 09:00:00',
 'mentor-003', 3, 32000),

-- STUDY / category 1
('lesson-007', 'Spring 백엔드 스터디', 'STUDY',
 'thumb7.png', 'Spring 기반 백엔드 스터디 모임',
 '서울 강남',
 '2026-03-13 00:00:00',
 '2026-01-07 09:00:00',
 'mentor-004', 1, 20000),

-- STUDY / category 2
('lesson-008', 'Java 알고리즘 스터디', 'STUDY',
 'thumb8.png', 'Java로 코딩 테스트 대비 스터디',
 '서울 신촌',
 '2026-03-15 00:00:00',
 '2026-01-08 09:00:00',
 'mentor-005', 2, 18000),

-- STUDY / category 3
('lesson-009', '백엔드 면접 스터디', 'STUDY',
 'thumb9.png', '백엔드 개발자 면접 대비 스터디',
 NULL,
 '2026-03-17 00:00:00',
 '2026-01-09 09:00:00',
 'mentor-006', 3, 22000),

-- 혼합 검색용
('lesson-010', 'Spring 프로젝트 실전 스터디', 'STUDY',
 'thumb10.png', 'Spring 기반 실전 프로젝트 스터디',
 '서울 성수',
 '2026-03-19 00:00:00',
 '2026-01-10 09:00:00',
 'mentor-004', 1, 25000),

('lesson-011', 'Java 백엔드 원데이 특강', 'ONEDAY',
 'thumb11.png', 'Java 백엔드 핵심 요약 강의',
 NULL,
 '2026-03-21 00:00:00',
 '2026-01-11 09:00:00',
 'mentor-002', 2, 27000),

('lesson-012', '백엔드 개발자 멘토링 클래스', 'MENTORING',
 'thumb12.png', '백엔드 개발자 성장 멘토링',
 '서울 여의도',
 '2026-03-23 00:00:00',
 '2026-01-12 09:00:00',
 'mentor-001', 3, 60000);
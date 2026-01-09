INSERT INTO lessons (
    lesson_id,
    lesson_type,
    thumbnail_image,
    description,
    location,
    created_at,
    close_at,
    updated_at,
    deleted_at,
    mentor_id,
    category_id
) VALUES
      ('lesson-001', 'MENTORING', '/img/lesson1.png', '1:1 자바 기초 수업', '서울', NOW(), NULL, NULL, NULL, 'mentor-001', 1),
      ('lesson-002', 'ONEDAY', '/img/lesson2.png', 'Spring Boot 입문', '부산', NOW(), NULL, NULL, NULL, 'mentor-002', 2),
      ('lesson-003', 'MENTORING', '/img/lesson3.png', 'JPA 실전 활용', '온라인', NOW(), NULL, NULL, NULL, 'mentor-001', 2),
      ('lesson-004', 'ONEDAY', '/img/lesson4.png', '데이터베이스 설계', '서울', NOW(), NULL, NULL, NULL, 'mentor-003', 3),
      ('lesson-005', 'MENTORING', '/img/lesson5.png', '운영체제 핵심 정리', '온라인', NOW(), NULL, NULL, NULL, 'mentor-004', 4),

      ('lesson-006', 'ONEDAY', '/img/lesson6.png', '네트워크 기초', '대구', NOW(), NULL, NULL, NULL, 'mentor-005', 4),
      ('lesson-007', 'MENTORING', '/img/lesson7.png', '면접 대비 CS 특강', '온라인', NOW(), NULL, NULL, NULL, 'mentor-002', 5),
      ('lesson-008', 'ONEDAY', '/img/lesson8.png', 'Spring Security 실습', '서울', NOW(), NULL, NULL, NULL, 'mentor-001', 2),
      ('lesson-009', 'MENTORING', '/img/lesson9.png', 'JWT 인증 구현', '온라인', NOW(), NULL, NULL, NULL, 'mentor-003', 2),
      ('lesson-010', 'ONEDAY', '/img/lesson10.png', '대용량 트래픽 처리', '서울', NOW(), NULL, NULL, NULL, 'mentor-004', 6),

      ('lesson-011', 'MENTORING', '/img/lesson11.png', 'Redis 실전 사용법', '온라인', NOW(), NULL, NULL, NULL, 'mentor-005', 6),
      ('lesson-012', 'STUDY', '/img/lesson12.png', 'MySQL 인덱스 튜닝', '서울', NOW(), NULL, NULL, NULL, 'mentor-001', 3),
      ('lesson-013', 'MENTORING', '/img/lesson13.png', '클린 코드 리뷰', '온라인', NOW(), NULL, NULL, NULL, 'mentor-002', 7),
      ('lesson-014', 'STUDY', '/img/lesson14.png', 'DDD 기초', '부산', NOW(), NULL, NULL, NULL, 'mentor-003', 7),
      ('lesson-015', 'MENTORING', '/img/lesson15.png', '테스트 코드 작성법', '온라인', NOW(), NULL, NULL, NULL, 'mentor-004', 8),

      ('lesson-016', 'STUDY', '/img/lesson16.png', 'JUnit & Mockito', '서울', NOW(), NULL, NULL, NULL, 'mentor-005', 8),
      ('lesson-017', 'MENTORING', '/img/lesson17.png', 'REST API 설계', '온라인', NOW(), NULL, NULL, NULL, 'mentor-001', 9),
      ('lesson-018', 'STUDY', '/img/lesson18.png', 'MSA 아키텍처 개론', '서울', NOW(), NULL, NULL, NULL, 'mentor-002', 10),
      ('lesson-019', 'MENTORING', '/img/lesson19.png', '이력서 코드 리뷰', '온라인', NOW(), NULL, NULL, NULL, 'mentor-003', 5),
      ('lesson-020', 'STUDY', '/img/lesson20.png', '실무 프로젝트 코칭', '서울', NOW(), NULL, NULL, NULL, 'mentor-004', 10);
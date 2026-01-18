-- 1. 제약 조건 체크 일시 해제 (초기화 및 대량 삽입용)
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 기존 테이블 삭제 (존재할 경우)
# DROP TABLE IF EXISTS schedules;
# DROP TABLE IF EXISTS available_times;
# DROP TABLE IF EXISTS options;
# DROP TABLE IF EXISTS lessons;
# DROP TABLE IF EXISTS categories;
# DROP TABLE IF EXISTS members;

-- 4. 기초 데이터 삽입
INSERT INTO categories (category_id, name)
VALUES (1, '프로그래밍');

INSERT INTO members (member_id, nickname, phone_num, email, password, created_at, updated_at)
VALUES ('14', '마스터멘토', '010-1414-1414', 'mentor14@test.com', '1234', NOW(), NOW()),
       ('13', '열공멘티', '010-1313-1313', 'mentee13@test.com', '1234', NOW(), NOW());


-- 5. 레슨 관련 데이터 삽입
INSERT INTO lessons (lesson_id, title, lesson_type, thumbnail_image, description, location, mentor_id, category_id,
                     price, created_at, updated_at)
VALUES ('L12', '예비 백엔드 개발자를 위한 커피챗', 'MENTORING', 'java.png', '백엔드 포트폴리오 첨삭 및 상담', '온라인', '14', 1, 30000, NOW(), NOW());

INSERT INTO options (option_id, lesson_id, name, minute, price, created_at, updated_at)
VALUES ('OPT-12', 'L12', '기본 80분', 80, 30000, NOW(), NOW());

INSERT INTO available_times (available_time_id, lesson_id, price, start_time, end_time, created_at, updated_at)
VALUES ('AT-12', 'L12', 25000, '2026-02-20 09:00:00', '2026-02-20 22:00:00', NOW(), NOW());

-- 6. 스케줄 데이터 삽입
INSERT INTO schedules (schedule_id, lesson_id, option_id, available_time_id,
                       mentee_id, lesson_mentor_id,
                       mentor_nickname,
                       status,
                       lesson_title, lesson_type, lesson_description, lesson_location, lesson_category_name,
                       option_name, option_minute, price,
                       created_at, updated_at)
VALUES ('12', 'L12', 'OPT-12', 'AT-12',
        '13', '14', '마스터멘토',
        'APPROVED',
        '예비 백엔드 개발자를 위한 커피챗', 'MENTORING', '백엔드 포트폴리오 첨삭 및 상담', '온라인', '프로그래밍',
        '기본 80분', 80, 30000,
        NOW(), NOW());
INSERT INTO schedule_times(schedule_time_id, schedule_id, start_time, end_time)
VALUES (UUID(), '12', '2026-02-20 10:00:00', '2026-02-20 11:00:00');

-- 7. 제약 조건 체크 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;
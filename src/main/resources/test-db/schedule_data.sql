INSERT INTO schedules (schedule_id,
                       lesson_id,
                       date,
                       start_time,
                       end_time,
                       status,

    -- [Snapshot] 레슨 정보
                       lesson_title,
                       lesson_type,
                       lesson_description,
                       lesson_location,
                       lesson_category_name,
                       lesson_mentor_id,

    -- [Snapshot] 옵션 정보
                       option_name,
                       option_minute,
                       price,
                       created_at,
                       updated_at)
VALUES ('SCH-20260112-001',
        '1',
        '2026-02-01',
        '10:00:00', -- (날짜 제외) 시간
        '11:20:00',
        'APPROVED',

           -- 레슨 정보 스냅샷
        '예비 백엔드 개발자를 위한 커피챗',
        'MENTORING',
        '백엔드 포트폴리오 첨삭 및 상담',
        '강남역 인근 카페',
        '백엔드',
        '2', -- 이전에 넣은 멘토 ID

           -- 옵션 정보 스냅샷
        '기본 1회권',
        80, -- (1시간 20분 = 80분)
        25000,
        NOW(),
        NOW());
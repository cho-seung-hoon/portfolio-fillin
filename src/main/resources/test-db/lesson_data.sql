-- 레슨 데이터 생성
INSERT INTO lessons (lesson_id,
                     mentor_id,
                     title,
                     price,
                     description,
                     created_at,
                     updated_at,
                     category_id,
                     lesson_type,
                     thumbnail_image,
                     location)

VALUES (1, 2, '예비 백엔드 개발자를 위한 커피챗', 25000,
        '백엔드 개발자 취업/이직을 위한 포트폴리오 첨삭과 진로 상담을 진행합니다. 현업에서의 경험을 바탕으로 현실적인 조언을 드립니다. (총 진행 시간: 1시간 20분)', NOW(), NOW(), 1,
        'MENTORING',
        'mentoring.jpg', NULL);
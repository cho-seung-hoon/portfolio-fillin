-- [1] 대분류 삽입 (ID 1 ~ 20)
INSERT INTO categories (category_id, name, parent_category_id) VALUES
    (1000, ' ', NULL),(1, '경영·비즈니스', NULL), (2, '서비스기획·운영', NULL), (3, '개발', NULL), (4, '디자인', NULL),
    (5, '데이터·AI', NULL), (6, '마케팅·광고', NULL), (7, '영업', NULL), (8, '미디어·문화·스포츠', NULL),
    (9, '금융·보험', NULL), (10, '연구·R&D', NULL), (11, '교육', NULL), (12, '공공·복지', NULL),
    (13, '건설·건축', NULL), (14, '제조·생산', NULL), (15, '의료·바이오', NULL), (16, '상품기획·MD', NULL),
    (17, '인사·노무·HRD', NULL), (18, '유통·물류·무역', NULL), (19, '회계·세무·재무', NULL), (20, '사무·법무·총무', NULL);

-- [2] 모든 소분류 전수 삽입
-- 1. 경영·비즈니스 (A)
INSERT INTO categories (name, parent_category_id) VALUES ('경영지원', 1), ('비서', 1), ('총무', 1), ('법무', 1), ('사업개발', 1), ('전략기획', 1), ('경영기획', 1), ('오피스 매니저', 1), ('CSR', 1);
-- 2. 서비스기획·운영 (B)
INSERT INTO categories (name, parent_category_id) VALUES ('서비스 기획자', 2), ('PM·PO', 2), ('운영 매니저', 2), ('콘텐츠 기획', 2), ('고객 경험(CX) 기획', 2), ('전시 기획', 2);
-- 3. 개발 (C)
INSERT INTO categories (name, parent_category_id) VALUES ('서버 개발자', 3), ('백엔드 개발자', 3), ('프론트엔드 개발자', 3), ('웹 풀스택 개발자', 3), ('안드로이드 개발자', 3), ('iOS 개발자', 3), ('크로스플랫폼 앱 개발자', 3), ('게임 개발자', 3), ('데브옵스·인프라', 3), ('보안 전문가', 3), ('QA·테스트 엔지니어', 3), ('임베디드 개발자', 3), ('블록체인 개발자', 3), ('DBA', 3), ('기술 지원', 3);
-- 4. 디자인 (D)
INSERT INTO categories (name, parent_category_id) VALUES ('UI/UX 디자이너', 4), ('그래픽 디자이너', 4), ('프로덕트 디자이너', 4), ('브랜드 디자이너', 4), ('영상·모션 디자이너', 4), ('웹 디자이너', 4), ('패키지 디자이너', 4), ('3D 디자이너', 4), ('일러스트레이터', 4), ('공간 디자이너', 4), ('패션 디자이너', 4);
-- 5. 데이터·AI (E)
INSERT INTO categories (name, parent_category_id) VALUES ('데이터 분석가', 5), ('데이터 엔지니어', 5), ('데이터 사이언티스트', 5), ('머신러닝 엔지니어', 5), ('딥러닝 엔지니어', 5), ('AI 리서처', 5), ('BI 엔지니어', 5), ('데이터 거버넌스', 5);
-- 6. 마케팅·광고 (F)
INSERT INTO categories (name, parent_category_id) VALUES ('콘텐츠 마케터', 6), ('퍼포먼스 마케터', 6), ('브랜드 마케터', 6), ('그로스 마케터', 6), ('디지털 마케터', 6), ('소셜 마케터', 6), ('PR/홍보', 6), ('카피라이터', 6), ('광고 기획자(AE)', 6), ('CRM 마케터', 6);
-- 7. 영업 (G)
INSERT INTO categories (name, parent_category_id) VALUES ('기업 영업(B2B)', 7), ('개인 영업(B2C)', 7), ('기술 영업', 7), ('해외 영업', 7), ('영업 관리', 7), ('인사이드 세일즈', 7), ('솔루션 컨설턴트', 7);
-- 8. 미디어·문화·스포츠 (H)
INSERT INTO categories (name, parent_category_id) VALUES ('PD/연출', 8), ('영상 편집자', 8), ('에디터', 8), ('기자', 8), ('작가', 8), ('스포츠 마케팅', 8), ('음악 PD', 8), ('아티스트 매니저', 8);
-- 9. 금융·보험 (I)
INSERT INTO categories (name, parent_category_id) VALUES ('은행원', 9), ('자산운용가', 9), ('애널리스트', 9), ('투자 심사역', 9), ('보험 계리사', 9), ('손해 사정사', 9), ('트레이더', 9), ('준법감시인', 9);
-- 10. 연구·R&D (J)
INSERT INTO categories (name, parent_category_id) VALUES('반도체 설계', 10), ('회로 설계', 10), ('기구 설계', 10), ('화학 연구원', 10), ('바이오 연구원', 10), ('재료 연구원', 10), ('광학 엔지니어', 10);
-- 11. 교육 (K)
INSERT INTO categories (name, parent_category_id) VALUES ('교육 기획', 11), ('커리큘럼 설계', 11), ('교사/강사', 11), ('교육 운영', 11), ('학습 관리', 11);
-- 15. 의료·바이오 (O)
INSERT INTO categories (name, parent_category_id) VALUES ('간호사', 15), ('의사', 15), ('임상병리사', 15), ('방사선사', 15), ('약사', 15), ('수의사', 15), ('심리상담사', 15);
-- 17. 인사·노무·HRD (Q)
INSERT INTO categories (name, parent_category_id) VALUES ('HRM(인사관리)', 17), ('HRD(인사교육)', 17), ('채용 담당자', 17), ('노무사', 17), ('조직문화 담당자', 17), ('평가/보상 담당', 17);
-- 18. 유통·물류·무역 (P)
INSERT INTO categories (name, parent_category_id) VALUES ('물류 관리', 18), ('유통 관리', 18), ('SCM', 18), ('무역 사무', 18), ('구매 담당', 18), ('창고 관리', 18), ('포워딩', 18);
-- 19. 회계·세무·재무 (S)
INSERT INTO categories (name, parent_category_id) VALUES ('재무 회계', 19), ('관리 회계', 19), ('세무사', 19), ('자금 관리', 19), ('내부 감사', 19), ('IR(투자자 관계)', 19), ('원가 관리', 19);
-- 20. 사무·법무·총무 (T)
INSERT INTO categories (name, parent_category_id) VALUES ('일반 사무', 20), ('행정 보조', 20), ('법무 사무', 20), ('특허 담당', 20), ('속기사', 20);

-- [3] 회원 (Members) 삽입
-- 비밀번호: password123 ($2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9)
INSERT INTO members (member_id, nickname, phone_num, email, password, created_at, updated_at) VALUES
    ('mentor01', '백엔드장인', '010-1111-1111', 'mentor01@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentor02', '디자인한스푼', '010-2222-2222', 'mentor02@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentor03', '마케팅천재', '010-3333-3333', 'mentor03@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentor04', '데이터분석가', '010-4444-4444', 'mentor04@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentee01', '코딩초보', '010-5555-5555', 'mentee01@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentee02', '취준생A', '010-6666-6666', 'mentee02@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentee03', '이직희망자', '010-7777-7777', 'mentee03@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW()),
    ('mentee04', '열정가득', '010-8888-8888', 'mentee04@test.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uyzRnyPBqlZ8mx9X9.f9fT9Yy.f9fT9', NOW(), NOW());

-- [4] 프로필 (Profiles) 삽입
INSERT INTO profiles (member_id, introduce, category_id, created_at, updated_at) VALUES
    ('mentor01', '10년차 백엔드 개발자입니다. Java/Spring 전문입니다.', 3, NOW(), NOW()),
    ('mentor02', '사용자 경험을 중시하는 UI/UX 디자이너입니다.', 4, NOW(), NOW()),
    ('mentor03', '데이터 기반의 퍼포먼스 마케팅 노하우를 공유합니다.', 6, NOW(), NOW()),
    ('mentor04', '복잡한 데이터를 인사이트로 바꾸는 분석가입니다.', 5, NOW(), NOW()),
    ('mentee01', '기초부터 탄탄히 배우고 싶습니다.', 1000, NOW(), NOW()),
    ('mentee02', '포트폴리오 완성이 목표입니다.', 1000, NOW(), NOW()),
    ('mentee03', '실무 역량을 키우고 싶습니다.', 1000, NOW(), NOW()),
    ('mentee04', '다양한 분야에 관심이 많습니다.', 1000, NOW(), NOW());

-- [5] 레슨 (Lessons) 삽입
INSERT INTO lessons (lesson_id, title, lesson_type, thumbnail_image, description, location, mentor_id, category_id, price, created_at, updated_at) VALUES
    ('lesson01', '백엔드 실무 아키텍처 가이드', 'MENTORING', '/resources/files/lesson01.png', '대규모 트래픽 처리를 위한 설계를 배웁니다.', '서울 강남구', 'mentor01', 3, 70000, NOW(), NOW()),
    ('lesson02', 'UI/UX 포트폴리오 1:1 리모델링', 'MENTORING', '/resources/files/lesson02.png', '매력적인 포트폴리오로 취업 성공하기!', '서울 신촌', 'mentor02', 4, 60000, NOW(), NOW()),
    ('lesson03', '초보자를 위한 GA4 데이터 분석', 'ONEDAY', '/resources/files/lesson03.png', '구글 애널리틱스 기초를 하루만에 마스터하세요.', '온라인', 'mentor04', 5, 40000, NOW(), NOW()),
    ('lesson04', '인스타그램 광고 전략 4주 스터디', 'STUDY', '/resources/files/lesson04.png', '효율적인 광고 집행을 위한 집중 스터디입니다.', '서울 홍대', 'mentor03', 6, 120000, NOW(), NOW()),
    ('lesson05', 'Java 멀티쓰레딩 심화 클래스', 'ONEDAY', '/resources/files/lesson05.png', '병렬 프로그래밍의 핵심 개념을 정리합니다.', '서울 역삼', 'mentor01', 3, 50000, NOW(), NOW()),
    ('lesson06', '파이썬 데이터 시각화 프로젝트', 'STUDY', '/resources/files/lesson06.png', '시각화 라이브러리를 활용한 프로젝트 실습!', '온라인', 'mentor04', 5, 100000, NOW(), NOW());

-- [6] 레슨 옵션 (Options) 삽입
INSERT INTO options (option_id, name, minute, price, lesson_id, created_at, updated_at) VALUES
    ('opt01', '기본 상담 (1시간)', 60, 70000, 'lesson01', NOW(), NOW()),
    ('opt02', '심층 멘토링 (2시간)', 120, 130000, 'lesson01', NOW(), NOW()),
    ('opt03', '커리어 로드맵 컨설팅', 90, 100000, 'lesson02', NOW(), NOW());

-- [7] 예약 가능 시간 (AvailableTimes) 삽입
INSERT INTO available_times (available_time_id, lesson_id, start_time, end_time, price, created_at, updated_at) VALUES
    ('time01', 'lesson03', '2026-03-01 10:00:00', '2026-03-01 13:00:00', 40000, NOW(), NOW()),
    ('time02', 'lesson03', '2026-03-02 19:00:00', '2026-03-02 22:00:00', 40000, NOW(), NOW()),
    ('time03', 'lesson05', '2026-03-05 14:00:00', '2026-03-05 18:00:00', 50000, NOW(), NOW());

-- [8] 스케줄/예약 (Schedules) 및 상세 시간 (ScheduleTimes) 삽입
-- 예시 1: 완료된 멘토링
INSERT INTO schedules (schedule_id, status, request_content, lesson_title, lesson_type, lesson_description, lesson_location, lesson_category_name, mentor_nickname, price, lesson_id, mentee_id, lesson_mentor_id, option_id, created_at, updated_at) VALUES
    ('sch01', 'COMPLETED', '포트폴리오 피드백 부탁드려요.', 'UI/UX 포트폴리오 1:1 리모델링', 'MENTORING', '매력적인 포트폴리오로 취업 성공하기!', '서울 신촌', '디자인', '디자인한스푼', 100000, 'lesson02', 'mentee02', 'mentor02', 'opt03', '2026-01-05 14:00:00', NOW());

-- 예시 2: 승인된 원데이 클래스
INSERT INTO schedules (schedule_id, status, request_content, lesson_title, lesson_type, lesson_description, lesson_location, lesson_category_name, mentor_nickname, price, lesson_id, mentee_id, lesson_mentor_id, available_time_id, created_at, updated_at) VALUES
    ('sch02', 'APPROVED', '로그 분석 기초가 궁금해요.', '초보자를 위한 GA4 데이터 분석', 'ONEDAY', '구글 애널리틱스 기초를 하루만에 마스터하세요.', '온라인', '데이터·AI', '데이터분석가', 40000, 'lesson03', 'mentee01', 'mentor04', 'time01', '2026-01-14 10:00:00', NOW());

-- 예시 3: 취소된 예약
INSERT INTO schedules (schedule_id, status, request_content, lesson_title, lesson_type, lesson_description, lesson_location, lesson_category_name, mentor_nickname, price, lesson_id, mentee_id, lesson_mentor_id, created_at, updated_at) VALUES
    ('sch03', 'CANCELED', '개인 사정으로 취소합니다.', 'Java 멀티쓰레딩 심화 클래스', 'ONEDAY', '병렬 프로그래밍의 핵심 개념을 정리합니다.', '서울 역삼', '개발', '백엔드장인', 50000, 'lesson05', 'mentee03', 'mentor01', '2026-01-12 11:00:00', NOW());

-- 예시 4: 스터디 (다중 시간 지원)
INSERT INTO schedules (schedule_id, status, request_content, lesson_title, lesson_type, lesson_description, lesson_location, lesson_category_name, mentor_nickname, price, lesson_id, mentee_id, lesson_mentor_id, created_at, updated_at) VALUES
    ('sch04', 'APPROVED', '마케팅 실무를 배우고 싶습니다.', '인스타그램 광고 전략 4주 스터디', 'STUDY', '효율적인 광고 집행을 위한 집중 스터디입니다.', '서울 홍대', '마케팅·광고', '마케팅천재', 120000, 'lesson04', 'mentee04', 'mentor03', '2026-01-15 09:00:00', NOW());

INSERT INTO schedule_times (schedule_time_id, schedule_id, start_time, end_time) VALUES
    ('st01', 'sch04', '2026-04-01 19:00:00', '2026-04-01 21:00:00'),
    ('st02', 'sch04', '2026-04-08 19:00:00', '2026-04-08 21:00:00'),
    ('st03', 'sch04', '2026-04-15 19:00:00', '2026-04-15 21:00:00'),
    ('st04', 'sch04', '2026-04-22 19:00:00', '2026-04-22 21:00:00');

-- [9] 리뷰 (Reviews) 삽입
INSERT INTO reviews (review_id, score, content, writer_id, lesson_id, schedule_id, created_at, updated_at) VALUES
    ('rev01', 5, '진짜 도움 많이 됐어요! 강추합니다.', 'mentee02', 'lesson02', 'sch01', NOW(), NOW()),
    ('rev02', 4, '내용이 알차고 설명이 친절하세요.', 'mentee03', 'lesson02', 'sch01', NOW(), NOW()),
    ('rev03', 5, '백엔드 아키텍처 궁금했는데 시원하게 해결됐습니다.', 'mentee01', 'lesson01', 'sch01', NOW(), NOW());
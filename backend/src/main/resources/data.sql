create table categories (
                            category_id BIGINT NOT NULL AUTO_INCREMENT,
                            name VARCHAR(100) NOT NULL,
                            parent_category_id BIGINT NULL,
                            category_path VARCHAR(255) NOT NULL,

                            PRIMARY KEY (category_id),

                            CONSTRAINT fk_categories_parent
                                FOREIGN KEY (parent_category_id)
                                    REFERENCES categories (category_id)
                                    ON DELETE SET NULL
);

INSERT INTO categories (category_id, name, parent_category_id, category_path)
VALUES (1000, ' ', NULL, '1000'),
       (1, '경영·비즈니스', NULL, '1'),
       (2, '서비스기획·운영', NULL, '2'),
       (3, '개발', NULL, '3'),
       (4, '디자인', NULL, '4'),
       (5, '데이터·AI', NULL, '5'),
       (6, '마케팅·광고', NULL, '6'),
       (7, '영업', NULL, '7'),
       (8, '미디어·문화·스포츠', NULL, '8'),
       (9, '금융·보험', NULL, '9'),
       (10, '연구·R&D', NULL, '10'),
       (11, '교육', NULL, '11'),
       (12, '공공·복지', NULL, '12'),
       (13, '건설·건축', NULL, '13'),
       (14, '제조·생산', NULL, '14'),
       (15, '의료·바이오', NULL, '15'),
       (16, '상품기획·MD', NULL, '16'),
       (17, '인사·노무·HRD', NULL, '17'),
       (18, '유통·물류·무역', NULL, '18'),
       (19, '회계·세무·재무', NULL, '19'),
       (20, '사무·법무·총무', NULL, '20');

INSERT INTO categories (name, parent_category_id, category_path)
VALUES
-- 1. 경영·비즈니스
('경영지원', 1, ''),
('비서', 1, ''),
('총무', 1, ''),
('법무', 1, ''),
('사업개발', 1, ''),
('전략기획', 1, ''),
('경영기획', 1, ''),
('오피스 매니저', 1, ''),
('CSR', 1, ''),

-- 2. 서비스기획·운영
('서비스 기획자', 2, ''),
('PM·PO', 2, ''),
('운영 매니저', 2, ''),
('콘텐츠 기획', 2, ''),
('고객 경험(CX) 기획', 2, ''),
('전시 기획', 2, ''),

-- 3. 개발
('서버 개발자', 3, ''),
('백엔드 개발자', 3, ''),
('프론트엔드 개발자', 3, ''),
('웹 풀스택 개발자', 3, ''),
('안드로이드 개발자', 3, ''),
('iOS 개발자', 3, ''),
('크로스플랫폼 앱 개발자', 3, ''),
('게임 개발자', 3, ''),
('데브옵스·인프라', 3, ''),
('보안 전문가', 3, ''),
('QA·테스트 엔지니어', 3, ''),
('임베디드 개발자', 3, ''),
('블록체인 개발자', 3, ''),
('DBA', 3, ''),
('기술 지원', 3, ''),

-- 4. 디자인
('UI/UX 디자이너', 4, ''),
('그래픽 디자이너', 4, ''),
('프로덕트 디자이너', 4, ''),
('브랜드 디자이너', 4, ''),
('영상·모션 디자이너', 4, ''),
('웹 디자이너', 4, ''),
('패키지 디자이너', 4, ''),
('3D 디자이너', 4, ''),
('일러스트레이터', 4, ''),
('공간 디자이너', 4, ''),
('패션 디자이너', 4, ''),

-- 5. 데이터·AI
('데이터 분석가', 5, ''),
('데이터 엔지니어', 5, ''),
('데이터 사이언티스트', 5, ''),
('머신러닝 엔지니어', 5, ''),
('딥러닝 엔지니어', 5, ''),
('AI 리서처', 5, ''),
('BI 엔지니어', 5, ''),
('데이터 거버넌스', 5, '');

UPDATE categories child
    JOIN categories parent
ON child.parent_category_id = parent.category_id
    SET child.category_path =
        CONCAT(parent.category_path, ':', child.category_id)
WHERE child.parent_category_id IS NOT NULL;

-- -- [1] 대분류 삽입 (ID 1 ~ 20)
-- INSERT INTO categories (category_id, name, parent_category_id) VALUES
--     (1000, ' ', NULL),(1, '경영·비즈니스', NULL), (2, '서비스기획·운영', NULL), (3, '개발', NULL), (4, '디자인', NULL),
--     (5, '데이터·AI', NULL), (6, '마케팅·광고', NULL), (7, '영업', NULL), (8, '미디어·문화·스포츠', NULL),
--     (9, '금융·보험', NULL), (10, '연구·R&D', NULL), (11, '교육', NULL), (12, '공공·복지', NULL),
--     (13, '건설·건축', NULL), (14, '제조·생산', NULL), (15, '의료·바이오', NULL), (16, '상품기획·MD', NULL),
--     (17, '인사·노무·HRD', NULL), (18, '유통·물류·무역', NULL), (19, '회계·세무·재무', NULL), (20, '사무·법무·총무', NULL);
--
-- -- [2] 모든 소분류 전수 삽입
-- -- 1. 경영·비즈니스 (A)
-- INSERT INTO categories (name, parent_category_id) VALUES ('경영지원', 1), ('비서', 1), ('총무', 1), ('법무', 1), ('사업개발', 1), ('전략기획', 1), ('경영기획', 1), ('오피스 매니저', 1), ('CSR', 1);
-- -- 2. 서비스기획·운영 (B)
-- INSERT INTO categories (name, parent_category_id) VALUES ('서비스 기획자', 2), ('PM·PO', 2), ('운영 매니저', 2), ('콘텐츠 기획', 2), ('고객 경험(CX) 기획', 2), ('전시 기획', 2);
-- -- 3. 개발 (C)
-- INSERT INTO categories (name, parent_category_id) VALUES ('서버 개발자', 3), ('백엔드 개발자', 3), ('프론트엔드 개발자', 3), ('웹 풀스택 개발자', 3), ('안드로이드 개발자', 3), ('iOS 개발자', 3), ('크로스플랫폼 앱 개발자', 3), ('게임 개발자', 3), ('데브옵스·인프라', 3), ('보안 전문가', 3), ('QA·테스트 엔지니어', 3), ('임베디드 개발자', 3), ('블록체인 개발자', 3), ('DBA', 3), ('기술 지원', 3);
-- -- 4. 디자인 (D)
-- INSERT INTO categories (name, parent_category_id) VALUES ('UI/UX 디자이너', 4), ('그래픽 디자이너', 4), ('프로덕트 디자이너', 4), ('브랜드 디자이너', 4), ('영상·모션 디자이너', 4), ('웹 디자이너', 4), ('패키지 디자이너', 4), ('3D 디자이너', 4), ('일러스트레이터', 4), ('공간 디자이너', 4), ('패션 디자이너', 4);
-- -- 5. 데이터·AI (E)
-- INSERT INTO categories (name, parent_category_id) VALUES ('데이터 분석가', 5), ('데이터 엔지니어', 5), ('데이터 사이언티스트', 5), ('머신러닝 엔지니어', 5), ('딥러닝 엔지니어', 5), ('AI 리서처', 5), ('BI 엔지니어', 5), ('데이터 거버넌스', 5);
-- -- 6. 마케팅·광고 (F)
-- INSERT INTO categories (name, parent_category_id) VALUES ('콘텐츠 마케터', 6), ('퍼포먼스 마케터', 6), ('브랜드 마케터', 6), ('그로스 마케터', 6), ('디지털 마케터', 6), ('소셜 마케터', 6), ('PR/홍보', 6), ('카피라이터', 6), ('광고 기획자(AE)', 6), ('CRM 마케터', 6);
-- -- 7. 영업 (G)
-- INSERT INTO categories (name, parent_category_id) VALUES ('기업 영업(B2B)', 7), ('개인 영업(B2C)', 7), ('기술 영업', 7), ('해외 영업', 7), ('영업 관리', 7), ('인사이드 세일즈', 7), ('솔루션 컨설턴트', 7);
-- -- 8. 미디어·문화·스포츠 (H)
-- INSERT INTO categories (name, parent_category_id) VALUES ('PD/연출', 8), ('영상 편집자', 8), ('에디터', 8), ('기자', 8), ('작가', 8), ('스포츠 마케팅', 8), ('음악 PD', 8), ('아티스트 매니저', 8);
-- -- 9. 금융·보험 (I)
-- INSERT INTO categories (name, parent_category_id) VALUES ('은행원', 9), ('자산운용가', 9), ('애널리스트', 9), ('투자 심사역', 9), ('보험 계리사', 9), ('손해 사정사', 9), ('트레이더', 9), ('준법감시인', 9);
-- -- 10. 연구·R&D (J)
-- INSERT INTO categories (name, parent_category_id) VALUES('반도체 설계', 10), ('회로 설계', 10), ('기구 설계', 10), ('화학 연구원', 10), ('바이오 연구원', 10), ('재료 연구원', 10), ('광학 엔지니어', 10);
-- -- 11. 교육 (K)
-- INSERT INTO categories (name, parent_category_id) VALUES ('교육 기획', 11), ('커리큘럼 설계', 11), ('교사/강사', 11), ('교육 운영', 11), ('학습 관리', 11);
-- -- 15. 의료·바이오 (O)
-- INSERT INTO categories (name, parent_category_id) VALUES ('간호사', 15), ('의사', 15), ('임상병리사', 15), ('방사선사', 15), ('약사', 15), ('수의사', 15), ('심리상담사', 15);
-- -- 17. 인사·노무·HRD (Q)
-- INSERT INTO categories (name, parent_category_id) VALUES ('HRM(인사관리)', 17), ('HRD(인사교육)', 17), ('채용 담당자', 17), ('노무사', 17), ('조직문화 담당자', 17), ('평가/보상 담당', 17);
-- -- 18. 유통·물류·무역 (P)
-- INSERT INTO categories (name, parent_category_id) VALUES ('물류 관리', 18), ('유통 관리', 18), ('SCM', 18), ('무역 사무', 18), ('구매 담당', 18), ('창고 관리', 18), ('포워딩', 18);
-- -- 19. 회계·세무·재무 (S)
-- INSERT INTO categories (name, parent_category_id) VALUES ('재무 회계', 19), ('관리 회계', 19), ('세무사', 19), ('자금 관리', 19), ('내부 감사', 19), ('IR(투자자 관계)', 19), ('원가 관리', 19);
-- -- 20. 사무·법무·총무 (T)
-- INSERT INTO categories (name, parent_category_id) VALUES ('일반 사무', 20), ('행정 보조', 20), ('법무 사무', 20), ('특허 담당', 20), ('속기사', 20);
-- 카테고리 테이블 스키마 (필요 시 조정)
CREATE TABLE IF NOT EXISTS categories
(
    category_id        BIGINT PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    parent_category_id BIGINT       NULL,
    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_category_id) REFERENCES categories (category_id)
);

-- 정리: 대분류 1~20, 공백/더미 1000은 제외

-- [대분류]
INSERT INTO categories (category_id, name, parent_category_id)
VALUES (1, '경영·비즈니스', NULL),
       (2, '서비스기획·운영', NULL),
       (3, '개발', NULL),
       (4, '디자인', NULL),
       (5, '데이터·AI', NULL),
       (6, '마케팅·광고', NULL),
       (7, '영업', NULL),
       (8, '미디어·문화', NULL),
       (9, '금융·보험', NULL),
       (10, '연구·R&D', NULL),
       (11, '교육', NULL),
       (12, '회계·세무·재무', NULL);

-- [소분류]
-- 1. 경영·비즈니스
INSERT INTO categories (name, parent_category_id)
VALUES ('경영지원', 1),
       ('비서', 1),
       ('총무', 1),
       ('법무', 1),
       ('사업개발', 1),
       ('전략기획', 1),
       ('경영기획', 1),
       ('오피스 매니저', 1),
       ('CSR', 1);

-- 2. 서비스기획·운영
INSERT INTO categories (name, parent_category_id)
VALUES ('서비스 기획자', 2),
       ('PM·PO', 2),
       ('운영 매니저', 2),
       ('콘텐츠 기획', 2),
       ('고객 경험(CX) 기획', 2),
       ('전시 기획', 2);

-- 3. 개발
INSERT INTO categories (name, parent_category_id)
VALUES ('서버 개발자', 3),
       ('백엔드 개발자', 3),
       ('프론트엔드 개발자', 3),
       ('웹 풀스택 개발자', 3),
       ('안드로이드 개발자', 3),
       ('iOS 개발자', 3),
       ('크로스플랫폼 앱 개발자', 3),
       ('게임 개발자', 3),
       ('데브옵스·인프라', 3),
       ('보안 전문가', 3),
       ('QA·테스트 엔지니어', 3),
       ('임베디드 개발자', 3),
       ('블록체인 개발자', 3),
       ('DBA', 3),
       ('기술 지원', 3);

-- 4. 디자인
INSERT INTO categories (name, parent_category_id)
VALUES ('UI/UX 디자이너', 4),
       ('그래픽 디자이너', 4),
       ('프로덕트 디자이너', 4),
       ('브랜드 디자이너', 4),
       ('영상·모션 디자이너', 4),
       ('웹 디자이너', 4),
       ('패키지 디자이너', 4),
       ('3D 디자이너', 4),
       ('일러스트레이터', 4),
       ('공간 디자이너', 4),
       ('패션 디자이너', 4);

-- 5. 데이터·AI
INSERT INTO categories (name, parent_category_id)
VALUES ('데이터 분석가', 5),
       ('데이터 엔지니어', 5),
       ('데이터 사이언티스트', 5),
       ('머신러닝 엔지니어', 5),
       ('딥러닝 엔지니어', 5),
       ('AI 리서처', 5),
       ('BI 엔지니어', 5),
       ('데이터 거버넌스', 5);

-- 6. 마케팅·광고
INSERT INTO categories (name, parent_category_id)
VALUES ('콘텐츠 마케터', 6),
       ('퍼포먼스 마케터', 6),
       ('브랜드 마케터', 6),
       ('그로스 마케터', 6),
       ('디지털 마케터', 6),
       ('소셜 마케터', 6),
       ('PR/홍보', 6),
       ('카피라이터', 6),
       ('광고 기획자(AE)', 6),
       ('CRM 마케터', 6);

-- 7. 영업
INSERT INTO categories (name, parent_category_id)
VALUES ('기업 영업(B2B)', 7),
       ('개인 영업(B2C)', 7),
       ('기술 영업', 7),
       ('해외 영업', 7),
       ('영업 관리', 7),
       ('인사이드 세일즈', 7),
       ('솔루션 컨설턴트', 7);

-- 8. 미디어·문화·스포츠
INSERT INTO categories (name, parent_category_id)
VALUES ('PD/연출', 8),
       ('영상 편집자', 8),
       ('에디터', 8),
       ('기자', 8),
       ('작가', 8),
       ('스포츠 마케팅', 8),
       ('음악 PD', 8),
       ('아티스트 매니저', 8);

-- 9. 금융·보험
INSERT INTO categories (name, parent_category_id)
VALUES ('은행원', 9),
       ('자산운용가', 9),
       ('애널리스트', 9),
       ('투자 심사역', 9),
       ('보험 계리사', 9),
       ('손해 사정사', 9),
       ('트레이더', 9),
       ('준법감시인', 9);

-- 10. 연구·R&D
INSERT INTO categories (name, parent_category_id)
VALUES ('반도체 설계', 10),
       ('회로 설계', 10),
       ('기구 설계', 10),
       ('화학 연구원', 10),
       ('바이오 연구원', 10),
       ('재료 연구원', 10),
       ('광학 엔지니어', 10);

-- 11. 교육
INSERT INTO categories (name, parent_category_id)
VALUES ('교육 기획', 11),
       ('커리큘럼 설계', 11),
       ('교사/강사', 11),
       ('교육 운영', 11),
       ('학습 관리', 11);

-- 12. 회계·세무·재무
INSERT INTO categories (name, parent_category_id)
VALUES ('재무 회계', 12),
       ('관리 회계', 12),
       ('세무사', 12),
       ('자금 관리', 12),
       ('내부 감사', 12),
       ('IR(투자자 관계)', 12),
       ('원가 관리', 12);
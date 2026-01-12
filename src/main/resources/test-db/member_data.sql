-- 회원 데이터 생성
INSERT INTO members (member_id, nickname, phone_num, email, password, created_at, updated_at)
VALUES (1, '성실멘티', '010-1234-5678', 'mente123@naver.com', 'menteepw', NOW(), NOW()), -- 멘티 회원
       (2, '열정멘토', '010-2345-6789', 'mentor123@gmail.com', 'mentorpw', NOW(), NOW()); -- 멘토 회원
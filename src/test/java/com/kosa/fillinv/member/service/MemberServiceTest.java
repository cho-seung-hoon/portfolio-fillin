package com.kosa.fillinv.member.service;

import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.security.details.CustomMemberDetailsService;
import com.kosa.fillinv.member.dto.member.SignUpDto;
import com.kosa.fillinv.member.dto.profile.IntroductionRequestDto;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.entity.Profile;
import com.kosa.fillinv.member.exception.MemberException;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.member.repository.ProfileRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileSystemUtils;

import java.io.File;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Transactional
@SpringBootTest
@ActiveProfiles("local")
class MemberServiceTest {

        private final String EMAIL = "qwer@test.com";
        private final String PASSWORD = "qwer1234";
        private final String NICKNAME = "tester";
        private final String PHONE_NUM = "010-1234-5678";
        @Autowired
        private MemberService memberService;
        @Autowired
        private MemberRepository memberRepository;
        @Autowired
        private ProfileRepository profileRepository;
        @Autowired
        private CategoryRepository categoryRepository;
        @Autowired
        private EntityManager entityManager;
        private Member savedMember;
        @Autowired
        private CustomMemberDetailsService userDetailsService;

        @BeforeEach
        void setUp() {
                // 기존 데이터 삭제 및 정리
                entityManager.createNativeQuery("DELETE FROM profiles").executeUpdate();
                entityManager.createNativeQuery("DELETE FROM members").executeUpdate();
                entityManager.flush();
                entityManager.clear();

                if (!categoryRepository.existsById(1000L)) {
                        entityManager.createNativeQuery(
                                        "INSERT INTO categories (category_id, name, parent_category_id) VALUES (1000, 'Unspecified', NULL)")
                                        .executeUpdate();
                }

                SignUpDto signUpDto = SignUpDto.builder()
                                .email(EMAIL)
                                .password(PASSWORD)
                                .nickname(NICKNAME)
                                .phoneNum(PHONE_NUM)
                                .build();
                memberService.signUp(signUpDto);
                savedMember = memberRepository.findByEmail(EMAIL).orElseThrow();

                entityManager.flush();
                entityManager.clear();
        }

        @AfterEach
        void tearDown() {
                // 테스트용 파일 저장소 정리
                File directory = new File("src/test/resources/files");
                if (directory.exists()) {
                        FileSystemUtils.deleteRecursively(directory);
                }
        }

        @Test
        @DisplayName("프로필 정보를 조회")
        void getProfile() {
                // given
                // 무조건 1000번 카테고리 생성 (표준 SQL: 없으면 넣음)
                entityManager.createNativeQuery(
                                "INSERT INTO categories (category_id, name, parent_category_id) " +
                                                "SELECT 1000, 'Unspecified', NULL " +
                                                "WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_id = 1000)")
                                .executeUpdate();

                // when
                ProfileResponseDto response = memberService.getProfile(savedMember.getId());

                // then
                assertThat(response.email()).isEqualTo(EMAIL);
                assertThat(response.nickname()).isEqualTo(NICKNAME);
                assertThat(response.phoneNum()).isEqualTo(PHONE_NUM);
                assertThat(response.imageUrl()).isEqualTo("/resources/files/default.png");
                assertThat(response.category().parentId()).isNull();
        }

        @Test
        @DisplayName("부모 카테고리가 있는 프로필 정보를 조회")
        void getProfile_WithParentCategory() {
                // given
                // 1. 부모 카테고리 생성 (999)
                entityManager.createNativeQuery(
                                "INSERT INTO categories (category_id, name, parent_category_id) VALUES (999, 'Parent', NULL)")
                                .executeUpdate();
                // 2. 자식 카테고리 생성 (1001, 부모는 999)
                entityManager.createNativeQuery(
                                "INSERT INTO categories (category_id, name, parent_category_id) VALUES (1001, 'Child', 999)")
                                .executeUpdate();

                // 3. 사용자의 카테고리를 1001로 변경
                profileRepository.findById(savedMember.getId()).ifPresent(p -> {
                        p.updateIntroduceAndCategory(p.getIntroduce(), 1001L);
                        profileRepository.save(p);
                });

                entityManager.flush();
                entityManager.clear();

                // when
                ProfileResponseDto response = memberService.getProfile(savedMember.getId());

                // then
                assertThat(response.category().categoryId()).isEqualTo(1001L);
                assertThat(response.category().parentId()).isEqualTo(999L);
        }

        @Test
        @DisplayName("프로필 이미지를 수정")
        void updateProfileImage() {
                // given
                MockMultipartFile mockFile = new MockMultipartFile("image", "new_image.png", "image/png",
                                "test content".getBytes());
                // when
                memberService.updateProfileImage(savedMember.getId(), mockFile);
                entityManager.flush();
                entityManager.clear();

                // then
                Profile updatedProfile = profileRepository.findById(savedMember.getId()).orElseThrow();
                assertThat(updatedProfile.getImage()).isNotNull();
                assertThat(updatedProfile.getImage()).endsWith(".png");

                // Get Profile로 조회 시 경로 확인
                ProfileResponseDto response = memberService.getProfile(savedMember.getId());
                assertThat(response.imageUrl()).startsWith("/resources/files/");
                assertThat(response.imageUrl()).endsWith(".png");

                // 파일 저장 확인
                File savedFile = new File("src/test/resources/files/" + updatedProfile.getImage());
                assertThat(savedFile.exists()).isTrue();

                // updatedAt 갱신 확인
                assertThat(updatedProfile.getUpdatedAt()).isAfter(savedMember.getCreatedAt());
        }

        @Test
        @DisplayName("닉네임을 수정")
        void updateNickname() {
                // given
                String newNickname = "newTester";

                // when
                // when
                memberService.updateNickname(savedMember.getId(), newNickname);
                entityManager.flush();
                entityManager.clear();

                // then
                Member updatedMember = memberRepository.findByEmail(EMAIL).orElseThrow();
                assertThat(updatedMember.getNickname()).isEqualTo(newNickname);
        }

        @Test
        @DisplayName("중복된 닉네임으로 수정 시 예외가 발생")
        void updateNickname_Duplicate() {
                // given
                String anotherEmail = "change@test.com";
                SignUpDto otherUser = SignUpDto.builder()
                                .email(anotherEmail)
                                .password(PASSWORD)
                                .nickname("changeNick")
                                .phoneNum("010-9876-5432")
                                .build();
                memberService.signUp(otherUser);

                entityManager.flush();
                entityManager.clear();

                // when & then
                assertThatThrownBy(() -> memberService.updateNickname(savedMember.getId(), "changeNick"))
                                .isInstanceOf(MemberException.class)
                                .extracting("errorCode")
                                .isEqualTo(ErrorCode.NICKNAME_DUPLICATION);
        }

        @Test
        @DisplayName("자기소개와 카테고리를 수정")
        void updateIntroduction() {
                // given
                // 테스트용 카테고리 추가
                Long newCategoryId = 2L;
                if (!categoryRepository.existsById(newCategoryId)) {
                        entityManager
                                        .createNativeQuery(
                                                        "INSERT INTO categories (category_id, name, parent_category_id) VALUES (:id, :name, NULL)")
                                        .setParameter("id", newCategoryId)
                                        .setParameter("name", "New Category")
                                        .executeUpdate();
                }

                String newIntroduction = "반갑습니다. 새로운 소개글입니다.";
                IntroductionRequestDto requestDto = IntroductionRequestDto.builder()
                                .introduction(newIntroduction)
                                .categoryId(newCategoryId)
                                .build();

                // when
                // when
                memberService.updateIntroduction(savedMember.getId(), requestDto);
                entityManager.flush();
                entityManager.clear();

                // then
                Profile updatedProfile = profileRepository.findById(savedMember.getId()).orElseThrow();
                assertThat(updatedProfile.getIntroduce()).isEqualTo(newIntroduction);
                assertThat(updatedProfile.getCategoryId()).isEqualTo(newCategoryId);
        }

        @Test
        @DisplayName("회원가입 성공 테스트")
        void signUp_Success() {
                // given
                SignUpDto newMember = SignUpDto.builder()
                                .email("new@example.com")
                                .password("password")
                                .nickname("newNick")
                                .phoneNum("010-0000-0000")
                                .build();

                // when
                memberService.signUp(newMember);
                entityManager.flush();
                entityManager.clear();

                // then
                Member member = memberRepository.findByEmail("new@example.com").orElseThrow();
                Profile profile = profileRepository.findById(member.getId()).orElseThrow();

                assertThat(member.getNickname()).isEqualTo("newNick");
                assertThat(profile.getIntroduce()).isEmpty();
        }

        @Test
        @DisplayName("중복 이메일로 가입 시 예외가 발생")
        void signUp_DuplicateEmail() {
                // given
                SignUpDto duplicateMember = SignUpDto.builder()
                                .email(EMAIL) // 이미 가입된 이메일
                                .password("password")
                                .nickname("uniqueNick")
                                .phoneNum("010-0000-0000")
                                .build();

                // when & then
                assertThatThrownBy(() -> memberService.signUp(duplicateMember))
                                .isInstanceOf(MemberException.class)
                                .extracting("errorCode")
                                .isEqualTo(ErrorCode.EMAIL_DUPLICATION);
        }

        @Test
        @DisplayName("로그인 시 사용자 정보를 정상적으로 로드")
        void loadUserByUsername_Success() {
                // when
                UserDetails userDetails = userDetailsService
                                .loadUserByUsername(EMAIL);

                // then
                assertThat(userDetails).isNotNull();
                assertThat(userDetails.getUsername()).isEqualTo(savedMember.getId());
        }

        @Test
        @DisplayName("중복 닉네임으로 회원가입 시 예외가 발생")
        void signUp_DuplicateNickname() {
                // given
                SignUpDto duplicateMember = SignUpDto.builder()
                                .email("new@example.com")
                                .password("password")
                                .nickname(NICKNAME) // 이미 존재하는 닉네임
                                .phoneNum("010-1111-2222")
                                .build();

                // when & then
                assertThatThrownBy(() -> memberService.signUp(duplicateMember))
                                .isInstanceOf(MemberException.class)
                                .extracting("errorCode")
                                .isEqualTo(ErrorCode.NICKNAME_DUPLICATION);
        }

        @Test
        @DisplayName("중복 전화번호로 회원가입 시 예외가 발생")
        void signUp_DuplicatePhoneNum() {
                // given
                SignUpDto duplicateMember = SignUpDto.builder()
                                .email("new@example.com")
                                .password("password")
                                .nickname("newNick")
                                .phoneNum(PHONE_NUM)
                                .build();

                // when & then
                assertThatThrownBy(() -> memberService.signUp(duplicateMember))
                                .isInstanceOf(MemberException.class)
                                .extracting("errorCode")
                                .isEqualTo(ErrorCode.PHONE_NUM_DUPLICATION);
        }

        @Test
        @DisplayName("존재하지 않는 사용자로 로그인 시도 시 예외가 발생")
        void loadUserByUsername_UserNotFound() {
                // given
                String notFoundEmail = "notfound@example.com";

                // when & then
                assertThatThrownBy(() -> userDetailsService.loadUserByUsername(notFoundEmail))
                                .isInstanceOf(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
                                .hasMessage("해당하는 유저를 찾을 수 없습니다.");
        }

        @Test
        @DisplayName("회원 탈퇴 시 소프트 딜리트가 적용")
        void deleteMember_Success() {
                // when
                // when
                memberService.deleteMember(savedMember.getId());
                entityManager.flush();
                entityManager.clear();

                // then
                assertThat(memberRepository.findByEmail(EMAIL)).isEmpty();
                assertThat(profileRepository.findById(savedMember.getId())).isEmpty();
                Object memberDeletedAt = entityManager
                                .createNativeQuery("SELECT deleted_at FROM members WHERE member_id = :id")
                                .setParameter("id", savedMember.getId())
                                .getSingleResult();
                assertThat(memberDeletedAt).isNotNull();

                Object profileDeletedAt = entityManager
                                .createNativeQuery("SELECT deleted_at FROM profiles WHERE member_id = :id")
                                .setParameter("id", savedMember.getId()) // Profile의 PK는 Member ID와 같음
                                .getSingleResult();
                assertThat(profileDeletedAt).isNotNull();
        }
}

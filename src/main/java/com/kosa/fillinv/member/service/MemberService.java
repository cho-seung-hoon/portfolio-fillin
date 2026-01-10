package com.kosa.fillinv.member.service;

import com.kosa.fillinv.category.dto.CategoryResponseDto;
import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.exception.CategoryException;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.member.dto.IntroductionRequestDto;
import com.kosa.fillinv.member.exception.MemberException;
import com.kosa.fillinv.member.dto.ProfileResponseDto;
import com.kosa.fillinv.member.dto.SignUpDto;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.entity.Profile;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.member.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final ProfileRepository profileRepository;
    private final CategoryRepository categoryRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void signUp(SignUpDto signUpDto) {
        validateDuplicateEmail(signUpDto.getEmail());
        validateDuplicateNickname(signUpDto.getNickname());
        validateDuplicatePhoneNum(signUpDto.getPhoneNum());

        Member member = createMember(signUpDto);
        member = memberRepository.save(member);

        Profile profile = createProfile(member);
        profileRepository.save(profile); // 회원가입 시 프로필 생성
    }

    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(MemberException.MemberNotFound::new);
        Profile profile = profileRepository.findById(member.getId())
                .orElseThrow(MemberException.ProfileNotFound::new);

        Category category = categoryRepository.findById(profile.getCategoryId())
                .orElseThrow(CategoryException.NotFound::new);

        return ProfileResponseDto.builder()
                .imageUrl(profile.getImage())
                .nickname(member.getNickname())
                .email(member.getEmail())
                .phoneNum(member.getPhoneNum())
                .introduction(profile.getIntroduce())
                .category(new CategoryResponseDto(category.getId(), category.getName()))
                .build();
    }

    @Transactional
    public void updateProfileImage(String email, String file) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(MemberException.MemberNotFound::new);
        Profile profile = profileRepository.findById(member.getId())
                .orElseThrow(MemberException.ProfileNotFound::new);

        // TODO: 이미지 저장 로직 구현 예정
        String imageUrl = file;
        profile.updateImage(imageUrl);
    }

    @Transactional
    public void updateNickname(String email, String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new MemberException(ErrorCode.NICKNAME_DUPLICATION);
        }
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(MemberException.MemberNotFound::new);
        member.updateNickname(nickname);
    }

    @Transactional
    public void updateIntroduction(String email, IntroductionRequestDto requestDto) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(MemberException.MemberNotFound::new);
        Profile profile = profileRepository.findById(member.getId())
                .orElseThrow(MemberException.ProfileNotFound::new);

        if (!categoryRepository.existsById(requestDto.getCategoryId())) {
            throw new CategoryException.NotFound();
        }

        profile.updateIntroduceAndCategory(requestDto.getIntroduction(), requestDto.getCategoryId());
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            log.warn("중복된 이메일 입니다: {}", email);
            throw new MemberException(ErrorCode.EMAIL_DUPLICATION);
        }
    }

    private void validateDuplicateNickname(String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            log.warn("중복된 닉네임 입니다: {}", nickname);
            throw new MemberException(ErrorCode.NICKNAME_DUPLICATION);
        }
    }

    private void validateDuplicatePhoneNum(String phoneNum) {
        if (memberRepository.existsByPhoneNum(phoneNum)) {
            log.warn("중복된 전화번호 입니다: {}", phoneNum);
            throw new MemberException(ErrorCode.PHONE_NUM_DUPLICATION);
        }
    }

    private Member createMember(SignUpDto signUpDto) {
        return Member.builder()
                .id(UUID.randomUUID().toString())
                .email(signUpDto.getEmail())
                .password(passwordEncoder.encode(signUpDto.getPassword()))
                .nickname(signUpDto.getNickname())
                .phoneNum(signUpDto.getPhoneNum())
                .build();
    }

    @Transactional
    public void deleteMember(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(MemberException.MemberNotFound::new);

        Profile profile = profileRepository.findById(member.getId())
                .orElseThrow(MemberException.ProfileNotFound::new);

        profileRepository.delete(profile);
        memberRepository.delete(member);
    }

    private Profile createProfile(Member member) {
        return Profile.createDefault(member);
    }
}

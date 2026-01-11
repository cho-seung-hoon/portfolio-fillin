package com.kosa.fillinv.member.service;

import com.kosa.fillinv.category.dto.CategoryResponseDto;
import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.exception.CategoryException;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.member.dto.profile.IntroductionRequestDto;
import com.kosa.fillinv.member.exception.MemberException;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.dto.member.SignUpDto;
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
        validateDuplicateEmail(signUpDto.email());
        validateDuplicateNickname(signUpDto.nickname());
        validateDuplicatePhoneNum(signUpDto.phoneNum());

        Member member = createMember(signUpDto);
        member = memberRepository.save(member);

        Profile profile = createProfile(member);
        profileRepository.save(profile); // 회원가입 시 프로필 생성
    }

    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(String memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException.MemberNotFound::new);
        Profile profile = profileRepository.findById(memberId)
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
    public void updateProfileImage(String memberId, String file) {
        if (!memberRepository.existsById(memberId)) {
            throw new MemberException.MemberNotFound();
        }
        Profile profile = profileRepository.findById(memberId)
                .orElseThrow(MemberException.ProfileNotFound::new);

        // TODO: 이미지 저장 로직 구현 예정
        String imageUrl = file;
        profile.updateImage(imageUrl);
    }

    @Transactional
    public void updateNickname(String memberId, String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new MemberException(ErrorCode.NICKNAME_DUPLICATION);
        }
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException.MemberNotFound::new);
        member.updateNickname(nickname);
    }

    @Transactional
    public void updateIntroduction(String memberId, IntroductionRequestDto requestDto) {
        if (!memberRepository.existsById(memberId)) {
            throw new MemberException.MemberNotFound();
        }
        Profile profile = profileRepository.findById(memberId)
                .orElseThrow(MemberException.ProfileNotFound::new);

        if (!categoryRepository.existsById(requestDto.categoryId())) {
            throw new CategoryException.NotFound();
        }

        profile.updateIntroduceAndCategory(requestDto.introduction(), requestDto.categoryId());
    }

    private void validateDuplicateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new MemberException(ErrorCode.EMAIL_DUPLICATION);
        }
    }

    private void validateDuplicateNickname(String nickname) {
        if (memberRepository.existsByNickname(nickname)) {
            throw new MemberException(ErrorCode.NICKNAME_DUPLICATION);
        }
    }

    private void validateDuplicatePhoneNum(String phoneNum) {
        if (memberRepository.existsByPhoneNum(phoneNum)) {
            throw new MemberException(ErrorCode.PHONE_NUM_DUPLICATION);
        }
    }

    private Member createMember(SignUpDto signUpDto) {
        return Member.builder()
                .id(UUID.randomUUID().toString())
                .email(signUpDto.email())
                .password(passwordEncoder.encode(signUpDto.password()))
                .nickname(signUpDto.nickname())
                .phoneNum(signUpDto.phoneNum())
                .build();
    }

    @Transactional
    public void deleteMember(String memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException.MemberNotFound::new);

        Profile profile = profileRepository.findById(memberId)
                .orElseThrow(MemberException.ProfileNotFound::new);

        profileRepository.delete(profile);
        memberRepository.delete(member);
    }

    private Profile createProfile(Member member) {
        return Profile.createDefault(member);
    }
}

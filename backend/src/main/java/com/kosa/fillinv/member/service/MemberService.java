package com.kosa.fillinv.member.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.exception.CategoryException;
import com.kosa.fillinv.category.repository.CategoryRepository;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.global.util.UploadFileResult;
import com.kosa.fillinv.member.dto.member.SignUpDto;
import com.kosa.fillinv.member.dto.profile.IntroductionRequestDto;
import com.kosa.fillinv.member.dto.profile.ProfileResponseDto;
import com.kosa.fillinv.member.entity.Member;
import com.kosa.fillinv.member.entity.Profile;
import com.kosa.fillinv.member.exception.MemberException;
import com.kosa.fillinv.member.repository.MemberRepository;
import com.kosa.fillinv.member.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final ProfileRepository profileRepository;
    private final CategoryRepository categoryRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final FileStorage fileStorage;

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

        return ProfileResponseDto.of(member, profile, category);
    }

    public Map<String, ProfileResponseDto> getAllProfilesByMemberIds(Collection<String> memberIds) {
        Map<String, Member> memberMap = memberRepository.findByIdIn(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, member -> member));

        Map<String, Profile> profileMap = profileRepository.findByMemberIdIn(memberIds).stream()
                .collect(Collectors.toMap(Profile::getMemberId, profile -> profile));

        Map<Long, Category> categoryMap = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, category -> category));

        return memberMap.values().stream()
                .collect(Collectors.toMap(
                        Member::getId,
                        member -> {
                            Profile profile = profileMap.get(member.getId());

                            Category category = null;
                            if (profile != null && profile.getCategoryId() != null) {
                                category = categoryMap.get(profile.getCategoryId());
                            }

                            return ProfileResponseDto.of(member, profile, category);
                        }));
    }

    @Transactional
    public void updateProfileImage(String memberId, MultipartFile file) {
        if (!memberRepository.existsById(memberId)) {
            throw new MemberException.MemberNotFound();
        }
        Profile profile = profileRepository.findById(memberId)
                .orElseThrow(MemberException.ProfileNotFound::new);

        if (profile.getImage() != null) {
            fileStorage.delete(profile.getImage());
        }

        UploadFileResult result = fileStorage.upload(file);
        profile.updateImage(result.fileKey());
    }

    @Transactional
    public void deleteProfileImage(String memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new MemberException.MemberNotFound();
        }
        Profile profile = profileRepository.findById(memberId)
                .orElseThrow(MemberException.ProfileNotFound::new);

        if (profile.getImage() != null) {
            fileStorage.delete(profile.getImage());
        }

        profile.updateImage(null);
    }

    @Transactional
    public void updateNickname(String memberId, String nickname) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException.MemberNotFound::new);

        if (nickname.equals(member.getNickname())) {
            return;
        }

        if (memberRepository.existsByNickname(nickname)) {
            throw new MemberException(ErrorCode.NICKNAME_DUPLICATION);
        }
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

    @Transactional
    public void updatePhoneNum(String memberId, String phoneNum) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(MemberException.MemberNotFound::new);

        if (phoneNum.equals(member.getPhoneNum())) {
            return;
        }

        if (memberRepository.existsByPhoneNum(phoneNum)) {
            throw new MemberException(ErrorCode.PHONE_NUM_DUPLICATION);
        }
        member.updatePhoneNum(phoneNum);
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

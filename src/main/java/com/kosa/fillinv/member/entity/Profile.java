package com.kosa.fillinv.member.entity;

import jakarta.persistence.*;

import com.kosa.fillinv.global.entity.BaseEntity;

import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "profiles")
@SQLDelete(sql = "UPDATE profiles SET deleted_at = NOW() WHERE member_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Profile extends BaseEntity {

    @Id
    @Column(name = "member_id", nullable = false)
    private String memberId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "member_id")
    private Member member;

    private String image;

    @Column(name = "introduce", nullable = false)
    private String introduce;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    public void updateImage(String image) {
        this.image = image;
    }

    public void updateIntroduceAndCategory(String introduce, Long categoryId) {
        this.introduce = introduce;
        this.categoryId = categoryId;
    }

    private static final String INTRODUCTION = "";
    private static final Long CATEGORY_ID = 1000L;

    public static Profile createDefault(Member member) {
        return Profile.builder()
                .member(member)
                .introduce(INTRODUCTION)
                .categoryId(CATEGORY_ID)
                .build();
    }
}

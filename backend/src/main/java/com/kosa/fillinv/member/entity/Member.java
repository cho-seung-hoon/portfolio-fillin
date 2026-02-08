package com.kosa.fillinv.member.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import com.kosa.fillinv.global.entity.BaseEntity;

import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "members")
@SQLDelete(sql = "UPDATE members SET deleted_at = NOW() WHERE member_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Member extends BaseEntity {

    @Id
    @Column(name = "member_id", nullable = false)
    private String id;

    @Column(name = "nickname", nullable = false)
    private String nickname;

    @Column(name = "phone_num", nullable = false)
    private String phoneNum;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updatePhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
}

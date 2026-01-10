package com.kosa.fillinv.review.dto;

import com.kosa.fillinv.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReviewWithNicknameVO {
    private final Review review;
    private final String nickname;
}

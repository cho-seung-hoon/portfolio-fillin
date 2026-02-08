package com.kosa.fillinv.review.dto;

public record ReviewCreateResponseDTO(String reviewId) {
    public static ReviewCreateResponseDTO from(String reviewId) {
        return new ReviewCreateResponseDTO(reviewId);
    }
}

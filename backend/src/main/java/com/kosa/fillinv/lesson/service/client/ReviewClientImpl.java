package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReviewClientImpl implements ReviewClient {

    private final ReviewService reviewService;

    @Override
    public Map<String, Float> getAverageRating(Set<String> lessonIds) {

        return reviewService.getAverageScoreByLessonIds(lessonIds).entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().floatValue()));
    }
}

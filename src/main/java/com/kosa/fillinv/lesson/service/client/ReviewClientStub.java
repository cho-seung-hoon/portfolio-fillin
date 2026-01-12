package com.kosa.fillinv.lesson.service.client;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ReviewClientStub implements ReviewClient {
    @Override
    public Map<String, Float> getAverageRating(Set<String> lessonIds) {
        return lessonIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> 2.5f
                ));
    }
}

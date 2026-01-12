package com.kosa.fillinv.lesson.service.client;

import java.util.Map;
import java.util.Set;

public interface ReviewClient {
    Map<String, Float> getAverageRating(Set<String> lessonIds);
}

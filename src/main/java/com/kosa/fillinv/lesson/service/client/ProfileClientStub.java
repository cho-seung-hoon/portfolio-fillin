package com.kosa.fillinv.lesson.service.client;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ProfileClientStub implements ProfileClient {

    @Override
    public Map<String, MentorSummaryDTO> getMentors(Set<String> mentorIds) {
        return mentorIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> new MentorSummaryDTO(id, "Mentor-" + id)
                ));
    }
}

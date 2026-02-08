package com.kosa.fillinv.lesson.service.client;

import java.util.Map;
import java.util.Set;

public interface ProfileClient {
    Map<String, MentorSummaryDTO> getMentors(Set<String> mentorIds);

    MentorSummaryDTO readMentorById(String mentorId);
}

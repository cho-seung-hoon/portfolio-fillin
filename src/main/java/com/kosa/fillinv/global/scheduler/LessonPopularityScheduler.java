package com.kosa.fillinv.global.scheduler;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonTemp;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.LessonTempRepository;
import com.kosa.fillinv.review.repository.ReviewRepository;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@EnableScheduling
@RequiredArgsConstructor
public class LessonPopularityScheduler {

    private static final int M = 5; // 베이지안 평균 가중치
    private final LessonRepository lessonRepository;
    private final ScheduleRepository scheduleRepository;
    private final ReviewRepository reviewRepository;
    private final LessonTempRepository lessonTempRepository;
    private final TransactionTemplate transactionTemplate;
    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 0 1 * * *")
    public void updateLessonPopularity() {

        // 점수 초기화
        transactionTemplate.executeWithoutResult(status -> resetAllScores());

        // 계산 및 Temp 저장
        transactionTemplate.executeWithoutResult(status -> calculateAndSaveToTemp());

        // Lesson 업데이트
        transactionTemplate.executeWithoutResult(status -> updateLessonsFromTemp());

    }

//    @EventListener(ApplicationReadyEvent.class)
//    public void init() {
//        updateLessonPopularity();
//    }

    private void resetAllScores() {
        lessonRepository.resetAllPopularityScores();
    }

    private void calculateAndSaveToTemp() {

        List<Lesson> activeLessons = lessonRepository.findAllByDeletedAtIsNull();
        if (activeLessons.isEmpty()) {
            return;
        }

        Instant startDate = Instant.now().minus(7, ChronoUnit.DAYS);

        // 최근 7일 신청 조회
        Map<String, Long> recentStatsMap = scheduleRepository.countByLessonIdAndCreatedAtAfter(startDate).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]));

        // 리뷰 관련 계산
        List<Object[]> reviewStatsList = reviewRepository.findReviewStatsByLessonId();
        Map<String, ReviewStat> reviewStatsMap = new HashMap<>();

        long totalReviewCount = 0;
        double totalReviewScoreSum = 0.0;

        for (Object[] row : reviewStatsList) {
            String lessonId = (String) row[0];
            Long count = (Long) row[1];
            Double avgScore = (Double) row[2];

            reviewStatsMap.put(lessonId, new ReviewStat(count, avgScore));

            totalReviewCount += count;
            totalReviewScoreSum += (count * avgScore);
        }

        double C = (totalReviewCount > 0) ? (totalReviewScoreSum / totalReviewCount) : 0.0;

        List<LessonTemp> tempToSave = new ArrayList<>();

        // 인기 점수 계산
        for (Lesson lesson : activeLessons) {
            String lessonId = lesson.getId();

            Long recentAppCount = recentStatsMap.getOrDefault(lessonId, 0L);

            ReviewStat reviewStat = reviewStatsMap.getOrDefault(lessonId, new ReviewStat(0L, 0.0));
            Long v = reviewStat.count;
            Double R = reviewStat.avgScore;

            // 베이지안 평균
            double bayesianAvg = 0.0;
            if (v + M > 0) {
                bayesianAvg = ((double) v / (v + M)) * R + ((double) M / (v + M)) * C;
            }

            double finalScore = (recentAppCount * 0.6) + (v * 0.2) + (bayesianAvg * 0.2);

            tempToSave.add(new LessonTemp(lessonId, finalScore));
        }

        lessonTempRepository.deleteAll();
        lessonTempRepository.saveAll(tempToSave);
    }

    private void updateLessonsFromTemp() {
        List<LessonTemp> temps = lessonTempRepository.findAll();
        if (temps.isEmpty()) {
            return;
        }

        int BATCH_SIZE = 500;
        String sql = "UPDATE lessons SET popularity_score = ? WHERE lesson_id = ?";

        for (int i = 0; i < temps.size(); i += BATCH_SIZE) {
            int end = Math.min(temps.size(), i + BATCH_SIZE);
            List<LessonTemp> batchList = temps.subList(i, end);

            jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int j) throws SQLException {
                    LessonTemp temp = batchList.get(j);
                    ps.setDouble(1, temp.getScore());
                    ps.setString(2, temp.getLessonId());
                }

                @Override
                public int getBatchSize() {
                    return batchList.size();
                }
            });
        }
    }

    record ReviewStat(Long count, Double avgScore) {
    }
}

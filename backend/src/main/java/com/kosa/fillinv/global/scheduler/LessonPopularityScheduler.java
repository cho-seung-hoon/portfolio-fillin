package com.kosa.fillinv.global.scheduler;

import com.kosa.fillinv.lesson.entity.Lesson;
import com.kosa.fillinv.lesson.entity.LessonTemp;
import com.kosa.fillinv.lesson.repository.LessonBulkRepository;
import com.kosa.fillinv.lesson.repository.LessonRepository;
import com.kosa.fillinv.lesson.repository.LessonTempRepository;

import com.kosa.fillinv.review.repository.ReviewRepository;
import com.kosa.fillinv.schedule.entity.ScheduleStatus;
import com.kosa.fillinv.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

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

    private static final int BAYESIAN_AVERAGE_WEIGHT = 5; // 베이지안 평균 가중치
    private static final double RECENT_APP_COUNT_WEIGHT = 0.6;
    private static final double REVIEW_COUNT_WEIGHT = 0.2;
    private static final double BAYESIAN_AVG_WEIGHT = 0.2;
    private final LessonRepository lessonRepository;
    private final ScheduleRepository scheduleRepository;
    private final ReviewRepository reviewRepository;
    private final LessonTempRepository lessonTempRepository;
    private final LessonBulkRepository lessonBulkRepository;
    private final TransactionTemplate transactionTemplate;

    @Scheduled(cron = "0 0 1 * * *")
    public void updateLessonPopularity() {

        // 점수 초기화
        transactionTemplate.executeWithoutResult(status -> resetAllScores());

        // 계산 및 Temp 저장
        transactionTemplate.executeWithoutResult(status -> calculateAndSaveToTemp());

        // Lesson 업데이트
        transactionTemplate.executeWithoutResult(status -> updateLessonsFromTemp());

    }

    // 서버 실행 시 시작 (개발 단계)
    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        updateLessonPopularity();
    }

    private void resetAllScores() {
        lessonRepository.resetAllPopularityScores();
    }

    private void calculateAndSaveToTemp() {

        Instant now = Instant.now();
        List<Lesson> activeLessons = lessonRepository.findAllByDeletedAtIsNull();
        if (activeLessons.isEmpty()) {
            return;
        }

        Instant startDate = now.minus(7, ChronoUnit.DAYS);

        // 최근 7일 신청 조회
        Map<String, Long> recentStatsMap = scheduleRepository.countByLessonIdAndCreatedAtAfter(startDate).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]));

        // 전체 기간 상태별 신청 수 조회 (취소율 계산용)
        List<Object[]> statusStats = scheduleRepository.countByLessonIdGroupedByStatus();
        Map<String, Map<ScheduleStatus, Long>> statusCountsMap = new HashMap<>();

        for (Object[] row : statusStats) {
            String lessonId = (String) row[0];
            ScheduleStatus status = (ScheduleStatus) row[1];
            Long count = (Long) row[2];

            statusCountsMap.computeIfAbsent(lessonId, k -> new HashMap<>()).put(status, count);
        }

        // 리뷰 관련 계산
        List<Object[]> allReviews = reviewRepository.findAllReviewsForRanking();
        Map<String, ReviewStat> reviewStatsMap = new HashMap<>();

        long maxRecentAppCount = 0;
        long maxReviewCount = 0;

        Map<String, Double> lessonWeightedScoreSum = new HashMap<>();
        Map<String, Double> lessonWeightSum = new HashMap<>();
        Map<String, Long> lessonReviewCount = new HashMap<>();

        double totalGlobalWeightedScoreSum = 0.0;
        double totalGlobalWeightSum = 0.0;

        for (Object[] row : allReviews) {
            String lessonId = (String) row[0];
            Double score = (Double) row[1];
            Instant createdAt = (Instant) row[2];

            // Time Decay 가중치 계산 (반감기 1년 = 365일)
            long daysSince = ChronoUnit.DAYS.between(createdAt, now);
            double weight = Math.pow(0.5, daysSince / 365.0);

            lessonWeightedScoreSum.merge(lessonId, score * weight, Double::sum);
            lessonWeightSum.merge(lessonId, weight, Double::sum);
            lessonReviewCount.merge(lessonId, 1L, Long::sum);

            totalGlobalWeightedScoreSum += (score * weight);
            totalGlobalWeightSum += weight;
        }

        for (String lessonId : lessonReviewCount.keySet()) {
            Long count = lessonReviewCount.get(lessonId);
            Double wSum = lessonWeightedScoreSum.get(lessonId);
            Double wWeight = lessonWeightSum.get(lessonId);
            Double weightedAvg = (wWeight > 0) ? (wSum / wWeight) : 0.0;

            reviewStatsMap.put(lessonId, new ReviewStat(count, weightedAvg));

            if (count > maxReviewCount)
                maxReviewCount = count;
        }

        for (Long count : recentStatsMap.values()) {
            if (count > maxRecentAppCount)
                maxRecentAppCount = count;
        }

        double C = (totalGlobalWeightSum > 0) ? (totalGlobalWeightedScoreSum / totalGlobalWeightSum) : 0.0;
        final double MAX_RATING = 5.0;

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
            if (v + BAYESIAN_AVERAGE_WEIGHT > 0) {
                bayesianAvg = ((double) v / (v + BAYESIAN_AVERAGE_WEIGHT)) * R
                        + ((double) BAYESIAN_AVERAGE_WEIGHT / (v + BAYESIAN_AVERAGE_WEIGHT)) * C;
            }

            double normRecentApp = (maxRecentAppCount > 0) ? (double) recentAppCount / maxRecentAppCount : 0.0;
            double normReviewCount = (maxReviewCount > 0) ? (double) v / maxReviewCount : 0.0;
            double normRating = bayesianAvg / MAX_RATING;

            // 기본 점수 (가중치 적용)
            double baseScore = (normRecentApp * RECENT_APP_COUNT_WEIGHT)
                    + (normReviewCount * REVIEW_COUNT_WEIGHT)
                    + (normRating * BAYESIAN_AVG_WEIGHT);

            // 취소율 패널티 적용
            Map<ScheduleStatus, Long> counts = statusCountsMap.getOrDefault(lessonId, new HashMap<>());
            long canceled = counts.getOrDefault(ScheduleStatus.CANCELED, 0L);
            long approved = counts.getOrDefault(ScheduleStatus.APPROVED, 0L);
            long completed = counts.getOrDefault(ScheduleStatus.COMPLETED, 0L);
            long pending = counts.getOrDefault(ScheduleStatus.APPROVAL_PENDING, 0L);

            // PAYMENT_PENDING 은 허수일 가능성이 높으므로 모수에서 제외
            long totalValidRequests = canceled + approved + completed + pending;
            double cancellationRate = (totalValidRequests > 0) ? (double) canceled / totalValidRequests : 0.0;

            // 패널티 적용: (1 - 취소율) 곱하기
            double finalScore = baseScore * (1.0 - cancellationRate);

            double scaledScore = finalScore * 100.0;
            double roundedScore = Math.round(scaledScore * 100.0) / 100.0;

            tempToSave.add(new LessonTemp(lessonId, roundedScore));
        }

        lessonTempRepository.deleteAll();
        lessonBulkRepository.bulkInsertLessonTemp(tempToSave);
    }

    private void updateLessonsFromTemp() {
        List<LessonTemp> temps = lessonTempRepository.findAll();
        if (temps.isEmpty()) {
            return;
        }

        lessonBulkRepository.bulkUpdatePopularity(temps);
    }

    record ReviewStat(Long count, Double avgScore) {
    }
}

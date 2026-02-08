package com.kosa.fillinv.lesson.repository;

import com.kosa.fillinv.lesson.entity.LessonTemp;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class LessonBulkRepository {

    private static final int BATCH_SIZE = 500;
    private final JdbcTemplate jdbcTemplate;

    /**
     * LessonTemp 테이블에 데이터 대량 삽입
     */
    public void bulkInsertLessonTemp(List<LessonTemp> temps) {
        String sql = "INSERT INTO lesson_temp (id, lesson_id, score) VALUES (?, ?, ?)";

        for (int i = 0; i < temps.size(); i += BATCH_SIZE) {
            int end = Math.min(temps.size(), i + BATCH_SIZE);
            List<LessonTemp> batchList = temps.subList(i, end);

            jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int j) throws SQLException {
                    LessonTemp temp = batchList.get(j);
                    ps.setString(1, temp.getId());
                    ps.setString(2, temp.getLessonId());
                    ps.setDouble(3, temp.getScore());
                }

                @Override
                public int getBatchSize() {
                    return batchList.size();
                }
            });
        }
    }

    /**
     * lessons 테이블의 인기 점수 대량 업데이트
     */
    public void bulkUpdatePopularity(List<LessonTemp> temps) {
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
}

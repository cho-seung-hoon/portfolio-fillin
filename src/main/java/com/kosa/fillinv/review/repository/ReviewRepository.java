package com.kosa.fillinv.review.repository;

import com.kosa.fillinv.review.dto.ReviewWithNicknameVO;
import com.kosa.fillinv.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {

    @Query("SELECT AVG(r.score) FROM Review r WHERE r.lessonId = :lessonId")
    Double findAverageScoreByLessonId(@Param("lessonId") String lessonId);

    @EntityGraph(attributePaths = { "writer" })
    @Query("SELECT new com.kosa.fillinv.review.dto.ReviewWithNicknameVO(r, r.writer.nickname) " +
            "FROM Review r " +
            "WHERE r.lessonId = :lessonId")
    Page<ReviewWithNicknameVO> findReviewsWithNicknameByLessonId(@Param("lessonId") String lessonId, Pageable pageable);
}

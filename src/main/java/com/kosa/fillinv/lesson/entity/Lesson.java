package com.kosa.fillinv.lesson.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import com.kosa.fillinv.global.exception.ResourceException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "lessons")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Lesson extends BaseEntity {

    @Id
    @Column(name = "lesson_id", nullable = false)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    private LessonType lessonType; // 1:1, 1:N 등

    @Column(name = "thumbnail_image", nullable = false)
    private String thumbnailImage;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "close_at")
    private Instant closeAt;

    @Column(name = "mentor_id", nullable = false)
    private String mentorId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "price")
    private Integer price;

    @Column(name = "seats")
    private Integer seats;

    @Column(name = "category_path", nullable = false)
    private String categoryPath;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<AvailableTime> availableTimeList;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Option> optionList;

    @Column(name = "popularity_score", nullable = false)
    @ColumnDefault("0.0")
    private Double popularityScore = 0.0;

    @Builder
    public Lesson(String id,
                  String title,
                  LessonType lessonType,
                  String thumbnailImage,
                  String description,
                  String location,
                  String mentorId,
                  Long categoryId,
                  String categoryPath,
                  Instant closeAt,
                  Integer price,
                  Integer seats) {
        this.id = id;
        this.title = title;
        this.lessonType = lessonType;
        this.thumbnailImage = thumbnailImage;
        this.description = description;
        this.location = location;
        this.mentorId = mentorId;
        this.categoryId = categoryId;
        this.categoryPath = categoryPath;
        this.closeAt = closeAt;
        this.price = price;
        this.seats = seats;
        this.availableTimeList = new ArrayList<>();
        this.optionList = new ArrayList<>();
    }

    public void updateTitle(String title) {
        if (title.isBlank()) return;
        this.title = title;
    }

    public void updateThumbnailImage(String thumbnailImageUrl) {
        if (thumbnailImageUrl == null || thumbnailImageUrl.isBlank()) return;
        this.thumbnailImage = thumbnailImageUrl;
    }

    public void updateCloseAt(Instant closeAt) {
        if (closeAt == null) return;
        this.closeAt = closeAt;
    }

    public void updateDescription(String description) {
        if (description.isBlank()) return;
        this.description = description;
    }

    public void updateLocation(String location) {
        if (location.isBlank()) return;
        this.location = location;
    }

    public void updateCategory(Long categoryId, String categoryPath) {
        if (categoryId == null || categoryPath == null || categoryPath.isBlank()) return;
        this.categoryId = categoryId;
        this.categoryPath = categoryPath;
    }

    @Override
    public void delete() {
        deletedAt = Instant.now();
        availableTimeList.forEach(AvailableTime::delete);
        optionList.forEach(Option::delete);
    }

    public void addAvailableTime(AvailableTime availableTime) {
        availableTime.setLesson(this);
        this.availableTimeList.add(availableTime);
    }

    public void addAvailableTime(List<AvailableTime> availableTimeList) {
        availableTimeList.forEach(this::addAvailableTime);
    }

    public void removeAvailableTime(String availableTimeId) {
        this.availableTimeList.forEach(availableTime -> {
            if (availableTime.getId().equals(availableTimeId)) availableTime.delete();
        });
    }

    public void removeAvailableTime(List<String> availableTimeIdList) {
        this.availableTimeList.forEach(availableTime -> {
            if (availableTimeIdList.contains(availableTime.getId())) availableTime.delete();
        });
    }

    public List<AvailableTime> getAvailableTimeList() {
        return availableTimeList.stream().filter(availableTime -> availableTime.getDeletedAt() == null).toList();
    }

    public void addOption(Option option) {
        option.setLesson(this);
        this.optionList.add(option);
    }

    public void addOption(List<Option> optionList) {
        optionList.forEach(this::addOption);
    }

    public void removeOption(String optionId) {
        this.optionList.forEach(option -> {
            if (option.getId().equals(optionId)) option.delete();
        });
    }

    public void removeOption(List<String> optionIdList) {
        this.optionList.forEach(option -> {
            if (optionIdList.contains(option.getId())) option.delete();
        });
    }

    public void updatePopularityScore(Double score) {
        this.popularityScore = (score == null) ? 0.0 : score;
    }

    public List<Option> getOptionList() {
        return optionList.stream().filter(option -> option.getDeletedAt() == null).toList();
    }

    public void validateOwnership(String ownerId) {
        if (!this.mentorId.equals(ownerId)) {
            throw new ResourceException.AccessDenied("해당 레슨에 대한 권한이 없습니다.");
        }
    }

    public void updateMinPrice(int minPrice) {
        this.price = minPrice;
    }
}

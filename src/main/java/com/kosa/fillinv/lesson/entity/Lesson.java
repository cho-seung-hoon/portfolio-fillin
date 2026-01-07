package com.kosa.fillinv.lesson.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "lessons")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Lesson {

    @Id
    @Column(name = "lesson_id", nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    private LessonType lessonType; // 1:1, 1:N 등

    @Column(name = "thumbnail_image", nullable = false)
    private String thumbnailImage;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "close_at")
    private LocalDateTime closeAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "memtor_id", nullable = false)
    private String mentorId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<AvailableTime> availableTimeList = new ArrayList<>();

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private List<Option> optionList = new ArrayList<>();

    @Builder
    public Lesson(String id,
                  LessonType lessonType,
                  String thumbnailImage,
                  String description,
                  String location,
                  String mentorId,
                  Long categoryId,
                  LocalDateTime closeAt) {
        this.id = id;
        this.lessonType = lessonType;
        this.thumbnailImage = thumbnailImage;
        this.description = description;
        this.location = location;
        this.mentorId = mentorId;
        this.categoryId = categoryId;
        this.createdAt = LocalDateTime.now();
        this.closeAt = closeAt;
        this.updatedAt = null;
        this.deletedAt = null;
    }

    public void updateThumbnailImage(String thumbnailImageUrl) {
        if (thumbnailImageUrl.isBlank()) return;
        this.thumbnailImage = thumbnailImageUrl;
    }

    public void updateCloseAt(LocalDateTime closeAt) {
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

    public void updateCategoryId(Long categoryId) {
        if (categoryId == null) return;
        this.categoryId = categoryId;
    }

    public void delete() {
        deletedAt = LocalDateTime.now();
        availableTimeList.forEach(AvailableTime::delete);
        optionList.forEach(Option::delete);
    }

    public  void addAvailableTime(AvailableTime availableTime) {
        availableTime.setLesson(this);
        this.availableTimeList.add(availableTime);
    }

    public void addAvailableTime(List<AvailableTime> availableTimeList) {
        this.availableTimeList.addAll(availableTimeList);
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
        this.optionList.addAll(optionList);
    }

    public void removeOption(String optionId) {
        this.optionList.forEach( option -> {
            if (option.getId().equals(optionId)) option.delete();
        });
    }

    public void removeOption(List<String> optionIdList) {
        this.optionList.forEach( option -> {
            if (optionIdList.contains(option.getId())) option.delete();
        });
    }

    public List<Option> getOptionList() {
        return optionList.stream().filter(option -> option.getDeletedAt() == null).toList();
    }
}

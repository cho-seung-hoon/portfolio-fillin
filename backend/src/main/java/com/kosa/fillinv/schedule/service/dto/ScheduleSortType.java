package com.kosa.fillinv.schedule.service.dto;

import lombok.Getter;
import org.springframework.data.domain.Sort;

import java.util.Arrays;

@Getter
public enum ScheduleSortType {
    START_TIME_ASC("startTime", Sort.Direction.ASC),
    START_TIME_DESC("startTime", Sort.Direction.DESC)
    ;

    private final String property;
    private final Sort.Direction direction;

    ScheduleSortType(String property, Sort.Direction direction) {
        this.property = property;
        this.direction = direction;
    }

    public static ScheduleSortType from(String value) {
        return Arrays.stream(values())
                .filter(type -> type.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("지원하지 않는 정렬 타입입니다: " + value)
                );
    }

    public Sort toSort() {
        return Sort.by(direction, property);
    }
}

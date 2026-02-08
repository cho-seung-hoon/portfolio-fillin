package com.kosa.fillinv.lesson.service.dto;

public record CreateOptionCommand(
        String name,
        Integer minute,
        Integer price
) {
}

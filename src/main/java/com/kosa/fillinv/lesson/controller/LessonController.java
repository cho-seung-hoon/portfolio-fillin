package com.kosa.fillinv.lesson.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.lesson.controller.dto.RegisterLessonRequest;
import com.kosa.fillinv.lesson.controller.dto.RegisterLessonResponse;
import com.kosa.fillinv.lesson.service.LessonRegisterService;
import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/lessons")
public class LessonController {

    private final LessonRegisterService lessonRegisterService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SuccessResponse<RegisterLessonResponse> registerLesson(
            @RequestPart("request") RegisterLessonRequest request,
            @RequestPart(value = "thumbnail") MultipartFile thumbnail
    ) {
        CreateLessonResult createLessonResult = lessonRegisterService.registerLesson(RegisterLessonRequest.toCommand(request), thumbnail);

        return SuccessResponse.success(HttpStatus.OK, RegisterLessonResponse.of(createLessonResult));
    }

}

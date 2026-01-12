package com.kosa.fillinv.lesson.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.lesson.controller.dto.PageResponse;
import com.kosa.fillinv.lesson.controller.dto.RegisterLessonRequest;
import com.kosa.fillinv.lesson.controller.dto.RegisterLessonResponse;
import com.kosa.fillinv.lesson.service.LessonReadService;
import com.kosa.fillinv.lesson.service.LessonRegisterService;
import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;
import com.kosa.fillinv.lesson.service.dto.LessonSearchCondition;
import com.kosa.fillinv.lesson.service.dto.LessonThumbnail;
import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/lessons")
public class LessonController {

    private final LessonRegisterService lessonRegisterService;
    private final LessonReadService lessonReadService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SuccessResponse<RegisterLessonResponse> registerLesson(
            @RequestPart("request") RegisterLessonRequest request,
            @RequestPart(value = "thumbnail") MultipartFile thumbnail,
            @AuthenticationPrincipal UserDetails principal
    ) {
        String mentorId = principal.getUsername();

        RegisterLessonCommand command = request.toCommand(mentorId);

        CreateLessonResult createLessonResult = lessonRegisterService.registerLesson(command, thumbnail);

        return SuccessResponse.success(HttpStatus.OK, RegisterLessonResponse.of(createLessonResult));
    }

    @GetMapping("/search")
    public SuccessResponse<PageResponse<LessonThumbnail>> search(
            @ModelAttribute LessonSearchCondition condition
    ) {
        Page<LessonThumbnail> result = lessonReadService.search(condition);

        return SuccessResponse.success(HttpStatus.OK, PageResponse.from(result));
    }

}

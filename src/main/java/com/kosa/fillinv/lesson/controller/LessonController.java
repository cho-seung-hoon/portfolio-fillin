package com.kosa.fillinv.lesson.controller;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.lesson.controller.dto.*;
import com.kosa.fillinv.lesson.service.LessonReadService;
import com.kosa.fillinv.lesson.service.LessonRegisterService;
import com.kosa.fillinv.lesson.service.LessonService;
import com.kosa.fillinv.lesson.service.dto.*;
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
    private final LessonService lessonService;

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

    @GetMapping("/mine")
    public SuccessResponse<PageResponse<LessonThumbnail>> mine(
            @AuthenticationPrincipal UserDetails principal,
            @ModelAttribute LessonSearchCondition condition
    ) {
        String mentorId = principal.getUsername();

        Page<LessonThumbnail> result = lessonReadService.searchOwnedBy(condition, mentorId);

        return SuccessResponse.success(HttpStatus.OK, PageResponse.from(result));
    }

    @GetMapping("/{lessonId}")
    public SuccessResponse<LessonDetailResult> detail(
            @PathVariable String lessonId
    ) {
        LessonDetailResult detail = lessonReadService.detail(new LessonDetailCommand(lessonId));

        return SuccessResponse.success(HttpStatus.OK, detail);
    }

    @PatchMapping("/{lessonId}")
    public SuccessResponse<EditLessonResponse> edit(
            @PathVariable String lessonId,
            @RequestPart("request") EditLessonRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @AuthenticationPrincipal UserDetails principal
    ) {

        UpdateLessonResult updateLessonResult = lessonRegisterService.editLesson(
                lessonId, request.toCommand(), thumbnail, principal.getUsername());

        return SuccessResponse.success(HttpStatus.OK, EditLessonResponse.of(updateLessonResult));
    }

    @DeleteMapping("/{lessonId}")
    public SuccessResponse<Void> delete(
            @PathVariable String lessonId,
            @AuthenticationPrincipal UserDetails principal
    ) {

        lessonService.deleteLesson(lessonId, principal.getUsername());

        return SuccessResponse.success(HttpStatus.OK);
    }
}

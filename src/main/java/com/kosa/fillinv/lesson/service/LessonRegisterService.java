package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.global.util.UploadFileResult;
import com.kosa.fillinv.lesson.error.LessonError;
import com.kosa.fillinv.lesson.service.dto.CreateLessonCommand;
import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;
import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import static com.kosa.fillinv.lesson.error.LessonError.*;

@Component
@RequiredArgsConstructor
public class LessonRegisterService {

    private final LessonService lessonService;
    private final FileStorage fileStorage;

    public CreateLessonResult registerLesson(RegisterLessonCommand command, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResourceException.InvalidArgument(THUMBNAIL_IMAGE_REQUIRED);
        }

        UploadFileResult upload = fileStorage.upload(file);

        try {
            CreateLessonCommand createLessonCommand = command.toCreateLessonCommand(upload.fileKey());
            return lessonService.createLesson(createLessonCommand);
        } catch (Exception e) {
            fileStorage.delete(upload.fileKey());
            throw e;
        }
    }
}

package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.global.util.UploadFileResult;
import com.kosa.fillinv.lesson.service.dto.CreateLessonCommand;
import com.kosa.fillinv.lesson.service.dto.CreateLessonResult;
import com.kosa.fillinv.lesson.service.dto.RegisterLessonCommand;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class LessonRegisterService {

    private final LessonService lessonService;
    private final FileStorage fileStorage;

    public CreateLessonResult registerLesson(RegisterLessonCommand command, MultipartFile file) {

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

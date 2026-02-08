package com.kosa.fillinv.lesson.service;

import com.kosa.fillinv.category.entity.Category;
import com.kosa.fillinv.category.service.CategoryService;
import com.kosa.fillinv.global.exception.ResourceException;
import com.kosa.fillinv.global.util.FileStorage;
import com.kosa.fillinv.global.util.UploadFileResult;
import com.kosa.fillinv.lesson.service.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import static com.kosa.fillinv.lesson.error.LessonError.*;

@Component
@RequiredArgsConstructor
public class LessonRegisterService {

    private final LessonService lessonService;
    private final FileStorage fileStorage;
    private final CategoryService categoryService;

    public CreateLessonResult registerLesson(RegisterLessonCommand command, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResourceException.InvalidArgument(THUMBNAIL_IMAGE_REQUIRED);
        }

        UploadFileResult upload = fileStorage.upload(file);

        try {
            Category category = categoryService.getCategoryById(command.categoryId());

            CreateLessonCommand createLessonCommand = command.toCreateLessonCommand(category.getCategoryPath(), upload.fileKey());
            return lessonService.createLesson(createLessonCommand);
        } catch (Exception e) {
            fileStorage.delete(upload.fileKey());
            throw e;
        }
    }

    public UpdateLessonResult editLesson(
            String lessonId,
            EditLessonCommand command,
            MultipartFile file,
            String ownerId
    ) {
        UploadFileResult upload = null;
        if (file != null && !file.isEmpty()) {
            upload = fileStorage.upload(file);
        }

        try {
            String categoryPath = null;
            if (command.categoryId() != null) {
                categoryPath = categoryService.getCategoryById(command.categoryId()).getCategoryPath();
            }

            UpdateLessonCommand updateLessonCommand = command.toUpdateLessonCommand(categoryPath, upload);
            return lessonService.updateLesson(lessonId, updateLessonCommand, ownerId);
        } catch (Exception e) {
            if (upload != null) {
                fileStorage.delete(upload.fileKey());
            }
            throw e;
        }

    }
}

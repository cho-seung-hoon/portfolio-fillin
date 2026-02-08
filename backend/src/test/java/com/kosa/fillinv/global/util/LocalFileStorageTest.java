package com.kosa.fillinv.global.util;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;


class LocalFileStorageTest {

    private final LocalFileStorage fileStorage = new LocalFileStorage();

    @Test
    void exists() {

        String fileKey = "dummy.png"; // 미리 준비된 데이터

        boolean isExists = fileStorage.exists(fileKey);
        assertThat(isExists).isTrue();
    }

    @Test
    void upload() {
        // given
        Path filePath = Paths.get("src/test/resources/files/dummy.png");

        // when
        UploadFileResult uploadResult = uploadFile(filePath);

        // then
        assertThat(fileStorage.exists(uploadResult.fileKey())).isTrue();
        assertThat(uploadResult.originalFilename()).isEqualTo("dummy.png");
        assertThat(uploadResult.fileKey()).isNotEmpty();
    }

    @Test
    void delete() {
        // given
        Path filePath = Paths.get("src/test/resources/files/dummy.png");

        UploadFileResult uploadResult = uploadFile(filePath);

        // when
        fileStorage.delete(uploadResult.fileKey());

        // then
        assertThat(fileStorage.exists(uploadResult.fileKey())).isFalse();
    }

    private UploadFileResult uploadFile(Path filePath) {
        MultipartFile file;
        try (InputStream is = Files.newInputStream(filePath)) {
            file = new MockMultipartFile(
                    "file",
                    filePath.getFileName().toString(),
                    Files.probeContentType(filePath),
                    is
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // 2. 파일 업로드
        UploadFileResult uploadResult = fileStorage.upload(file);
        return uploadResult;
    }
}
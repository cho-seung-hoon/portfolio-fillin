package com.kosa.fillinv.global.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class LocalFileStorage implements FileStorage {

    private static final String BASE_PATH = "src/test/resources/files";

    public static String getExtension(String filename) {
        if (filename == null) {
            return "";
        }

        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    @Override
    public UploadFileResult upload(MultipartFile file) {
        try {
            Path directoryPath = Paths.get(BASE_PATH);
            Files.createDirectories(directoryPath);

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                throw new IllegalArgumentException("파일명이 존재하지 않습니다.");
            }

            String extension = getExtension(originalFilename);
            String fileKey = UUID.randomUUID() + "." + extension;

            Path targetPath = directoryPath.resolve(fileKey);
            Files.write(targetPath, file.getBytes());

            return new UploadFileResult(originalFilename, fileKey);

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    @Override
    public void delete(String fileKey) {
        try {
            Path filePath = Paths.get(BASE_PATH).resolve(fileKey);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패", e);
        }
    }

    @Override
    public boolean exists(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            return false;
        }

        Path filePath = Paths.get(BASE_PATH).resolve(fileKey);
        return Files.exists(filePath);
    }
}

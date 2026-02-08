package com.kosa.fillinv.global.util;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorage {

    UploadFileResult upload(MultipartFile file);

    void delete(String fileKey);

    boolean exists(String fileKey);

}

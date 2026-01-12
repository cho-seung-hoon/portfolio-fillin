package com.kosa.fillinv.lesson.api;

import com.kosa.fillinv.global.response.SuccessResponse;
import com.kosa.fillinv.lesson.controller.dto.PageResponse;
import com.kosa.fillinv.lesson.service.dto.LessonThumbnail;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;

class LessonApiTest {

    RestClient client = RestClient.create("http://localhost:8080");

    @Test
    void register_multipart_json_and_file() {

        // 1️⃣ JSON 바디
        String jsonBody = """
                        {
                          "title": "백엔드 개발자 멘토링",
                          "lessonType": "MENTORING",
                          "description": "주니어 백엔드 개발자를 위한 1:1 멘토링 레슨입니다.",
                          "location": "서울 강남구",
                          "mentorId": "mentor-123",
                          "categoryId": 1,
                          "closeAt": "2025-01-31T23:59:59Z",
                          "price": null,
                          "optionList": [
                            {
                              "name": "30분 멘토링",
                              "minute": 30,
                              "price": 30000
                            },
                            {
                              "name": "60분 멘토링",
                              "minute": 60,
                              "price": 55000
                            }
                          ],
                          "availableTimeList": [
                            {
                              "startTime": "2025-01-10T05:00:00Z",
                              "endTime": "2025-01-10T07:00:00Z",
                              "price": 50000
                            },
                            {
                              "startTime": "2025-01-17T05:00:00Z",
                              "endTime": "2025-01-17T07:00:00Z",
                              "price": 50000
                            }
                          ]
                        }
                """;

        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);
        jsonHeaders.setAcceptCharset(
                java.util.List.of(StandardCharsets.UTF_8)
        );

        HttpEntity<String> jsonPart =
                new HttpEntity<>(jsonBody, jsonHeaders);

        // 2️⃣ 파일 파트
        FileSystemResource file =
                new FileSystemResource("src/test/resources/files/dummy.png");

        // 3️⃣ multipart body 구성
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("request", jsonPart);   // @RequestPart("request")
        body.add("thumbnail", file);     // @RequestPart("thumbnail")

        // 4️⃣ 요청 전송
        String response = client.post()
                .uri("/api/v1/lessons")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);

        System.out.println("response = " + response);
    }

    @Test
    void search() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri("/api/v1/lessons/search")
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchKeyword() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("keyword", "Spring")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchLessonType() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("lessonType", "MENTORING")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchCategoryId() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("categoryId", 1L)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchKeywordAndLessonType() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("keyword", "Spring")
                        .queryParam("lessonType", "MENTORING")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchKeywordAndCategoryId() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("keyword", "백엔드")
                        .queryParam("categoryId", 1L)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchLessonTypeAndCategoryId() {
        SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/lessons/search")
                        .queryParam("lessonType", "ONEDAY")
                        .queryParam("categoryId", 1L)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<
                        SuccessResponse<PageResponse<LessonThumbnail>>>() {
                });

        body.data().content().forEach(System.out::println);
    }

    @Test
    void searchPageable() {
        int page = 0;
        while (true) {
            int finalPage = page;
            SuccessResponse<PageResponse<LessonThumbnail>> body = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/lessons/search")
                            .queryParam("page", finalPage)
                            .queryParam("size", 5)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<
                            SuccessResponse<PageResponse<LessonThumbnail>>>() {
                    });

            body.data().content().forEach(System.out::println);
            System.out.println(body.data());
            page++;
            if (body.data().totalElements() == ((long) body.data().size() * body.data().page()) + body.data().content().size()) {
                break;
            }
        }
    }


}
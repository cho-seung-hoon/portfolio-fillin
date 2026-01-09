package com.kosa.fillinv.global.log;

import org.springframework.web.util.ContentCachingRequestWrapper;
import java.nio.charset.StandardCharsets;

public record RequestLogMessage (
    String httpMethod,
    String requestUri,
    String requestBody
) {
    public static RequestLogMessage createInstance(
        // Wrapper - 데이터를 메모리에 캐싱해두어, 컨트롤러도 읽고 로그도 읽을 수 있도록 (Http 요청의 Body는 한 번 읽으면 사라지는 휘발성 스트림이기 때문)
        final ContentCachingRequestWrapper requestWrapper
    ) {
        return new RequestLogMessage(
                requestWrapper.getMethod(),
                requestWrapper.getRequestURI(),
                getRequestBody(requestWrapper)
            );
        }

        // 요청 본문을 바이트 배열에서 문자열로 변환
        private static String getRequestBody(final ContentCachingRequestWrapper request) {
            return new String(request.getContentAsByteArray(), StandardCharsets.UTF_8);
    }
}


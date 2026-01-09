package com.kosa.fillinv.global.exception;

import com.kosa.fillinv.global.response.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.boot.test.mock.mockito.MockBean;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.TestController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, GlobalExceptionHandlerTest.TestController.class})
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

//    @MockBean
//    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @RestController
    public static class TestController {
        @GetMapping("test/resource-not-found")
        public void throwResourceNotFoundException() {
            throw new ResourceException.NotFound("테스트용 에러 메세지입니다");
        }

        @GetMapping("test/runtime-exception")
        public void throwRuntimeException() {
            throw new RuntimeException("테스트용 알 수 없는 서버 에러 메세지입니다");
        }
    }

    @Test
    @DisplayName("ResourceNotFound 예외 발생 시 404 상태코드와 에러 응답(G01)을 반환")
    void handleResourceException() throws Exception {
        // given
        String url = "/test/resource-not-found";

        // when
        ResultActions result = mockMvc.perform(get(url)
                .contentType(MediaType.APPLICATION_JSON));

        // then
        result.andDo(print())
                .andExpect(status().isNotFound()) // 404 상태 코드 기대
                .andExpect(jsonPath("$.code").value(ErrorCode.RESOURCE_NOT_FOUND.getCode()))
                // 구체적인 메세지 전달이 가능하도록
                .andExpect(jsonPath("$.message").value("테스트용 에러 메세지입니다"));
    }

    @Test
    @DisplayName("알 수 없는 런타임 예외 발생 시 500 상태코드와 공통 에러 응답(S01)을 반환")
    void handleException() throws Exception {
        // given
        String url = "/test/runtime-exception";

        // when
        ResultActions result = mockMvc.perform(get(url)
                .contentType(MediaType.APPLICATION_JSON));

        // then
        result.andDo(print())
                .andExpect(status().isInternalServerError()) // 500 상태 코드 기대
                .andExpect(jsonPath("$.code").value(ErrorCode.SERVER_ERROR.getCode()))
                // 보안 상 500 에러 메세지는 고정된 메세지 전달
                .andExpect(jsonPath("$.message").value(ErrorCode.SERVER_ERROR.getMessage()));
    }
}
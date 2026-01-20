package com.kosa.fillinv.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // http://localhost:8080/resources/files/logo.png 요청이 들어오면
        // src/main/resources/static/ 하위에서 파일을 찾도록 매핑
        registry.addResourceHandler("/resources/files/**")
                .addResourceLocations("classpath:/files/");
    }
}
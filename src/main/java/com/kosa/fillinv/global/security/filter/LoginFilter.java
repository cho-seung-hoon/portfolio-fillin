package com.kosa.fillinv.global.security.filter;

import com.kosa.fillinv.global.security.jwt.JWTUtil;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.response.ErrorResponse;
import com.kosa.fillinv.member.dto.security.LoginRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;
    private final Long jwtExpirationTime;
    private final ObjectMapper objectMapper;
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        try {
            LoginRequest loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);

            if (!validator.validate(loginRequest).isEmpty()) {
                throw new AuthenticationException("Validation failed") {
                };
            }

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    loginRequest.email(), loginRequest.password(), null);

            return authenticationManager.authenticate(authToken);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authResult) {
        CustomMemberDetails customMemberDetails = (CustomMemberDetails) authResult.getPrincipal();
        String email = customMemberDetails.getUsername();
        String memberId = customMemberDetails.getMemberId();

        String token = jwtUtil.createJwt(email, memberId, jwtExpirationTime);

        response.addHeader("Authorization", "Bearer " + token);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException failed) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ErrorResponse errorResponse = ErrorResponse.error(ErrorCode.LOGIN_FAILED);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}

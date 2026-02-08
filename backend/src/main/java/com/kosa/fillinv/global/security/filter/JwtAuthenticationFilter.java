package com.kosa.fillinv.global.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kosa.fillinv.global.response.ErrorCode;
import com.kosa.fillinv.global.response.ErrorResponse;
import com.kosa.fillinv.global.security.details.CustomMemberDetails;
import com.kosa.fillinv.global.security.jwt.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            if (jwtUtil.isTokenExpired(token)) {
                sendErrorResponse(response);
                return;
            }

            String email = jwtUtil.getEmail(token);
            String memberId = jwtUtil.getMemberId(token);

            CustomMemberDetails customMemberDetails = new CustomMemberDetails(memberId, email, "N/A",
                    java.util.Collections.emptyList());

            Authentication authToken = new UsernamePasswordAuthenticationToken(customMemberDetails, null,
                    customMemberDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authToken);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT Authentication Failed", e);
            sendErrorResponse(response);
        }
    }

    private void sendErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        ErrorResponse errorResponse = ErrorResponse.error(ErrorCode.INVALID_TOKEN);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}

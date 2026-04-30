package com.rankwell.admin.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Replacement for @EnableGlobalMethodSecurity
public class SecurityConfig {
	
	@Value("${ADMIN_SSL_ENABLED}")
	private boolean sslEnabled;

	@Value("${ADMIN_FRONTEND_URL}")
	private String frontendHost;
	
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	
	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	}

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
    	
    	  // Dynamically build full URL with protocol
        String frontendUrl = (sslEnabled ? "https" : "http") + "://" + frontendHost;
        System.out.println("CORS allowed frontend URL: " + frontendUrl);

		http
		   .cors(cors -> cors.configurationSource(request -> {
               var configuration = new org.springframework.web.cors.CorsConfiguration();
			   // Allow localhost, LAN IPs, and Tailscale IPs dynamically
            // configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://192.168.1.52:2018", "http://100.112.174.52:2018"));
//             configuration.setAllowedOrigins(List.of("http://localhost:3006"));  // For Local Development  
//             configuration.setAllowedOrigins(List.of("https://192.168.1.18:3006"));  //For Production Configuration
              // setAllowedOrigins does not accept wildcards; use patterns so any dev port (e.g. :5174) works.
              configuration.setAllowedOriginPatterns(List.of(
                      frontendUrl,
                      "http://localhost:*",
					  "http://192.168.1.211:*",
					  "http://192.168.1.*:*",
                      "http://127.0.0.1:*"));
               configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
               // Reflect browser preflight (may request authorization, content-type, etc.)
               configuration.setAllowedHeaders(List.of("*"));
               configuration.setExposedHeaders(List.of("Authorization")); 
               configuration.setAllowCredentials(true); 
               return configuration;
           }))
		  .csrf(csrf -> csrf.disable())
          // Ensure our matchers behave consistently across Spring Security versions.
          .securityMatcher("/**")
          .authorizeHttpRequests(auth -> auth
				// Public org details are used by the user-site (footer/pages).
				.requestMatchers("/organizations/details").permitAll()
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				.requestMatchers("/admin/login", "/admin/verify-otp", "/admin/password/otp/send", "/admin/password/reset")
				.permitAll()
				.requestMatchers("/upload/**").permitAll()
				.requestMatchers("/OrgData/**","/accounts/**").permitAll()
				// Uploaded media is served from `spring.web.resources.static-locations=file:upload/`
				// so a stored path like "Careers/<file>" is fetched as "/Careers/<file>".
				// Browser media tags (video/pdf) won't send Authorization headers, so these must be public.
				.requestMatchers("/Careers/**").permitAll()
				.requestMatchers("/OrgData/**").permitAll()
				.requestMatchers("/images/**","/videos/**","course/search",	"/skills/**","/api/chatbot/save","/api/chatbot/get").permitAll()
				.requestMatchers("/course-images/**","/applyfor/**","/organizations/rowStatus","/organizations/homepage/template-video",
				                "/organizations/delete/aboutustemplate-images/**","organizations/course/update","organizations/addHeading",
				                "/organizations/delete/aboutustemplate-images/**","organizations/course/update","course/selectedCourseTypes",
								"/v3/api-docs/**"
								,"/swagger-ui/**"
								, "/swagger-ui.html")
								.permitAll()
							
                .requestMatchers("/users/updatePassword/*").hasAuthority("ROLE_SUPER_ADMIN")
                .requestMatchers("/getApplicantById/*").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/admin/create").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/admin/updateStatus").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/admin/getAllAdmins").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/departments/create").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/departments/updateDepartments").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers("/departments/delete").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers( "/careers/updateByStatus/**").hasAnyAuthority("ROLE_SUPER_ADMIN","ROLE_HR")
				.requestMatchers( "/careers/archive/**","/careers/getAdminById/**").hasAuthority("ROLE_SUPER_ADMIN")
				.requestMatchers( "/careers/updateHr/**").hasAnyAuthority("ROLE_HR","ROLE_SUPER_ADMIN")
				.requestMatchers( "/careers/getAllOfHr").hasAnyAuthority("ROLE_HR","ROLE_SUPER_ADMIN")
				.requestMatchers( "/organizations/addUpdateDetails").hasAnyAuthority("ROLE_HR","ROLE_SUPER_ADMIN")
				.requestMatchers( "/organizations/details").hasAnyAuthority("ROLE_HR","ROLE_SUPER_ADMIN")

//				.requestMatchers("/admin/changePassword").hasAuthority("ROLE_SUPER_ADMIN")
				.anyRequest().authenticated())
		 		.exceptionHandling(ex -> ex
	                .accessDeniedHandler((request, response, accessDeniedException) -> {
	                    System.err.println("Access Denied: " + accessDeniedException.getMessage());
	                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
	                })
	                .authenticationEntryPoint((request, response, authException) -> {
	                    System.err.println(
	                    		"Authentication Failed: " + authException.getMessage()
	                    		+ " | " + request.getMethod()
	                    		+ " " + request.getRequestURI()
	                    		+ (request.getQueryString() != null ? "?" + request.getQueryString() : "")
	                    );
	                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
	                }))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				 .headers(headers -> headers
				            .frameOptions(frameOptions -> frameOptions
				                .sameOrigin() 
				            )
				        );
		return http.build();
	}
	
    @Bean
	 PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
}

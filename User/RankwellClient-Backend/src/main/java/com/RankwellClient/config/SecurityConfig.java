package com.RankwellClient.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
	@Value("${USER_SSL_ENABLED}")
	private boolean sslEnabled;
	@Value("${USER_FRONTEND_URL}")
	private String frontendHost;
	
	private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
	
 	 @Bean
	    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {  
		 
		  // Dynamically build full URL with protocol
	        String frontendUrl = (sslEnabled ? "https" : "http") + "://" + frontendHost;
	        System.out.println("CORS allowed frontend URL: " + frontendUrl);
	        
	        http
	        .cors(cors -> cors.configurationSource(request -> {
	              var configuration = new org.springframework.web.cors.CorsConfiguration();
				  // Allow localhost, LAN IPs, and Tailscale IPs dynamically
            // configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://192.168.1.52:2018", "http://100.112.174.52:2018"));
//	              configuration.setAllowedOrigins(List.of("http://localhost*")); // Set your frontend URL
//	              configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
//	              configuration.setAllowedOrigins(List.of(frontendUrl,"http://localhost*","http://100.105.114.103:*"));
	              configuration.setAllowedOriginPatterns(List.of(
	            		    frontendUrl,
	            		    "http://localhost:*",
							"http://192.168.1.210:*",
							"http://192.168.*:*",
	            		    "http://127.0.0.1:*",
	            		    "http://100.105.114.103:*"
	            		));// Set from global-config.properties setting 
//	              configuration.setAllowedOrigins(List.of("http://192.168.1.112:3005","http://dev.seasec.in:3005"));
	              configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
	              configuration.setAllowedHeaders(List.of(
	              		"Authorization",
	              		"Content-Type",
	              		"X-Requested-With",
	              		"Accept",
	              		"Origin",
	              		"X-OTP-Token"
	              ));
	              configuration.setExposedHeaders(List.of("Authorization")); // Allow frontend to access Authorization header
	              configuration.setAllowCredentials(true);
	              return configuration;
	          }))
	        .csrf(csrf -> csrf.disable())
	            .authorizeHttpRequests(auth -> auth
					.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
	            	.requestMatchers("/accounts/**").permitAll()
	            	.requestMatchers("/upload/**").permitAll()
					.requestMatchers("/users/otp/**").permitAll()
					.requestMatchers("/users/password/**").permitAll()
					.requestMatchers("/users/auth-ui-config").permitAll()
					.requestMatchers("/users/signup-mode").permitAll()
					.requestMatchers("/users/availability").permitAll()
					.requestMatchers("/users/oauth/google/client-id", "/users/auth/google").permitAll()
					.requestMatchers("/users/oauth/facebook/app-id", "/users/auth/facebook").permitAll()
					.requestMatchers("/users/oauth/github/**").permitAll()
					.requestMatchers("/users/timezones","/users/countries","/users/updatePassword","/api/chatbot/get").permitAll()
					.requestMatchers("/course/filter","/course/globalFilter","/rankwell/timezones","/payment/**","/paymentConfig/**").permitAll()
	                .requestMatchers("/users/signup", "/users/signin","users/uploadImage/**", "/departments/getAllDepartments", "/course/getAllCourses","/course/getCoursesWithId/{id}").permitAll()
					.requestMatchers("/v3/api-docs/**","/swagger-ui/**", "/swagger-ui.html","/wishlist/add","/invoice/**").permitAll()
	                .requestMatchers("/users/signup", "/users/signin", "/departments/getAllDepartments", "/course/getAllCourses","/course/getCoursesWithId/{id}"
	                		,"/topics/getTopicsWithId/{courseId}","/organizations/*","/organizations/details","/careers/apply","/careers/archive/**" ,"/chapter/getAllChapters/{courseId}", 
							"/topics/getAllTopics", "/notes/getPdfNotes/{topicId}","/notes/getNotesWithTopicId/{id}", "/video/{videoId}","/applyfor/**",
							"/careers/existing/**").permitAll()
	                .requestMatchers("/users/signup", "/users/signin","/users/getUser/{userId}", "/departments/getAllDepartments", "/course/getAllCourses","/course/getCoursesWithId/{id}"
	                		,"/topics/getTopicsWithId/{courseId}","/organizations/*","/organizations/details","/careers/name", "/chapter/getAllChapters/{courseId}", 
							"/topics/getAllTopics", "/notes/getPdfNotes/{topicId}","/notes/getNotesWithTopicId/{id}", "/video/{videoId}", "/api/videonotes/**","/api/videonotes/{videoId}","/user/{userId}", 
							"/topics/getTopicsContentById/{topicId}", "/api/reviews/**","course/getAllSelectedCourseType").permitAll()
	                .anyRequest().authenticated()) // Secure other endpoints
	                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless authentication
	                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
	        return http.build();
	    }

	@Bean
	WebSecurityCustomizer webSecurityCustomizer() {
		// Static files must be reachable by the browser <img> tag.
		// Ignoring removes the security filter chain entirely for this path.
		return (web) -> web.ignoring().requestMatchers("/accounts/**");
	}
	
	@Bean
    BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
		
	}

}

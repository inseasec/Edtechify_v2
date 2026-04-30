package com.rankwell.admin.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{

	
	private final JwtUtil jwtUtil;
	
	public JwtAuthenticationFilter(JwtUtil jwtUtil) {
		this.jwtUtil = jwtUtil;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authHeader = request.getHeader("Authorization");
		System.out.println("Authorization Header: " + authHeader);
		String jwtToken = null;
		String email = null;
		
		if(authHeader != null && authHeader.startsWith("Bearer ")) {
			jwtToken = authHeader.substring(7);
			
			try {
				email = jwtUtil.extractEmail(jwtToken);
				  System.out.println("Extracted Email: " + email);
		            String role = jwtUtil.extractClaim(jwtToken, claims -> claims.get("role", String.class));
		            System.out.println("Extracted Role: " + role);
				
		            if (email != null && jwtUtil.validateToken(jwtToken, email)) {
		            	 String authorityRole = "ROLE_" + role;
		            	 
		            	List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authorityRole));
		            	
		            	UsernamePasswordAuthenticationToken authentication = 
		            			new UsernamePasswordAuthenticationToken(email, null, authorities);
		            	authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		            	SecurityContextHolder.getContext().setAuthentication(authentication);
		            	System.out.println("Authentication successful for user: " + email + " with role: " + authorityRole);
		            }else {
		                System.out.println("JWT Token validation failed");
		            }
			}catch (Exception e) {
				 System.err.println("Error parsing or validating JWT: " + e.getMessage());
		         e.printStackTrace(); 
			}
		} else {
	        System.out.println("Authorization header missing or invalid");
	    }
		filterChain.doFilter(request, response);
	}
}

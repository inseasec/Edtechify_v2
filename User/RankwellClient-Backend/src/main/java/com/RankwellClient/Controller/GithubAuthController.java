package com.RankwellClient.Controller;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.RankwellClient.services.GithubAuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/users/oauth/github")
public class GithubAuthController {

	private final GithubAuthService githubAuthService;

	@Value("${USER_SSL_ENABLED}")
	private boolean sslEnabled;

	@Value("${USER_FRONTEND_URL}")
	private String frontendHost;

	// Very small in-memory state store (prevents CSRF). Good enough for single-instance deployments.
	private final Map<String, Long> stateIssuedAt = new ConcurrentHashMap<>();
	private static final long STATE_TTL_SECONDS = 10 * 60;

	public GithubAuthController(GithubAuthService githubAuthService) {
		this.githubAuthService = githubAuthService;
	}

	@GetMapping("/login")
	public ResponseEntity<Void> login(HttpServletRequest request) {
		String redirectUri = buildRedirectUri(request);
		String state = UUID.randomUUID().toString();
		stateIssuedAt.put(state, Instant.now().getEpochSecond());
		String authorizeUrl = githubAuthService.buildAuthorizeUrl(state, redirectUri);
		return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(authorizeUrl)).build();
	}

	@GetMapping("/callback")
	public ResponseEntity<Void> callback(
			@RequestParam(name = "code", required = false) String code,
			@RequestParam(name = "state", required = false) String state,
			@RequestParam(name = "error", required = false) String error,
			HttpServletRequest request) {

		String redirectUri = buildRedirectUri(request);
		String frontendBaseUrl = (sslEnabled ? "https" : "http") + "://" + frontendHost;

		if (error != null && !error.isBlank()) {
			return ResponseEntity.status(HttpStatus.FOUND)
					.location(URI.create(frontendBaseUrl + "/signin?oauthError=" + url(error)))
					.build();
		}

		if (!isValidState(state)) {
			return ResponseEntity.status(HttpStatus.FOUND)
					.location(URI.create(frontendBaseUrl + "/signin?oauthError=invalid_state"))
					.build();
		}

		try {
			String token = githubAuthService.authenticateWithCode(code, redirectUri);
			// NOTE: token in query string is not ideal, but matches your current localStorage approach.
			return ResponseEntity.status(HttpStatus.FOUND)
					.location(URI.create(frontendBaseUrl + "/signin?token=" + url(token)))
					.build();
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.FOUND)
					.location(URI.create(frontendBaseUrl + "/signin?oauthError=github_auth_failed"))
					.build();
		}
	}

	private boolean isValidState(String state) {
		if (state == null || state.isBlank()) return false;
		Long issuedAt = stateIssuedAt.remove(state);
		if (issuedAt == null) return false;
		long now = Instant.now().getEpochSecond();
		return (now - issuedAt) <= STATE_TTL_SECONDS;
	}

	private String buildRedirectUri(HttpServletRequest request) {
		// Force the scheme based on config to match your deployed setup
		String scheme = sslEnabled ? "https" : "http";
		return ServletUriComponentsBuilder.fromRequestUri(request)
				.replacePath("/users/oauth/github/callback")
				.replaceQuery(null)
				.scheme(scheme)
				.build()
				.toUriString();
	}

	private String url(String s) {
		try {
			return java.net.URLEncoder.encode(String.valueOf(s), java.nio.charset.StandardCharsets.UTF_8);
		} catch (Exception e) {
			return "";
		}
	}
}


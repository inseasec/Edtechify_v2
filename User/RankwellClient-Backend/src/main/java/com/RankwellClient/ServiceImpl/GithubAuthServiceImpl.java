package com.RankwellClient.ServiceImpl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.RankwellClient.config.JwtUtil;
import com.RankwellClient.entity.OAuthConfig;
import com.RankwellClient.entity.Users;
import com.RankwellClient.repository.OAuthConfigRepository;
import com.RankwellClient.repository.UserRepository;
import com.RankwellClient.services.GithubAuthService;

@Service
public class GithubAuthServiceImpl implements GithubAuthService {

	private final UserRepository userRepository;
	private final OAuthConfigRepository oauthConfigRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final RestTemplate restTemplate;

	public GithubAuthServiceImpl(
			UserRepository userRepository,
			BCryptPasswordEncoder passwordEncoder,
			JwtUtil jwtUtil,
			OAuthConfigRepository oauthConfigRepository) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.oauthConfigRepository = oauthConfigRepository;
		this.restTemplate = new RestTemplate();
	}

	@Override
	public String getClientId() {
		return getConfigClientId();
	}

	@Override
	public String buildAuthorizeUrl(String state, String redirectUri) {
		final String clientId = getConfigClientId();
		if (clientId.isBlank()) {
			throw new RuntimeException("GitHub Sign-In is not configured (missing USER_GITHUB_CLIENT_ID).");
		}
		String encodedRedirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
		String encodedState = URLEncoder.encode(state, StandardCharsets.UTF_8);
		// user:email is required to read verified email addresses
		return "https://github.com/login/oauth/authorize"
				+ "?client_id=" + url(clientId)
				+ "&redirect_uri=" + encodedRedirect
				+ "&scope=" + url("read:user user:email")
				+ "&state=" + encodedState;
	}

	@Override
	public String authenticateWithCode(String code, String redirectUri) {
		final String clientId = getConfigClientId();
		final String clientSecret = getConfigClientSecret();
		if (clientId.isBlank() || clientSecret.isBlank()) {
			throw new RuntimeException("GitHub Sign-In is not configured (missing USER_GITHUB_CLIENT_ID/SECRET).");
		}
		if (code == null || code.isBlank()) {
			throw new RuntimeException("Missing GitHub code.");
		}

		String accessToken = exchangeCodeForAccessToken(code.trim(), redirectUri, clientId, clientSecret);
		GithubUser user = fetchGithubUser(accessToken);
		List<GithubEmail> emails = fetchGithubEmails(accessToken);

		String email = pickBestEmail(emails);
		if (email == null || email.isBlank()) {
			throw new RuntimeException("GitHub account email not available.");
		}

		boolean emailVerified = isVerified(email, emails);
		String name = user != null ? user.nameOrLogin() : null;

		Optional<Users> existingOpt = userRepository.findByEmail(email.trim().toLowerCase());
		Users u = existingOpt.orElseGet(() -> {
			Users nu = new Users();
			nu.setEmail(email.trim().toLowerCase());
			nu.setEmailVerified(emailVerified);
			nu.setMobileNo(null);
			nu.setMobileVerified(false);
			if (name != null && !name.isBlank()) nu.setUserName(name);
			nu.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
			return userRepository.save(nu);
		});

		if (u.isFrozen()) {
			throw new RuntimeException("Account is frozen. Contact admin.");
		}
		return jwtUtil.generateToken(u.getId());
	}

	private String getConfigClientId() {
		OAuthConfig cfg = oauthConfigRepository.findById(1L).orElse(null);
		String v = cfg == null ? "" : cfg.getUserGithubClientId();
		return v == null ? "" : v.trim();
	}

	private String getConfigClientSecret() {
		OAuthConfig cfg = oauthConfigRepository.findById(1L).orElse(null);
		String v = cfg == null ? "" : cfg.getUserGithubClientSecret();
		return v == null ? "" : v.trim();
	}

	private String exchangeCodeForAccessToken(String code, String redirectUri, String clientId, String clientSecret) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(List.of(MediaType.APPLICATION_JSON));
			headers.setContentType(MediaType.APPLICATION_JSON);

			Map<String, Object> body = Map.of(
					"client_id", clientId,
					"client_secret", clientSecret,
					"code", code,
					"redirect_uri", redirectUri
			);

			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
			ResponseEntity<Map> res = restTemplate.exchange(
					"https://github.com/login/oauth/access_token",
					HttpMethod.POST,
					entity,
					Map.class);
			Map<?, ?> data = res.getBody();
			Object token = data == null ? null : data.get("access_token");
			if (token == null) throw new RuntimeException("GitHub token exchange failed.");
			String accessToken = String.valueOf(token).trim();
			if (accessToken.isBlank()) throw new RuntimeException("GitHub token exchange failed.");
			return accessToken;
		} catch (Exception e) {
			throw new RuntimeException("GitHub authentication failed.");
		}
	}

	private GithubUser fetchGithubUser(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(List.of(MediaType.APPLICATION_JSON));
			headers.set("Authorization", "Bearer " + accessToken);
			headers.set("X-GitHub-Api-Version", "2022-11-28");
			headers.set("User-Agent", "RankwellClient");

			HttpEntity<Void> entity = new HttpEntity<>(headers);
			ResponseEntity<Map> res = restTemplate.exchange(
					"https://api.github.com/user",
					HttpMethod.GET,
					entity,
					Map.class);
			Map<?, ?> data = res.getBody();
			if (data == null) return null;
			String login = data.get("login") == null ? null : String.valueOf(data.get("login"));
			String name = data.get("name") == null ? null : String.valueOf(data.get("name"));
			return new GithubUser(login, name);
		} catch (Exception e) {
			return null;
		}
	}

	private List<GithubEmail> fetchGithubEmails(String accessToken) {
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.setAccept(List.of(MediaType.APPLICATION_JSON));
			headers.set("Authorization", "Bearer " + accessToken);
			headers.set("X-GitHub-Api-Version", "2022-11-28");
			headers.set("User-Agent", "RankwellClient");

			HttpEntity<Void> entity = new HttpEntity<>(headers);
			ResponseEntity<List> res = restTemplate.exchange(
					"https://api.github.com/user/emails",
					HttpMethod.GET,
					entity,
					List.class);
			List<?> raw = res.getBody();
			if (raw == null) return List.of();

			return raw.stream()
					.filter(Map.class::isInstance)
					.map(m -> (Map<?, ?>) m)
					.map(m -> new GithubEmail(
							m.get("email") == null ? null : String.valueOf(m.get("email")),
							Boolean.TRUE.equals(m.get("primary")),
							Boolean.TRUE.equals(m.get("verified")),
							m.get("visibility") == null ? null : String.valueOf(m.get("visibility"))
					))
					.toList();
		} catch (Exception e) {
			return List.of();
		}
	}

	private String pickBestEmail(List<GithubEmail> emails) {
		if (emails == null || emails.isEmpty()) return null;
		return emails.stream()
				.filter(e -> e.email != null && !e.email.isBlank())
				// Prefer primary+verified, then verified, then anything
				.sorted(Comparator
						.comparing((GithubEmail e) -> e.verified).reversed()
						.thenComparing(e -> e.primary, Comparator.reverseOrder()))
				.map(e -> e.email)
				.findFirst()
				.orElse(null);
	}

	private boolean isVerified(String email, List<GithubEmail> emails) {
		if (email == null || emails == null) return false;
		return emails.stream()
				.anyMatch(e -> email.equalsIgnoreCase(e.email) && e.verified);
	}

	private String url(String s) {
		return URLEncoder.encode(s, StandardCharsets.UTF_8);
	}

	private record GithubUser(String login, String name) {
		String nameOrLogin() {
			if (name != null && !name.isBlank()) return name;
			return login;
		}
	}

	private static class GithubEmail {
		final String email;
		final boolean primary;
		final boolean verified;
		final String visibility;

		GithubEmail(String email, boolean primary, boolean verified, String visibility) {
			this.email = email;
			this.primary = primary;
			this.verified = verified;
			this.visibility = visibility;
		}
	}
}


package com.RankwellClient.ServiceImpl;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.RankwellClient.config.JwtUtil;
import com.RankwellClient.entity.OAuthConfig;
import com.RankwellClient.entity.Users;
import com.RankwellClient.repository.OAuthConfigRepository;
import com.RankwellClient.repository.UserRepository;
import com.RankwellClient.services.FacebookAuthService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FacebookAuthServiceImpl implements FacebookAuthService {

	private final UserRepository userRepository;
	private final OAuthConfigRepository oauthConfigRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	public FacebookAuthServiceImpl(
			UserRepository userRepository,
			OAuthConfigRepository oauthConfigRepository,
			BCryptPasswordEncoder passwordEncoder,
			JwtUtil jwtUtil,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.oauthConfigRepository = oauthConfigRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newHttpClient();
	}

	@Override
	public String getAppId() {
		return getConfigAppId();
	}

	@Override
	public String authenticateWithAccessToken(String accessToken) {
		final String appId = getConfigAppId();
		final String appSecret = getConfigAppSecret();
		if (appId.isBlank() || appSecret.isBlank()) {
			throw new RuntimeException("Facebook Sign-In is not configured (missing USER_FACEBOOK_APP_ID/USER_FACEBOOK_APP_SECRET).");
		}
		String token = accessToken == null ? "" : accessToken.trim();
		if (token.isBlank()) {
			throw new RuntimeException("Missing Facebook accessToken.");
		}

		ensureTokenValidForThisApp(token);
		JsonNode me = fetchMe(token);

		String email = me.path("email").asText(null);
		String name = me.path("name").asText(null);

		if (email == null || email.isBlank()) {
			throw new RuntimeException("Facebook account email not available. Please sign up with email/password.");
		}
		final String normalizedEmail = email.trim().toLowerCase();

		Optional<Users> existingOpt = userRepository.findByEmail(normalizedEmail);
		Users user = existingOpt.orElseGet(() -> {
			Users u = new Users();
			u.setEmail(normalizedEmail);
			u.setEmailVerified(true);
			u.setMobileNo(null);
			u.setMobileVerified(false);
			if (name != null && !name.isBlank()) {
				u.setUserName(name.trim());
			}
			// Required by schema; not used for social sign-in
			u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
			return userRepository.save(u);
		});

		if (user.isFrozen()) {
			throw new RuntimeException("Account is frozen. Contact admin.");
		}

		return jwtUtil.generateToken(user.getId());
	}

	private void ensureTokenValidForThisApp(String userAccessToken) {
		try {
			final String appId = getConfigAppId();
			final String appSecret = getConfigAppSecret();
			String appAccessToken = appId + "|" + appSecret;
			String url = "https://graph.facebook.com/debug_token?input_token="
					+ enc(userAccessToken)
					+ "&access_token="
					+ enc(appAccessToken);

			JsonNode root = getJson(url);
			JsonNode data = root.path("data");
			boolean isValid = data.path("is_valid").asBoolean(false);
			String tokenAppId = data.path("app_id").asText("");
			if (!isValid || tokenAppId.isBlank() || !tokenAppId.equals(appId)) {
				throw new RuntimeException("Invalid Facebook token.");
			}
		} catch (RuntimeException e) {
			throw e;
		} catch (Exception e) {
			throw new RuntimeException("Facebook authentication failed.");
		}
	}

	private String getConfigAppId() {
		OAuthConfig cfg = oauthConfigRepository.findById(1L).orElse(null);
		String v = cfg == null ? "" : cfg.getUserFacebookAppId();
		return v == null ? "" : v.trim();
	}

	private String getConfigAppSecret() {
		OAuthConfig cfg = oauthConfigRepository.findById(1L).orElse(null);
		String v = cfg == null ? "" : cfg.getUserFacebookAppSecret();
		return v == null ? "" : v.trim();
	}

	private JsonNode fetchMe(String userAccessToken) {
		try {
			String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + enc(userAccessToken);
			return getJson(url);
		} catch (Exception e) {
			throw new RuntimeException("Facebook authentication failed.");
		}
	}

	private JsonNode getJson(String url) throws Exception {
		HttpRequest req = HttpRequest.newBuilder()
				.uri(URI.create(url))
				.GET()
				.header("Accept", "application/json")
				.build();
		HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
		if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
			throw new RuntimeException("Facebook authentication failed.");
		}
		return objectMapper.readTree(resp.body());
	}

	private static String enc(String v) {
		return URLEncoder.encode(v, StandardCharsets.UTF_8);
	}
}


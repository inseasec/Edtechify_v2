package com.RankwellClient.ServiceImpl;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.RankwellClient.config.JwtUtil;
import com.RankwellClient.entity.OAuthConfig;
import com.RankwellClient.entity.Users;
import com.RankwellClient.repository.OAuthConfigRepository;
import com.RankwellClient.repository.UserRepository;
import com.RankwellClient.services.GoogleAuthService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

@Service
public class GoogleAuthServiceImpl implements GoogleAuthService {

	private final UserRepository userRepository;
	private final OAuthConfigRepository oauthConfigRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public GoogleAuthServiceImpl(
			UserRepository userRepository,
			OAuthConfigRepository oauthConfigRepository,
			BCryptPasswordEncoder passwordEncoder,
			JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.oauthConfigRepository = oauthConfigRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtil = jwtUtil;
	}

	@Override
	public String getClientId() {
		return getConfigClientId();
	}

	@Override
	public String authenticateWithIdToken(String idToken) {
		final String clientId = getConfigClientId();
		if (clientId.isBlank()) {
			throw new RuntimeException("Google Sign-In is not configured (missing USER_GOOGLE_CLIENT_ID).");
		}
		if (idToken == null || idToken.isBlank()) {
			throw new RuntimeException("Missing Google idToken.");
		}

		GoogleIdToken.Payload payload = verify(idToken.trim(), clientId);
		String email = payload.getEmail();
		if (email == null || email.isBlank()) {
			throw new RuntimeException("Google account email not available.");
		}

		Optional<Users> existingOpt = userRepository.findByEmail(email);
		Users user = existingOpt.orElseGet(() -> {
			Users u = new Users();
			u.setEmail(email);
			u.setEmailVerified(Boolean.TRUE.equals(payload.getEmailVerified()));
			u.setMobileNo(null);
			u.setMobileVerified(false);

			String name = (String) payload.get("name");
			if (name != null && !name.isBlank()) {
				u.setUserName(name);
			}

			// Required by schema; not used for Google sign-in
			u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
			return userRepository.save(u);
		});

		if (user.isFrozen()) {
			throw new RuntimeException("Account is frozen. Contact admin.");
		}

		return jwtUtil.generateToken(user.getId());
	}

	private String getConfigClientId() {
		OAuthConfig cfg = oauthConfigRepository.findById(1L).orElse(null);
		String v = cfg == null ? "" : cfg.getUserGoogleClientId();
		return v == null ? "" : v.trim();
	}

	private GoogleIdToken.Payload verify(String idToken, String clientId) {
		try {
			GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
					new NetHttpTransport(),
					JacksonFactory.getDefaultInstance())
					.setAudience(Collections.singletonList(clientId))
					.build();

			GoogleIdToken token = verifier.verify(idToken);
			if (token == null) throw new RuntimeException("Invalid Google token.");
			return token.getPayload();
		} catch (Exception e) {
			throw new RuntimeException("Google authentication failed.");
		}
	}
}


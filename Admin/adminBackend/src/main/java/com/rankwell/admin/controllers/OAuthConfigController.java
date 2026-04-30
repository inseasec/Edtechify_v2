package com.rankwell.admin.controllers;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.OAuthConfig;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.repository.OAuthConfigRepository;

@RestController
@RequestMapping("/admin/oauth-config")
public class OAuthConfigController {
	private static final String MASK = "********";

	private final AdminRepository adminRepository;
	private final OAuthConfigRepository repo;

	public OAuthConfigController(AdminRepository adminRepository, OAuthConfigRepository repo) {
		this.adminRepository = adminRepository;
		this.repo = repo;
	}

	@GetMapping
	public ResponseEntity<?> get(Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can view OAuth settings.");
		}

		Map<String, Object> out = new HashMap<>();
		OAuthConfig cfg = repo.findById(1L).orElseGet(() -> repo.save(new OAuthConfig()));

		out.put("USER_GOOGLE_CLIENT_ID", cfg.getUserGoogleClientId() == null ? "" : cfg.getUserGoogleClientId());
		out.put("USER_FACEBOOK_APP_ID", cfg.getUserFacebookAppId() == null ? "" : cfg.getUserFacebookAppId());
		out.put("USER_GITHUB_CLIENT_ID", cfg.getUserGithubClientId() == null ? "" : cfg.getUserGithubClientId());

		String fbSecret = cfg.getUserFacebookAppSecret() == null ? "" : cfg.getUserFacebookAppSecret();
		out.put("USER_FACEBOOK_APP_SECRET", fbSecret.isBlank() ? "" : MASK);
		out.put("USER_FACEBOOK_APP_SECRET_SET", !fbSecret.isBlank());

		String ghSecret = cfg.getUserGithubClientSecret() == null ? "" : cfg.getUserGithubClientSecret();
		out.put("USER_GITHUB_CLIENT_SECRET", ghSecret.isBlank() ? "" : MASK);
		out.put("USER_GITHUB_CLIENT_SECRET_SET", !ghSecret.isBlank());

		out.put("USER_GOOGLE_INSTRUCTIONS", cfg.getUserGoogleInstructions() == null ? "" : cfg.getUserGoogleInstructions());
		out.put("USER_FACEBOOK_INSTRUCTIONS", cfg.getUserFacebookInstructions() == null ? "" : cfg.getUserFacebookInstructions());
		out.put("USER_GITHUB_INSTRUCTIONS", cfg.getUserGithubInstructions() == null ? "" : cfg.getUserGithubInstructions());

		return ResponseEntity.ok(out);
	}

	@PostMapping
	public ResponseEntity<?> save(@RequestBody Map<String, Object> body, Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can update OAuth settings.");
		}
		if (body == null) body = Map.of();

		String googleClientId = asTrimmed(body.get("USER_GOOGLE_CLIENT_ID"));
		String facebookAppId = asTrimmed(body.get("USER_FACEBOOK_APP_ID"));
		String facebookAppSecret = asTrimmed(body.get("USER_FACEBOOK_APP_SECRET"));
		String githubClientId = asTrimmed(body.get("USER_GITHUB_CLIENT_ID"));
		String githubClientSecret = asTrimmed(body.get("USER_GITHUB_CLIENT_SECRET"));

		String googleInstructions = asText(body.get("USER_GOOGLE_INSTRUCTIONS"));
		String facebookInstructions = asText(body.get("USER_FACEBOOK_INSTRUCTIONS"));
		String githubInstructions = asText(body.get("USER_GITHUB_INSTRUCTIONS"));

		OAuthConfig existing = repo.findById(1L).orElseGet(OAuthConfig::new);
		existing.setId(1L);

		if (MASK.equals(facebookAppSecret)) {
			facebookAppSecret = existing.getUserFacebookAppSecret() == null ? "" : existing.getUserFacebookAppSecret();
		}
		if (MASK.equals(githubClientSecret)) {
			githubClientSecret = existing.getUserGithubClientSecret() == null ? "" : existing.getUserGithubClientSecret();
		}

		existing.setUserGoogleClientId(googleClientId);
		existing.setUserFacebookAppId(facebookAppId);
		existing.setUserFacebookAppSecret(facebookAppSecret);
		existing.setUserGithubClientId(githubClientId);
		existing.setUserGithubClientSecret(githubClientSecret);
		existing.setUserGoogleInstructions(googleInstructions);
		existing.setUserFacebookInstructions(facebookInstructions);
		existing.setUserGithubInstructions(githubInstructions);
		repo.save(existing);

		return get(principal);
	}

	private boolean isAnyAdmin(Principal principal) {
		if (principal == null || principal.getName() == null) return false;
		Admins loggedInAdmin = adminRepository.findByEmail(principal.getName()).orElse(null);
		return loggedInAdmin != null;
	}

	private static String asTrimmed(Object v) {
		if (v == null) return "";
		String s = String.valueOf(v);
		return s == null ? "" : s.trim();
	}

	private static String asText(Object v) {
		if (v == null) return "";
		String s = String.valueOf(v);
		if (s == null) return "";
		return s.trim();
	}
}


package com.rankwell.admin.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rankwell.admin.config.StoragePathResolver;
import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.AuthUiConfig;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.repository.AuthUiConfigRepository;

@RestController
@RequestMapping("/admin/auth-ui-config")
public class AuthUiConfigController {
	private final AdminRepository adminRepository;
	private final AuthUiConfigRepository repo;
	private final StoragePathResolver pathResolver;

	public AuthUiConfigController(AdminRepository adminRepository, AuthUiConfigRepository repo, StoragePathResolver pathResolver) {
		this.adminRepository = adminRepository;
		this.repo = repo;
		this.pathResolver = pathResolver;
	}

	@GetMapping
	public ResponseEntity<?> get(Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can view authentication UI settings.");
		}

		AuthUiConfig cfg = repo.findById(1L).orElseGet(() -> {
			AuthUiConfig c = new AuthUiConfig();
			c.setId(1L);
			return repo.save(c);
		});
		return ResponseEntity.ok(toResponse(cfg));
	}

	/** Shown on user Sign In / Sign Up side panels: headline, accent (colored) word, tagline. */
	@PutMapping
	public ResponseEntity<?> putText(@RequestBody Map<String, Object> body, Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can update authentication UI settings.");
		}

		AuthUiConfig cfg = repo.findById(1L).orElseGet(() -> {
			AuthUiConfig c = new AuthUiConfig();
			c.setId(1L);
			return c;
		});

		if (body != null) {
			if (body.containsKey("USER_AUTH_TITLE_PRIMARY")) {
				cfg.setUserAuthTitlePrimary(nullIfBlank(safeString(body.get("USER_AUTH_TITLE_PRIMARY"))));
			}
			if (body.containsKey("USER_AUTH_TITLE_ACCENT")) {
				cfg.setUserAuthTitleAccent(nullIfBlank(safeString(body.get("USER_AUTH_TITLE_ACCENT"))));
			}
			if (body.containsKey("USER_AUTH_TAGLINE")) {
				cfg.setUserAuthTagline(nullIfBlank(safeString(body.get("USER_AUTH_TAGLINE"))));
			}
		}

		repo.save(cfg);
		return get(principal);
	}

	private static String safeString(Object o) {
		if (o == null) return null;
		return String.valueOf(o).trim();
	}

	private static String nullIfBlank(String s) {
		if (s == null || s.isEmpty()) return null;
		return s;
	}

	private static Map<String, Object> toResponse(AuthUiConfig cfg) {
		Map<String, Object> out = new HashMap<>();
		out.put("USER_SIGNIN_SIDE_IMAGE_URL", cfg.getUserSigninSideImageUrl() == null ? "" : cfg.getUserSigninSideImageUrl());
		out.put("USER_SIGNUP_SIDE_IMAGE_URL", cfg.getUserSignupSideImageUrl() == null ? "" : cfg.getUserSignupSideImageUrl());
		out.put("USER_AUTH_TITLE_PRIMARY", cfg.getUserAuthTitlePrimary() == null ? "" : cfg.getUserAuthTitlePrimary());
		out.put("USER_AUTH_TITLE_ACCENT", cfg.getUserAuthTitleAccent() == null ? "" : cfg.getUserAuthTitleAccent());
		out.put("USER_AUTH_TAGLINE", cfg.getUserAuthTagline() == null ? "" : cfg.getUserAuthTagline());
		return out;
	}

	@PostMapping(value = "/upload", consumes = { "multipart/form-data" })
	public ResponseEntity<?> upload(
			@RequestPart(value = "sharedSideImage", required = false) MultipartFile sharedSideImage,
			@RequestPart(value = "signinImage", required = false) MultipartFile signinImage,
			@RequestPart(value = "signupImage", required = false) MultipartFile signupImage,
			Principal principal
	) throws IOException {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can update authentication UI settings.");
		}

		AuthUiConfig cfg = repo.findById(1L).orElseGet(AuthUiConfig::new);
		cfg.setId(1L);

		String basePath = pathResolver.getBasePath(); // ends with /
		Path authDir = Path.of(basePath, "OrgData", "AuthUI");
		Files.createDirectories(authDir);

		// One file for both Sign In and Sign Up (same URL stored in both columns, one file on disk)
		if (sharedSideImage != null && !sharedSideImage.isEmpty()) {
			String url = store(authDir, "authside", sharedSideImage);
			cfg.setUserSigninSideImageUrl(url);
			cfg.setUserSignupSideImageUrl(url);
		} else {
			if (signinImage != null && !signinImage.isEmpty()) {
				String url = store(authDir, "signin", signinImage);
				cfg.setUserSigninSideImageUrl(url);
			}
			if (signupImage != null && !signupImage.isEmpty()) {
				String url = store(authDir, "signup", signupImage);
				cfg.setUserSignupSideImageUrl(url);
			}
		}

		repo.save(cfg);
		return get(principal);
	}

	private String store(Path authDir, String prefix, MultipartFile file) throws IOException {
		String original = file.getOriginalFilename();
		String ext = "";
		if (StringUtils.hasText(original) && original.contains(".")) {
			ext = original.substring(original.lastIndexOf('.')).toLowerCase();
			if (ext.length() > 10) ext = "";
		}
		String name = prefix + "_" + Instant.now().toEpochMilli() + ext;
		Path target = authDir.resolve(name);
		Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
		return "/OrgData/AuthUI/" + name;
	}

	private boolean isAnyAdmin(Principal principal) {
		if (principal == null || principal.getName() == null) return false;
		Admins loggedInAdmin = adminRepository.findByEmail(principal.getName()).orElse(null);
		return loggedInAdmin != null;
	}
}


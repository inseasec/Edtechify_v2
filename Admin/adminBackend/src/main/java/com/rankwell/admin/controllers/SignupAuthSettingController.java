package com.rankwell.admin.controllers;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.SignupAuthSetting;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.repository.SignupAuthSettingRepository;

@RestController
@RequestMapping("/admin/signup-auth")
public class SignupAuthSettingController {
	private final SignupAuthSettingRepository repo;
	private final AdminRepository adminRepository;

	public SignupAuthSettingController(SignupAuthSettingRepository repo, AdminRepository adminRepository) {
		this.repo = repo;
		this.adminRepository = adminRepository;
	}

	@GetMapping
	public ResponseEntity<?> get(Principal principal) {
		if (!isSuperAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only Super Admin can view authentication settings.");
		}
		SignupAuthSetting s = repo.findById(1L).orElseGet(() -> repo.save(new SignupAuthSetting()));
		return ResponseEntity.ok(Map.of(
				"mode", s.getMode().name(),
				"googleEnabled", s.isGoogleEnabled(),
				"facebookEnabled", s.isFacebookEnabled(),
				"instagramEnabled", s.isInstagramEnabled(),
				"githubEnabled", s.isGithubEnabled()
		));
	}

	@PostMapping
	public ResponseEntity<?> save(@RequestBody Map<String, Object> body, Principal principal) {
		if (!isSuperAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only Super Admin can update authentication settings.");
		}
		String modeRaw = body == null ? null : String.valueOf(body.get("mode"));
		if (modeRaw == null || modeRaw.isBlank()) return ResponseEntity.badRequest().body("mode is required");

		SignupAuthSetting.Mode mode;
		try {
			mode = SignupAuthSetting.Mode.valueOf(modeRaw.trim().toUpperCase());
		} catch (Exception e) {
			return ResponseEntity.badRequest().body("Invalid mode. Use NORMAL, EMAIL, MOBILE, BOTH");
		}

		SignupAuthSetting s = repo.findById(1L).orElseGet(SignupAuthSetting::new);
		s.setId(1L);
		s.setMode(mode);
		if (body != null && body.containsKey("googleEnabled")) {
			s.setGoogleEnabled(Boolean.TRUE.equals(body.get("googleEnabled")));
		}
		if (body != null && body.containsKey("facebookEnabled")) {
			s.setFacebookEnabled(Boolean.TRUE.equals(body.get("facebookEnabled")));
		}
		if (body != null && body.containsKey("instagramEnabled")) {
			s.setInstagramEnabled(Boolean.TRUE.equals(body.get("instagramEnabled")));
		}
		if (body != null && body.containsKey("githubEnabled")) {
			s.setGithubEnabled(Boolean.TRUE.equals(body.get("githubEnabled")));
		}
		repo.save(s);
		return ResponseEntity.ok(Map.of(
				"mode", s.getMode().name(),
				"googleEnabled", s.isGoogleEnabled(),
				"facebookEnabled", s.isFacebookEnabled(),
				"instagramEnabled", s.isInstagramEnabled(),
				"githubEnabled", s.isGithubEnabled()
		));
	}

	private boolean isSuperAdmin(Principal principal) {
		if (principal == null || principal.getName() == null) return false;
		Admins loggedInAdmin = adminRepository.findByEmail(principal.getName())
				.orElse(null);
		return loggedInAdmin != null && loggedInAdmin.getRole() == Admins.Role.SUPER_ADMIN;
	}
}


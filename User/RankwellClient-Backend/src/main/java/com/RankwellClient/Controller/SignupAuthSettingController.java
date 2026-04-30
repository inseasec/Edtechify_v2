package com.RankwellClient.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RankwellClient.entity.SignupAuthSetting;
import com.RankwellClient.repository.SignupAuthSettingRepository;

@RestController
@RequestMapping("/users/signup-mode")
public class SignupAuthSettingController {
	private final SignupAuthSettingRepository repo;

	public SignupAuthSettingController(SignupAuthSettingRepository repo) {
		this.repo = repo;
	}

	@GetMapping
	public ResponseEntity<?> getMode() {
		SignupAuthSetting s = repo.findById(1L).orElseGet(() -> repo.save(new SignupAuthSetting()));
		return ResponseEntity.ok(Map.of(
				"mode", s.getMode().name(),
				"googleEnabled", s.isGoogleEnabled(),
				"facebookEnabled", s.isFacebookEnabled(),
				"instagramEnabled", s.isInstagramEnabled(),
				"githubEnabled", s.isGithubEnabled()
		));
	}
}


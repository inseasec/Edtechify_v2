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
import com.rankwell.admin.entity.UserCommConfig;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.repository.UserCommConfigRepository;

@RestController
@RequestMapping("/admin/user-comm-config")
public class UserCommConfigController {
	private static final String MASK = "********";

	private final AdminRepository adminRepository;
	private final UserCommConfigRepository repo;

	public UserCommConfigController(
			AdminRepository adminRepository,
			UserCommConfigRepository repo) {
		this.adminRepository = adminRepository;
		this.repo = repo;
	}

	@GetMapping
	public ResponseEntity<?> get(Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can view communication settings.");
		}

		Map<String, Object> out = new HashMap<>();
		UserCommConfig cfg = repo.findById(1L).orElseGet(() -> repo.save(new UserCommConfig()));

		out.put("USER_MAIL_HOST", cfg.getUserMailHost() == null ? "" : cfg.getUserMailHost());
		out.put("USER_MAIL_PORT", cfg.getUserMailPort() == null ? "" : cfg.getUserMailPort());
		out.put("USER_MAIL_USERNAME", cfg.getUserMailUsername() == null ? "" : cfg.getUserMailUsername());
		String mailPassword = cfg.getUserMailPassword() == null ? "" : cfg.getUserMailPassword();
		out.put("USER_MAIL_PASSWORD", mailPassword.isBlank() ? "" : MASK);
		out.put("USER_MAIL_PASSWORD_SET", !mailPassword.isBlank());
		out.put("USER_MAIL_SMTP_AUTH", cfg.getUserMailSmtpAuth() == null ? "true" : cfg.getUserMailSmtpAuth());
		out.put("USER_MAIL_SMTP_STARTTLS", cfg.getUserMailSmtpStarttls() == null ? "true" : cfg.getUserMailSmtpStarttls());

		out.put("USER_TWILIO_ENABLED", cfg.getUserTwilioEnabled() == null ? "false" : cfg.getUserTwilioEnabled());
		out.put("USER_TWILIO_ACCOUNT_SID", cfg.getUserTwilioAccountSid() == null ? "" : cfg.getUserTwilioAccountSid());
		String twilioToken = cfg.getUserTwilioAuthToken() == null ? "" : cfg.getUserTwilioAuthToken();
		out.put("USER_TWILIO_AUTH_TOKEN", twilioToken.isBlank() ? "" : MASK);
		out.put("USER_TWILIO_AUTH_TOKEN_SET", !twilioToken.isBlank());
		out.put("USER_TWILIO_FROM_NUMBER", cfg.getUserTwilioFromNumber() == null ? "" : cfg.getUserTwilioFromNumber());
		out.put("USER_TWILIO_DEFAULT_COUNTRY_CODE",
				cfg.getUserTwilioDefaultCountryCode() == null ? "+91" : cfg.getUserTwilioDefaultCountryCode());

		out.put("USER_MAIL_INSTRUCTIONS", cfg.getUserMailInstructions() == null ? "" : cfg.getUserMailInstructions());
		out.put("USER_TWILIO_INSTRUCTIONS", cfg.getUserTwilioInstructions() == null ? "" : cfg.getUserTwilioInstructions());
		return ResponseEntity.ok(out);
	}

	@PostMapping
	public ResponseEntity<?> save(@RequestBody Map<String, Object> body, Principal principal) {
		if (!isAnyAdmin(principal)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body("Access denied. Only logged-in admins can update communication settings.");
		}
		if (body == null) body = Map.of();

		String mailHost = asTrimmed(body.get("USER_MAIL_HOST"));
		String mailPort = asTrimmed(body.get("USER_MAIL_PORT"));
		String mailUsername = asTrimmed(body.get("USER_MAIL_USERNAME"));
		String mailPassword = asTrimmed(body.get("USER_MAIL_PASSWORD"));
		String mailAuth = asTrimmed(body.get("USER_MAIL_SMTP_AUTH"));
		String mailStarttls = asTrimmed(body.get("USER_MAIL_SMTP_STARTTLS"));

		String twilioEnabled = asTrimmed(body.get("USER_TWILIO_ENABLED"));
		String twilioSid = asTrimmed(body.get("USER_TWILIO_ACCOUNT_SID"));
		String twilioToken = asTrimmed(body.get("USER_TWILIO_AUTH_TOKEN"));
		String twilioFrom = asTrimmed(body.get("USER_TWILIO_FROM_NUMBER"));
		String twilioCountry = asTrimmed(body.get("USER_TWILIO_DEFAULT_COUNTRY_CODE"));

		String mailInstructions = asText(body.get("USER_MAIL_INSTRUCTIONS"));
		String twilioInstructions = asText(body.get("USER_TWILIO_INSTRUCTIONS"));

		UserCommConfig existing = repo.findById(1L).orElseGet(UserCommConfig::new);
		existing.setId(1L);

		if (MASK.equals(mailPassword)) {
			mailPassword = existing.getUserMailPassword() == null ? "" : existing.getUserMailPassword();
		}
		if (MASK.equals(twilioToken)) {
			twilioToken = existing.getUserTwilioAuthToken() == null ? "" : existing.getUserTwilioAuthToken();
		}

		existing.setUserMailHost(mailHost);
		existing.setUserMailPort(mailPort);
		existing.setUserMailUsername(mailUsername);
		existing.setUserMailPassword(mailPassword);
		existing.setUserMailSmtpAuth(mailAuth);
		existing.setUserMailSmtpStarttls(mailStarttls);

		existing.setUserTwilioEnabled(twilioEnabled);
		existing.setUserTwilioAccountSid(twilioSid);
		existing.setUserTwilioAuthToken(twilioToken);
		existing.setUserTwilioFromNumber(twilioFrom);
		existing.setUserTwilioDefaultCountryCode(twilioCountry);

		existing.setUserMailInstructions(mailInstructions);
		existing.setUserTwilioInstructions(twilioInstructions);

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
		// keep newlines; only trim outer whitespace so pasting multi-line instructions stays intact
		return s.trim();
	}
}


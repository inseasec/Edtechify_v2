package com.rankwell.admin.serviceImpl;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import com.rankwell.admin.entity.UserCommConfig;
import com.rankwell.admin.repository.UserCommConfigRepository;

/**
 * Sends and verifies OTPs for admin password reset using SMTP from
 * {@code user_comm_config} (USER_MAIL_* keys), same source as User-panel OTP emails.
 */
@Service
public class AdminForgotPasswordOtpService {

	private static final SecureRandom RANDOM = new SecureRandom();

	private static final class OtpRecord {
		private final String code;
		private final Instant expiresAt;

		private OtpRecord(String code, Instant expiresAt) {
			this.code = code;
			this.expiresAt = expiresAt;
		}
	}

	private final UserCommConfigRepository userCommConfigRepository;
	private final Map<String, OtpRecord> store = new ConcurrentHashMap<>();

	@Value("${otp.expiry-seconds:300}")
	private long otpExpirySeconds;

	public AdminForgotPasswordOtpService(UserCommConfigRepository userCommConfigRepository) {
		this.userCommConfigRepository = userCommConfigRepository;
	}

	public void sendEmailOtp(String email) {
		String normalized = normalizeEmail(email);
		String otp = generateOtp6();
		store.put(normalized, new OtpRecord(otp, Instant.now().plusSeconds(otpExpirySeconds)));

		UserCommConfig cfg = getCommConfigOrNull();
		if (cfg == null || isBlank(cfg.getUserMailHost()) || isBlank(cfg.getUserMailUsername())
				|| isBlank(cfg.getUserMailPassword())) {
			store.remove(normalized);
			throw new IllegalStateException("SMTP is not configured. Set USER_MAIL_* in User Panel → Authentication → OTP Based.");
		}

		JavaMailSenderImpl sender = buildMailSender(cfg);
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setFrom(cfg.getUserMailUsername().trim());
		msg.setTo(normalized);
		msg.setSubject("RankWell Admin — password reset code");
		msg.setText("Your OTP is: " + otp + "\n\nThis code expires in " + otpExpirySeconds + " seconds.");
		sender.send(msg);
	}

	public boolean verifyEmailOtp(String email, String otp) {
		String normalized = normalizeEmail(email);
		OtpRecord rec = store.get(normalized);
		if (rec == null)
			return false;
		if (Instant.now().isAfter(rec.expiresAt)) {
			store.remove(normalized);
			return false;
		}
		boolean ok = Objects.equals(rec.code, sanitizeOtp(otp));
		if (ok)
			store.remove(normalized);
		return ok;
	}

	private static String generateOtp6() {
		int n = RANDOM.nextInt(1_000_000);
		return String.format("%06d", n);
	}

	private static String normalizeEmail(String email) {
		if (email == null)
			throw new IllegalArgumentException("Email is required");
		String e = email.trim().toLowerCase();
		if (!e.matches("^\\S+@\\S+\\.\\S+$"))
			throw new IllegalArgumentException("Invalid email");
		return e;
	}

	private static String sanitizeOtp(String otp) {
		if (otp == null)
			return "";
		return otp.trim();
	}

	private UserCommConfig getCommConfigOrNull() {
		try {
			return userCommConfigRepository.findById(1L).orElse(null);
		} catch (Exception e) {
			return null;
		}
	}

	private static JavaMailSenderImpl buildMailSender(UserCommConfig cfg) {
		JavaMailSenderImpl sender = new JavaMailSenderImpl();
		sender.setHost(cfg.getUserMailHost().trim());
		int port = parseInt(cfg.getUserMailPort(), 587);
		sender.setPort(port);
		sender.setUsername(cfg.getUserMailUsername().trim());
		String pwd = cfg.getUserMailPassword() == null ? "" : cfg.getUserMailPassword();
		sender.setPassword(pwd.replaceAll("\\s+", ""));

		Properties props = new Properties();
		props.put("mail.smtp.auth", String.valueOf(parseBool(cfg.getUserMailSmtpAuth())));
		boolean starttls = (port == 587) ? true : parseBool(cfg.getUserMailSmtpStarttls());
		props.put("mail.smtp.starttls.enable", String.valueOf(starttls));
		props.put("mail.smtp.starttls.required", String.valueOf(starttls));
		boolean ssl = (port == 465);
		props.put("mail.smtp.ssl.enable", String.valueOf(ssl));
		props.put("mail.smtp.ssl.trust", cfg.getUserMailHost() == null ? "*" : cfg.getUserMailHost().trim());
		props.put("mail.smtp.connectiontimeout", "5000");
		props.put("mail.smtp.timeout", "5000");
		props.put("mail.smtp.writetimeout", "5000");
		sender.setJavaMailProperties(props);
		return sender;
	}

	private static int parseInt(String s, int fallback) {
		if (s == null)
			return fallback;
		try {
			return Integer.parseInt(s.trim());
		} catch (Exception e) {
			return fallback;
		}
	}

	private static boolean parseBool(String s) {
		if (s == null)
			return false;
		String v = s.trim().toLowerCase();
		return v.equals("true") || v.equals("1") || v.equals("yes") || v.equals("y") || v.equals("on");
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}

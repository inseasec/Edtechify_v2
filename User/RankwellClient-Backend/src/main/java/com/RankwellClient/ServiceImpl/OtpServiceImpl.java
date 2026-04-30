package com.RankwellClient.ServiceImpl;

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

import com.RankwellClient.entity.UserCommConfig;
import com.RankwellClient.repository.UserCommConfigRepository;
import com.RankwellClient.services.OtpService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class OtpServiceImpl implements OtpService {
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
	private final Map<String, OtpRecord> mobileStore = new ConcurrentHashMap<>();

	private volatile boolean twilioInitialized = false;

	@Value("${otp.expiry-seconds:300}")
	private long otpExpirySeconds;

	public OtpServiceImpl(UserCommConfigRepository userCommConfigRepository) {
		this.userCommConfigRepository = userCommConfigRepository;
	}

	@Override
	public void sendEmailOtp(String email) {
		String normalized = normalizeEmail(email);
		String otp = generateOtp6();

		store.put(normalized, new OtpRecord(otp, Instant.now().plusSeconds(otpExpirySeconds)));

		UserCommConfig cfg = getCommConfigOrNull();
		if (cfg == null || isBlank(cfg.getUserMailHost()) || isBlank(cfg.getUserMailUsername()) || isBlank(cfg.getUserMailPassword())) {
			throw new IllegalStateException("SMTP is not configured. Please set USER_MAIL_* keys in Admin → OAuth Keys.");
		}

		JavaMailSenderImpl sender = buildMailSender(cfg);
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setFrom(cfg.getUserMailUsername().trim());
		msg.setTo(normalized);
		msg.setSubject("Your verification code");
		msg.setText("Your OTP is: " + otp + "\n\nThis code expires in " + otpExpirySeconds + " seconds.");
		sender.send(msg);
	}

	@Override
	public boolean verifyEmailOtp(String email, String otp) {
		String normalized = normalizeEmail(email);
		OtpRecord rec = store.get(normalized);
		if (rec == null) return false;
		if (Instant.now().isAfter(rec.expiresAt)) {
			store.remove(normalized);
			return false;
		}
		boolean ok = Objects.equals(rec.code, sanitizeOtp(otp));
		if (ok) store.remove(normalized);
		return ok;
	}
	
	@Override
	public void sendMobileOtp(String mobileNo) {
		String normalizedKey = normalizeMobileKey(mobileNo);
		String otp = generateOtp6();
		mobileStore.put(normalizedKey, new OtpRecord(otp, Instant.now().plusSeconds(otpExpirySeconds)));

		UserCommConfig cfg = getCommConfigOrNull();
		if (cfg == null || !parseBool(cfg.getUserTwilioEnabled()) || isBlank(cfg.getUserTwilioAccountSid())
				|| isBlank(cfg.getUserTwilioAuthToken()) || isBlank(cfg.getUserTwilioFromNumber())) {
			throw new IllegalStateException("Twilio is not configured. Please set USER_TWILIO_* keys in Admin → OAuth Keys.");
		}

		String toE164 = toE164(mobileNo, cfg);
		sendViaTwilio(toE164, otp, cfg);
	}

	@Override
	public boolean verifyMobileOtp(String mobileNo, String otp) {
		String normalizedKey = normalizeMobileKey(mobileNo);
		OtpRecord rec = mobileStore.get(normalizedKey);
		if (rec == null) return false;
		if (Instant.now().isAfter(rec.expiresAt)) {
			mobileStore.remove(normalizedKey);
			return false;
		}
		boolean ok = Objects.equals(rec.code, sanitizeOtp(otp));
		if (ok) mobileStore.remove(normalizedKey);
		return ok;
	}

	private static String generateOtp6() {
		int n = RANDOM.nextInt(1_000_000);
		return String.format("%06d", n);
	}

	private static String normalizeEmail(String email) {
		if (email == null) throw new IllegalArgumentException("Email is required");
		String e = email.trim().toLowerCase();
		if (!e.matches("^\\S+@\\S+\\.\\S+$")) throw new IllegalArgumentException("Invalid email");
		return e;
	}
	
	private static String normalizeMobileKey(String mobileNo) {
		if (mobileNo == null) throw new IllegalArgumentException("Mobile number is required");
		String digits = mobileNo.trim().replaceAll("\\D", "");
		if (digits.length() < 10) throw new IllegalArgumentException("Invalid mobile number");
		String last10 = digits.substring(digits.length() - 10);
		if (!last10.matches("^\\d{10}$")) throw new IllegalArgumentException("Invalid mobile number");
		return last10;
	}

	private static String sanitizeOtp(String otp) {
		if (otp == null) return "";
		return otp.trim();
	}

	private void sendViaTwilio(String toE164, String otp, UserCommConfig cfg) {
		try {
			ensureTwilioInitialized(cfg);
			String from = cfg.getUserTwilioFromNumber().trim();
			String body = "Your OTP is: " + otp + ". It expires in " + otpExpirySeconds + " seconds.";
			Message.creator(new PhoneNumber(toE164), new PhoneNumber(from), body).create();
		} catch (Exception e) {
			System.out.println("[MOBILE OTP] Twilio error: " + e.getMessage());
		}
	}

	private void ensureTwilioInitialized(UserCommConfig cfg) {
		if (twilioInitialized) return;
		synchronized (this) {
			if (twilioInitialized) return;
			Twilio.init(cfg.getUserTwilioAccountSid().trim(), cfg.getUserTwilioAuthToken().trim());
			twilioInitialized = true;
		}
	}

	private String toE164(String mobileNo, UserCommConfig cfg) {
		if (mobileNo == null) throw new IllegalArgumentException("Mobile number is required");
		String raw = mobileNo.trim();
		if (raw.startsWith("+")) {
			// Keep plus; strip spaces/dashes etc
			String digits = raw.replaceAll("[^\\d+]", "");
			if (!digits.matches("^\\+\\d{10,15}$")) throw new IllegalArgumentException("Invalid mobile number");
			return digits;
		}
		String digits = raw.replaceAll("\\D", "");
		if (digits.length() < 10) throw new IllegalArgumentException("Invalid mobile number");
		String last10 = digits.substring(digits.length() - 10);
		String cc = (cfg == null || isBlank(cfg.getUserTwilioDefaultCountryCode())) ? "+91" : cfg.getUserTwilioDefaultCountryCode().trim();
		if (!cc.startsWith("+")) cc = "+" + cc;
		return cc + last10;
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
		// Gmail "app passwords" are often shown with spaces; SMTP auth requires the raw token (no spaces).
		String pwd = cfg.getUserMailPassword() == null ? "" : cfg.getUserMailPassword();
		sender.setPassword(pwd.replaceAll("\\s+", ""));

		Properties props = new Properties();
		props.put("mail.smtp.auth", String.valueOf(parseBool(cfg.getUserMailSmtpAuth())));
		// For 587 use STARTTLS; for 465 use implicit SSL.
		boolean starttls = (port == 587) ? true : parseBool(cfg.getUserMailSmtpStarttls());
		props.put("mail.smtp.starttls.enable", String.valueOf(starttls));
		props.put("mail.smtp.starttls.required", String.valueOf(starttls));
		boolean ssl = (port == 465);
		props.put("mail.smtp.ssl.enable", String.valueOf(ssl));
		// Common fixes for Gmail/modern providers
		props.put("mail.smtp.ssl.trust", cfg.getUserMailHost() == null ? "*" : cfg.getUserMailHost().trim());
		props.put("mail.smtp.connectiontimeout", "5000");
		props.put("mail.smtp.timeout", "5000");
		props.put("mail.smtp.writetimeout", "5000");
		// Enable SMTP conversation debug in server logs (temporarily helpful for diagnosing auth/TLS issues).
		props.put("mail.debug", "true");
		sender.setJavaMailProperties(props);
		return sender;
	}

	private static int parseInt(String s, int fallback) {
		if (s == null) return fallback;
		try {
			return Integer.parseInt(s.trim());
		} catch (Exception e) {
			return fallback;
		}
	}

	private static boolean parseBool(String s) {
		if (s == null) return false;
		String v = s.trim().toLowerCase();
		return v.equals("true") || v.equals("1") || v.equals("yes") || v.equals("y") || v.equals("on");
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}


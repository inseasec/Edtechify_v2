package com.RankwellClient.Controller;

import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.RankwellClient.dto.FacebookAuthRequest;
import com.RankwellClient.dto.GoogleAuthRequest;
import com.RankwellClient.dto.MobileOtpSendRequest;
import com.RankwellClient.dto.MobileOtpVerifyRequest;
import com.RankwellClient.dto.OtpSendRequest;
import com.RankwellClient.dto.OtpVerifyRequest;
import com.RankwellClient.dto.PasswordResetConfirmRequest;
import com.RankwellClient.dto.PasswordResetOtpSendRequest;
import com.RankwellClient.dto.UserDto;
import com.RankwellClient.entity.Users;
import com.RankwellClient.repository.UserRepository;
import com.RankwellClient.services.FacebookAuthService;
import com.RankwellClient.services.GoogleAuthService;
import com.RankwellClient.services.OtpService;
import com.RankwellClient.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
	private static final Logger log = LoggerFactory.getLogger(UserController.class);
	
	private final UserService userService ;
	private final OtpService otpService;
	private final GoogleAuthService googleAuthService;

	private final FacebookAuthService facebookAuthService;

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	
	public UserController(UserService userService, OtpService otpService,FacebookAuthService facebookAuthService ,GoogleAuthService googleAuthService,UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
		this.userService=userService;
		this.otpService = otpService;
		this.googleAuthService = googleAuthService;
		this.facebookAuthService = facebookAuthService;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@RequestBody UserDto userDTO){
		String email = userDTO.getEmail() != null ? userDTO.getEmail().trim().toLowerCase() : null;
		String mobileNo = userDTO.getMobileNo() != null ? userDTO.getMobileNo().trim() : null;

		if (email != null && !email.isEmpty() && userRepository.findByEmail(email).isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("This email already exists.");
		}
		if (mobileNo != null && !mobileNo.isEmpty() && userRepository.findByMobileNo(mobileNo).isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body("This phone number already exists.");
		}

		userDTO.setEmail(email);
		userDTO.setMobileNo(mobileNo);

		return ResponseEntity.ok(userService.registerUser(userDTO));	
	  }

	@GetMapping("/availability")
	public ResponseEntity<Map<String, Object>> availability(
			@RequestParam(required = false) String email,
			@RequestParam(required = false) String mobileNo) {
		String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
		String normalizedMobile = mobileNo != null ? mobileNo.trim() : "";

		boolean emailProvided = normalizedEmail != null && !normalizedEmail.isEmpty();
		boolean mobileProvided = normalizedMobile != null && !normalizedMobile.isEmpty();

		if (!emailProvided && !mobileProvided) {
			return ResponseEntity.badRequest().body(Map.of(
					"available", false,
					"reason", "MISSING_IDENTIFIER",
					"message", "email or mobileNo is required"
			));
		}

		if (emailProvided && userRepository.findByEmail(normalizedEmail).isPresent()) {
			return ResponseEntity.ok(Map.of(
					"available", false,
					"reason", "EMAIL_EXISTS",
					"message", "This email already exists."
			));
		}
		if (mobileProvided && userRepository.findByMobileNo(normalizedMobile).isPresent()) {
			return ResponseEntity.ok(Map.of(
					"available", false,
					"reason", "MOBILE_EXISTS",
					"message", "This phone number already exists."
			));
		}
		return ResponseEntity.ok(Map.of("available", true));
	}

	@PostMapping("/password/otp/send")
	public ResponseEntity<String> sendPasswordResetOtp(@RequestBody PasswordResetOtpSendRequest req) {
		String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : null;
		String mobileNo = req.getMobileNo() != null ? req.getMobileNo().trim() : null;

		if (email != null && !email.isEmpty()) {
			if (userRepository.findByEmail(email).isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found for this email.");
			}
			try {
				otpService.sendEmailOtp(email);
				return ResponseEntity.ok("OTP sent");
			} catch (IllegalArgumentException e) {
				return ResponseEntity.badRequest().body(e.getMessage());
			} catch (IllegalStateException e) {
				return ResponseEntity.status(500).body(e.getMessage());
			} catch (MailException e) {
				log.error("Failed to send email OTP (password reset) to {}", email, e);
				String msg = e.getMessage() != null ? e.getMessage().trim() : "";
				return ResponseEntity.status(500).body(msg.isEmpty() ? "Email service error" : msg);
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
			}
		}

		if (mobileNo != null && !mobileNo.isEmpty()) {
			if (userRepository.findByMobileNo(mobileNo).isEmpty()) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found for this phone number.");
			}
			try {
				otpService.sendMobileOtp(mobileNo);
				return ResponseEntity.ok("OTP sent");
			} catch (IllegalArgumentException e) {
				return ResponseEntity.badRequest().body(e.getMessage());
			} catch (IllegalStateException e) {
				return ResponseEntity.status(500).body(e.getMessage());
			} catch (Exception e) {
				return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
			}
		}

		return ResponseEntity.badRequest().body("Email or phone number is required.");
	}

	@PostMapping("/password/reset")
	public ResponseEntity<String> resetPassword(@RequestBody PasswordResetConfirmRequest req) {
		String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : null;
		String mobileNo = req.getMobileNo() != null ? req.getMobileNo().trim() : null;
		String otp = req.getOtp() != null ? req.getOtp().trim() : "";
		String newPassword = req.getNewPassword() != null ? req.getNewPassword() : "";

		if (newPassword.trim().length() < 6) {
			return ResponseEntity.badRequest().body("Password must be at least 6 characters.");
		}
		if (otp.isEmpty()) {
			return ResponseEntity.badRequest().body("OTP is required.");
		}

		if (email != null && !email.isEmpty()) {
			var userOpt = userRepository.findByEmail(email);
			if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found for this email.");
			boolean ok = otpService.verifyEmailOtp(email, otp);
			if (!ok) return ResponseEntity.badRequest().body("Invalid or expired OTP");
			Users user = userOpt.get();
			user.setPassword(passwordEncoder.encode(newPassword));
			userRepository.save(user);
			return ResponseEntity.ok("Password updated successfully");
		}

		if (mobileNo != null && !mobileNo.isEmpty()) {
			var userOpt = userRepository.findByMobileNo(mobileNo);
			if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found for this phone number.");
			boolean ok = otpService.verifyMobileOtp(mobileNo, otp);
			if (!ok) return ResponseEntity.badRequest().body("Invalid or expired OTP");
			Users user = userOpt.get();
			user.setPassword(passwordEncoder.encode(newPassword));
			userRepository.save(user);
			return ResponseEntity.ok("Password updated successfully");
		}

		return ResponseEntity.badRequest().body("Email or phone number is required.");
	}

	@PostMapping("/otp/send")
	public ResponseEntity<String> sendEmailOtp(@RequestBody OtpSendRequest req) {
		try {
			otpService.sendEmailOtp(req.getEmail());
			return ResponseEntity.ok("OTP sent");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (IllegalStateException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		} catch (MailException e) {
			log.error("Failed to send email OTP to {}", req != null ? req.getEmail() : null, e);
			String msg = e.getMessage() != null ? e.getMessage().trim() : "";
			return ResponseEntity.status(500).body(msg.isEmpty() ? "Email service error" : msg);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
		}
	}

	@PostMapping("/otp/verify")
	public ResponseEntity<String> verifyEmailOtp(@RequestBody OtpVerifyRequest req) {
		boolean ok = otpService.verifyEmailOtp(req.getEmail(), req.getOtp());
		if (!ok) return ResponseEntity.badRequest().body("Invalid or expired OTP");
		return ResponseEntity.ok("OTP verified");
	}

	@PostMapping("/otp/mobile/send")
	public ResponseEntity<String> sendMobileOtp(@RequestBody MobileOtpSendRequest req) {
		try {
			otpService.sendMobileOtp(req.getMobileNo());
			return ResponseEntity.ok("OTP sent");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (IllegalStateException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
		}
	}

	@PostMapping("/otp/mobile/verify")
	public ResponseEntity<String> verifyMobileOtp(@RequestBody MobileOtpVerifyRequest req) {
		boolean ok = otpService.verifyMobileOtp(req.getMobileNo(), req.getOtp());
		if (!ok) return ResponseEntity.badRequest().body("Invalid or expired OTP");
		return ResponseEntity.ok("OTP verified");
	}
	
	@PostMapping("/signin")
	public ResponseEntity<String> loginUser(@RequestBody UserDto userDTO) {
	
	    String loginIdentifier = (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) 
                ? userDTO.getEmail() 
                : (userDTO.getMobileNo() != null && !userDTO.getMobileNo().isEmpty())  
                      ? userDTO.getMobileNo() 
                      : null;

	    System.out.println("Login Identifier: " + loginIdentifier);
	    if (loginIdentifier == null || loginIdentifier.trim().isEmpty()) {
	    	return ResponseEntity.badRequest().body("Email or phone number is required.");
	    }

	    try {
	    	String jwtToken = userService.loginUser(loginIdentifier.trim(), userDTO.getPassword()); 
	    	return ResponseEntity.ok(jwtToken);
	    } catch (RuntimeException ex) {
	    	String msg = ex.getMessage() != null ? ex.getMessage().trim() : "";
	    	if ("Invalid password".equalsIgnoreCase(msg)) {
	    		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Wrong password");
	    	}
	    	if ("User not found".equalsIgnoreCase(msg)) {
	    		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
	    	}
	    	if ("Account is frozen. Contact admin.".equalsIgnoreCase(msg) || msg.toLowerCase().contains("frozen")) {
	    		return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is frozen. Contact admin.");
	    	}
	    	return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg.isEmpty() ? "Login failed" : msg);
	    }
	}

	@GetMapping("/oauth/google/client-id")
	public ResponseEntity<Map<String, String>> getGoogleClientId() {
		String clientId = googleAuthService.getClientId();
		if (clientId == null || clientId.isBlank()) {
			return ResponseEntity.status(404).body(Map.of("clientId", ""));
		}
		return ResponseEntity.ok(Map.of("clientId", clientId));
	}

	@PostMapping("/auth/google")
	public ResponseEntity<String> googleAuth(@RequestBody GoogleAuthRequest request) {
		String token = googleAuthService.authenticateWithIdToken(request.getIdToken());
		return ResponseEntity.ok(token);
	}

	@GetMapping("/oauth/facebook/app-id")
	public ResponseEntity<Map<String, String>> getFacebookAppId() {
		String appId = facebookAuthService.getAppId();
		if (appId == null || appId.isBlank()) {
			return ResponseEntity.status(404).body(Map.of("appId", ""));
		}
		return ResponseEntity.ok(Map.of("appId", appId));
	}

	@PostMapping("/auth/facebook")
	public ResponseEntity<String> facebookAuth(@RequestBody FacebookAuthRequest request) {
		String token = facebookAuthService.authenticateWithAccessToken(request.getAccessToken());
		return ResponseEntity.ok(token);
	}
	
	@PutMapping("/uploadImage/{userId}")
	public ResponseEntity<String> uploadUserImage(@PathVariable Long userId, @RequestParam("file") MultipartFile file){ 
		return userService.uploadUserImage(userId, file);
	  } 
	
	@GetMapping("/getUser/{userId}")
	public Users getUser(@PathVariable Long userId) {    
		return userService.getUser(userId);
	}
	
	@PutMapping("updateUserInfo/{userId}") 
	public String updateUserInfo(@PathVariable Long userId, @RequestBody UserDto userDto) {
		return userService.updateUserInfo(userId,userDto);
	}
	
	@PutMapping("updateUserAddress/{userId}")
	public String updateUserAddress(@PathVariable Long userId, @RequestBody UserDto userDto) {
		return userService.updateUserAddress(userId, userDto);
	}
	
	@PutMapping("/updatePassword/{userId}")  
	public ResponseEntity<String> updatePassword(@PathVariable Long userId ,@RequestBody Map<String,String> passwordInfo){
		String status =  userService.updatePassword(userId, passwordInfo);
		return ResponseEntity.ok(status); 
	}

	@GetMapping("/timezones")
    public List<String> getAllTimezones() {
        return ZoneId.getAvailableZoneIds()
                .stream()
                .sorted()
                .toList();
      }

	  @GetMapping("/countries")
      public List<String> getAllCountries() {
        return Arrays.stream(Locale.getISOCountries())
                .map(code -> new Locale("", code).getDisplayCountry())
                .sorted()
                .collect(Collectors.toList());
    }

}

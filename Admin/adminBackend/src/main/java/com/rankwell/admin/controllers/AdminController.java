package com.rankwell.admin.controllers;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rankwell.admin.config.JwtUtil;
import com.rankwell.admin.dto.AdminDto;
import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.Admins.Role;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.serviceImpl.AdminForgotPasswordOtpService;
import com.rankwell.admin.serviceImpl.SuperAdmin;
import com.rankwell.admin.services.AdminService;
import com.rankwell.admin.services.EnvironmentSettingService;

//import com.rankwell.admin.util.TwilioSmsService;

//@CrossOrigin(origins = "http://localhost:8081") 
@RestController
@RequestMapping("/admin")
public class AdminController {
	
	@Autowired
	private AdminService adminService;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
	private AdminRepository adminRepository;
	
	@Autowired
	private SuperAdmin superAdmin;

	@Autowired
    private EnvironmentSettingService environmentSettingService;
	
//	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
// test comment
	private final PasswordEncoder passwordEncoder;

	private final AdminForgotPasswordOtpService adminForgotPasswordOtpService;

	@Autowired
	public AdminController(PasswordEncoder passwordEncoder, AdminForgotPasswordOtpService adminForgotPasswordOtpService) {
	    this.passwordEncoder = passwordEncoder;
	    this.adminForgotPasswordOtpService = adminForgotPasswordOtpService;
	}

	
	@PostMapping("/create")
	public ResponseEntity<String> createAdmin(@RequestBody AdminDto adminDto, Principal principal){
		if(adminDto.getRole().equals(Role.SUPER_ADMIN)) {
			
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorize to create SUPER AIN");
		}
		String loggedInEmail = principal.getName();
		String status = adminService.createAdmin(adminDto,loggedInEmail);
		System.out.println("Test comment comment");
		return ResponseEntity.ok(status);
	}
	
	
	//Send Password to Onboarded admins as well as super admin
	@PostMapping("/sendPasswordToMail")
	public ResponseEntity<?> sendPasswordToMail(@RequestBody AdminDto adminDto, Principal principal){
		return adminService.sendPasswordToMail(adminDto,principal);
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginAdmin(@RequestBody AdminDto adminDto){
		Admins admin =  adminRepository.findByEmail(adminDto.getEmail()).
				orElseThrow(()-> new IllegalArgumentException("6 Email"));
		
		if(admin.getIsActive() == false) {
			return ResponseEntity.badRequest().body("Account Is Freezed.. Please Contact Administrator");
		}

		if(!passwordEncoder.matches(adminDto.getPassword(), admin.getPassword())) {
			return ResponseEntity.badRequest().body("Invalid Password");
		}
		
//		if(admin.getIs2FAEnabled().equals(false)) {
			String token = jwtUtil.generateToken(admin.getEmail(),admin.getRole().name());
			
			Map<String,Object> response = new HashMap<>();
			response.put("token", token);
			response.put("email", admin.getEmail());
			response.put("role", admin.getRole());
			response.put("isActive", admin.getIsActive());
			return ResponseEntity.ok(response);
//		}else {	
//			String otp = String.valueOf((int)(Math.random() * 9000) + 1000);
//			LocalDateTime now = LocalDateTime.now();
//			LocalDateTime expire = now.plusMinutes(5);
//			
//			admin.setOtp(otp);
//			admin.setOtpExpiresAt(now);
//			admin.setOtpExpiresAt(expire);
//			adminRepository.save(admin);
//			superAdmin.sendEmailWithOIP(adminDto.getEmail(), otp);
//		}
		
	
//		return ResponseEntity.ok("OTP send to registered email");
	}

	/** Forgot password: send 6-digit OTP to admin email using USER_MAIL_* SMTP (same as User panel). */
	@PostMapping("/password/otp/send")
	public ResponseEntity<String> sendAdminPasswordResetOtp(@RequestBody Map<String, String> body) {
		String emailRaw = body != null ? body.get("email") : null;
		String email = emailRaw != null ? emailRaw.trim().toLowerCase() : null;
		if (email == null || email.isEmpty()) {
			return ResponseEntity.badRequest().body("Email is required.");
		}
		var adminOptForSend = adminRepository.findByEmail(email);
		if (adminOptForSend.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No admin account found for this email.");
		}
		if (Boolean.FALSE.equals(adminOptForSend.get().getIsActive())) {
			return ResponseEntity.badRequest().body("Account is inactive. Please contact an administrator.");
		}
		try {
			adminForgotPasswordOtpService.sendEmailOtp(email);
			return ResponseEntity.ok("OTP sent");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		} catch (IllegalStateException e) {
			return ResponseEntity.status(500).body(e.getMessage());
		} catch (MailException e) {
			String msg = e.getMessage() != null ? e.getMessage().trim() : "";
			return ResponseEntity.status(500).body(msg.isEmpty() ? "Email service error" : msg);
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
		}
	}

	@PostMapping("/password/reset")
	public ResponseEntity<String> resetAdminPasswordWithOtp(@RequestBody Map<String, String> body) {
		String emailRaw = body != null ? body.get("email") : null;
		String email = emailRaw != null ? emailRaw.trim().toLowerCase() : null;
		String otp = body != null && body.get("otp") != null ? body.get("otp").trim() : "";
		String newPassword = body != null && body.get("newPassword") != null ? body.get("newPassword") : "";

		if (email == null || email.isEmpty()) {
			return ResponseEntity.badRequest().body("Email is required.");
		}
		if (newPassword.trim().length() < 6) {
			return ResponseEntity.badRequest().body("Password must be at least 6 characters.");
		}
		if (otp.isEmpty()) {
			return ResponseEntity.badRequest().body("OTP is required.");
		}

		var adminOpt = adminRepository.findByEmail(email);
		if (adminOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No admin account found for this email.");
		}
		Admins admin = adminOpt.get();
		if (!admin.getIsActive()) {
			return ResponseEntity.badRequest().body("Account is inactive. Please contact an administrator.");
		}
		boolean ok = adminForgotPasswordOtpService.verifyEmailOtp(email, otp);
		if (!ok) {
			return ResponseEntity.badRequest().body("Invalid or expired OTP.");
		}
		// Admins#setPassword already hashes using BCrypt; pass raw password here.
		admin.setPassword(newPassword);
		adminRepository.save(admin);
		return ResponseEntity.ok("Password updated successfully");
	}

	@PutMapping("/updateStatus")
	public ResponseEntity<String> updateAdminStatus(@RequestBody AdminDto adminDto){
		String message = adminService.updateAdminStatus(adminDto);
		return ResponseEntity.ok(message);
	}
	
	@GetMapping("/getAllAdmins")
	public List<Admins> getAllAdmins(){
		List<Admins> adminList = adminService.getAllAdmins();
		return adminList;
	}
	
	//only password change for itself(all admins)
	@PutMapping("/updatePassword")
	public ResponseEntity<String> updatePassword(@RequestBody Map<String,String> passwordInfo, Principal principal) {
		String status = adminService.updatePassword(passwordInfo, principal.getName());
		return ResponseEntity.ok(status);
	}
	
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteAdmins(@PathVariable Long id) {
		return adminService.deleteAdmins(id);
	}

	@GetMapping("/getAdminsByLoggedInUser")
	public Admins getAdminsByLoggedInUser(Principal principal){
		Admins adminList = adminService.getAdminsByLoggedInUser(principal.getName());
		return adminList;
	}
	
	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
	    String email = payload.get("email");
	    String otp = payload.get("otp");

	    Admins admin = adminRepository.findByEmail(email)
	            .orElseThrow(() -> new IllegalArgumentException("Invalid Email"));

	    if (admin.getOtp() == null || !admin.getOtp().equals(otp)) {
	        return ResponseEntity.badRequest().body("Invalid OTP");
	    }

	    if (admin.getOtpExpiresAt()!= null && admin.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
	        return ResponseEntity.badRequest().body("OTP expired");
	    }

	    // OTP is valid → generate token
	    String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());
	    
	    //clear the OTP as this is used now 
//	    admin.setOtp(null);
//	    admin.setOtpCreatedAt(null);
//	    admin.setOtpExpiresAt(null);
//	    adminRepository.save(admin);

	    Map<String, Object> response = new HashMap<>();
	    response.put("token", token);
	    response.put("email", admin.getEmail());
	    response.put("role", admin.getRole());
	    response.put("isActive", admin.getIsActive());

	    return ResponseEntity.ok(response);
	}

	@PutMapping("/update/{email}")
	public ResponseEntity<String> updateByEmail(@PathVariable String email, @RequestBody AdminDto adminDto, Principal principal) {
		return adminService.updateByEmail(email, adminDto, principal);
	}
	

	@PutMapping("/updatePasswordBySuperAdmin/{adminEmailId}")
	public ResponseEntity<String> updatePasswordBySuperAdmin(@PathVariable String adminEmailId,
			@RequestBody Map<String, String> passwordInfo, Principal principal) {
		return adminService.updatePasswordBySuperAdmin(passwordInfo, adminEmailId, principal);
	}


	// introducting file server switching code for triggering the .sh confiure-file-server.sh file
	@PostMapping("/switchFileServer/{serverId}")
    public ResponseEntity<String> switchFileServer(@PathVariable Long serverId) {
        try {
            adminService.switchFileServer(serverId);
            return ResponseEntity.ok("File server switched successfully.");

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Switch failed: " + e.getMessage());
        }
    }
	
}

// Git Ignore final testing.. dm / ak / shekhar
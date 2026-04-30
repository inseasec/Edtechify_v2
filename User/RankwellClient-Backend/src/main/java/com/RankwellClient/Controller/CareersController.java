package com.RankwellClient.Controller;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.RankwellClient.dto.CareerRequestDto;
import com.RankwellClient.dto.CareerExistingOtpSendRequest;
import com.RankwellClient.dto.CareerExistingOtpVerifyRequest;
import com.RankwellClient.entity.Careers;
import com.RankwellClient.services.CareersService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import com.RankwellClient.services.CareerArchiveService;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;
import java.util.HashMap;
import com.RankwellClient.Exception.AlreadyAppliedException;
import com.RankwellClient.repository.CareersRepository;
import com.RankwellClient.services.OtpService;
import org.springframework.web.bind.annotation.RequestHeader;


   

@RestController
@RequestMapping("/careers")
public class CareersController {

    @Autowired
    private CareerArchiveService careerArchiveService;

    private final CareersService careersService;  
    private final CareersRepository careersRepository;
    private final OtpService otpService;

    private static final long EXISTING_TOKEN_TTL_SECONDS = 600; // 10 minutes

    private static final class ExistingToken {
        final String identifierKey;
        final Instant expiresAt;
        ExistingToken(String identifierKey, Instant expiresAt) {
            this.identifierKey = identifierKey;
            this.expiresAt = expiresAt;
        }
    }

    private static final ConcurrentHashMap<String, ExistingToken> EXISTING_TOKENS = new ConcurrentHashMap<>();

    public CareersController(CareersService careersService, CareersRepository careersRepository, OtpService otpService){
        this.careersService = careersService;   
        this.careersRepository = careersRepository;
        this.otpService = otpService;
     }

    
     @PostMapping(value="/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     public ResponseEntity<?> createCareer(@RequestPart("data")  CareerRequestDto request,
                                                 @RequestPart(value="resume",required = false) MultipartFile resumeFile,
                                                 @RequestPart(value="video",required = false) MultipartFile videoFile ){
             try{
                Careers saved = careersService.createCareer(request, resumeFile,videoFile);
                return ResponseEntity.ok(saved);
             }catch (AlreadyAppliedException ex){
            // Build structured response if user already applied//
                Map<String, Object> response = new HashMap<>();
                response.put("message", ex.getMessage());
                response.put("appliedOn", ex.getAppliedOn());
                response.put("status", 409);
             return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
     
     }

     @PostMapping("/existing/otp/send")
     public ResponseEntity<?> sendExistingOtp(@RequestBody CareerExistingOtpSendRequest req) {
         String identifier = req == null ? null : req.getIdentifier();
         String modeRaw = req == null ? null : req.getMode();
         String mode = modeRaw == null ? "" : modeRaw.trim().toUpperCase();
         if (identifier == null || identifier.trim().isEmpty()) {
             return ResponseEntity.badRequest().body("Email or mobile is required.");
         }
         if (!(mode.equals("EMAIL") || mode.equals("MOBILE") || mode.equals("BOTH"))) {
             return ResponseEntity.badRequest().body("Invalid mode. Use EMAIL, MOBILE, BOTH");
         }

         Careers c = findCareerByIdentifier(identifier).orElse(null);
         if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No application found for this identifier.");

         try {
             if (mode.equals("EMAIL") || mode.equals("BOTH")) {
                 if (c.getEmail() == null || c.getEmail().trim().isEmpty()) {
                     if (mode.equals("EMAIL")) return ResponseEntity.badRequest().body("No email found for this application.");
                 } else {
                     otpService.sendEmailOtp(c.getEmail());
                 }
             }
             if (mode.equals("MOBILE") || mode.equals("BOTH")) {
                 if (c.getPhone() == null || c.getPhone().trim().isEmpty()) {
                     if (mode.equals("MOBILE")) return ResponseEntity.badRequest().body("No mobile number found for this application.");
                 } else {
                     otpService.sendMobileOtp(c.getPhone());
                 }
             }
             return ResponseEntity.ok(Map.of("message", "OTP sent"));
         } catch (IllegalArgumentException e) {
             return ResponseEntity.badRequest().body(e.getMessage());
         } catch (IllegalStateException e) {
             return ResponseEntity.status(500).body(e.getMessage());
         } catch (Exception e) {
             return ResponseEntity.status(500).body("Failed to send OTP. Please try again.");
         }
     }

     @PostMapping("/existing/otp/verify")
     public ResponseEntity<?> verifyExistingOtp(@RequestBody CareerExistingOtpVerifyRequest req) {
         String identifier = req == null ? null : req.getIdentifier();
         String otp = req == null ? null : req.getOtp();
         String modeRaw = req == null ? null : req.getMode();
         String mode = modeRaw == null ? "" : modeRaw.trim().toUpperCase();
         if (identifier == null || identifier.trim().isEmpty()) {
             return ResponseEntity.badRequest().body("Email or mobile is required.");
         }
         if (otp == null || otp.trim().isEmpty()) {
             return ResponseEntity.badRequest().body("OTP is required.");
         }
         if (!(mode.equals("EMAIL") || mode.equals("MOBILE") || mode.equals("BOTH"))) {
             return ResponseEntity.badRequest().body("Invalid mode. Use EMAIL, MOBILE, BOTH");
         }

         Careers c = findCareerByIdentifier(identifier).orElse(null);
         if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No application found for this identifier.");

         boolean ok = false;
         if (mode.equals("EMAIL")) {
             ok = otpService.verifyEmailOtp(c.getEmail(), otp);
         } else if (mode.equals("MOBILE")) {
             ok = otpService.verifyMobileOtp(c.getPhone(), otp);
         } else { // BOTH
             // Accept OTP from either channel (email or mobile).
             boolean emailOk = c.getEmail() != null && !c.getEmail().trim().isEmpty() && otpService.verifyEmailOtp(c.getEmail(), otp);
             boolean mobileOk = c.getPhone() != null && !c.getPhone().trim().isEmpty() && otpService.verifyMobileOtp(c.getPhone(), otp);
             ok = emailOk || mobileOk;
         }

         if (!ok) return ResponseEntity.badRequest().body("Invalid or expired OTP");

         String token = UUID.randomUUID().toString();
         String key = normalizeIdentifierKey(identifier);
         EXISTING_TOKENS.put(token, new ExistingToken(key, Instant.now().plusSeconds(EXISTING_TOKEN_TTL_SECONDS)));
         return ResponseEntity.ok(Map.of("token", token));
     }

     @GetMapping("/existing")
     public ResponseEntity<?> getExistingApplication(
             @RequestParam("identifier") String identifier,
             @RequestHeader(value = "X-OTP-Token", required = false) String token) {
         if (identifier == null || identifier.trim().isEmpty()) {
             return ResponseEntity.badRequest().body("identifier is required");
         }
         if (token == null || token.trim().isEmpty()) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP token is required");
         }
         ExistingToken rec = EXISTING_TOKENS.get(token.trim());
         if (rec == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP token");
         if (Instant.now().isAfter(rec.expiresAt)) {
             EXISTING_TOKENS.remove(token.trim());
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP token expired");
         }
         String key = normalizeIdentifierKey(identifier);
         if (!rec.identifierKey.equals(key)) {
             return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OTP token does not match identifier");
         }

         Careers c = findCareerByIdentifier(identifier).orElse(null);
         if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No application found.");
         return ResponseEntity.ok(c);
     }

     @PutMapping("/archive/{id}")
     public ResponseEntity<String> archive(@PathVariable Long id){
              careerArchiveService.archiveCareer(id);
          return ResponseEntity.status(HttpStatus.OK).body("Applicant Archived successfully");
       }

     private java.util.Optional<Careers> findCareerByIdentifier(String identifier) {
         String raw = identifier == null ? "" : identifier.trim();
         if (raw.contains("@")) {
             return careersRepository.findFirstByEmailIgnoreCase(raw);
         }
         String digits = raw.replaceAll("\\D", "");
         if (digits.length() >= 10) {
             String last10 = digits.substring(digits.length() - 10);
             return careersRepository.findFirstByPhoneEqualsOrPhoneEndsWith(raw, last10);
         }
         return java.util.Optional.empty();
     }

     private static String normalizeIdentifierKey(String identifier) {
         String raw = identifier == null ? "" : identifier.trim().toLowerCase();
         if (raw.contains("@")) return raw;
         String digits = raw.replaceAll("\\D", "");
         if (digits.length() >= 10) return digits.substring(digits.length() - 10);
         return digits;
     }
 }


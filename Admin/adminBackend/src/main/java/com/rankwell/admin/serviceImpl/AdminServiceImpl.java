package com.rankwell.admin.serviceImpl;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rankwell.admin.dto.AdminDto;
import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.entity.Admins.Role;
import com.rankwell.admin.repository.AdminRepository;
import com.rankwell.admin.services.AdminService;
import com.rankwell.admin.entity.EnvironmentSetting;
import com.rankwell.admin.services.EnvironmentSettingService;


@Service
public class AdminServiceImpl implements AdminService{
	
	@Autowired
	private AdminRepository adminRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	private SuperAdmin superAdmin;

	@Autowired
    private EnvironmentSettingService environmentSettingService;

	@Override
	public String createAdmin(AdminDto adminDto, String loggedInEmail) {
		
		Admins loggedInAdmin = adminRepository.findByEmail(loggedInEmail)
				.orElseThrow(() -> new IllegalArgumentException("LoggedIn Admin Not Found"));
		
		if(loggedInAdmin.getRole() != Admins.Role.SUPER_ADMIN){
			return "Only Super Admin Are Allowed To Created New Admins";
		 }
		
		if(adminRepository.findByEmail(adminDto.getEmail()).isPresent()) {
			return "Email Already Exists";
		}
		
		// List<Departments> departments = departmentRepository.findAllById(adminDto.getDeptId());
		
		Admins newAdmin = new Admins();
		newAdmin.setName(adminDto.getName());
		newAdmin.setEmail(adminDto.getEmail());
		if(adminDto.getPassword() != null) {
			newAdmin.setPassword(adminDto.getPassword());
		}
		newAdmin.setRole(adminDto.getRole());
		newAdmin.setIsActive(true);

//		if (adminDto.getDeptId() != null && !adminDto.getDeptId().isEmpty()){
//            List<Departments> departments =
//                    departmentRepository.findAllById(adminDto.getDeptId());
//            newAdmin.setDepartments(departments);
//         }
 
		adminRepository.save(newAdmin);
		return "Admin Created Successfully";
	}

	@Override
	public String updateAdminStatus(AdminDto adminDto) {
		Admins admin = adminRepository.findByEmail(adminDto.getEmail()).orElseThrow(() -> new RuntimeException("Admin Not Found"));
		if(adminDto.getIsActive() != null) {
			admin.setIsActive(adminDto.getIsActive());
			adminRepository.save(admin);
			return adminDto.getIsActive() ? "Admin is now Active" : "Admin has been Disabled";
		}
		if(adminDto.getIs2FAEnabled() != null) {
			admin.setIs2FAEnabled(adminDto.getIs2FAEnabled());
		}
		if(adminDto.getFreezeAccess() != null) {
			admin.setFreezeAccess(adminDto.getFreezeAccess());
			adminRepository.save(admin);
			return adminDto.getFreezeAccess() ? "Admin now use the Freeze Button" : "Permission Denied For Using Freeze Button";
		}
		adminRepository.save(admin);
		return adminDto.getIs2FAEnabled() ? "Two Factor Authentication Is Enabled" : "Two Factor Authentication Is Disabled";
	}

	@Override
	public List<Admins> getAllAdmins() {
		List<Admins> list = adminRepository.findAll();
		return list;
	}

	@Override
	public String updatePassword(Map<String, String> passwordInfo, String loggedInUserEmail) {
		String oldPassword = passwordInfo.get("oldPassword");
		String newPassword = passwordInfo.get("newPassword");
		Admins admin = adminRepository.findByEmail(loggedInUserEmail).orElseThrow(() -> new RuntimeException("Admin Not Found"));
		
		if(!passwordEncoder.matches(oldPassword, admin.getPassword())) {
			return "Current Password Is Incorrect";
		}
		
		if(oldPassword.equals(newPassword)) {
			return "Current Password And New Password Are Same";
		}
		
		admin.setPassword(newPassword);
		adminRepository.save(admin);
		return "Password Updated Successfully";
	}

	@Override
	public ResponseEntity<String> deleteAdmins(Long id) {
		Optional<Admins> admins = adminRepository.findById(id);
		if(admins.isPresent()) {
			adminRepository.deleteById(id);
			return ResponseEntity.status(HttpStatus.OK).body("Admin Deleted !!");
		}else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin Not Exists With This Id : " + id);
		}
	}

	@Override
	public Admins getAdminsByLoggedInUser(String email) {
		Optional<Admins> admin = adminRepository.findByEmail(email);
		if(admin.isPresent()) {
			return admin.get();
		}
		return null;
	}

	@Override
	public ResponseEntity<?> sendPasswordToMail(AdminDto adminDto, Principal principal) { 
		
		Admins loggedInsuperAdmin = adminRepository.findByEmail(principal.getName()).orElseThrow(() ->
		new IllegalArgumentException("Invalid Email"));
		
		if(!loggedInsuperAdmin.getRole().equals(Role.SUPER_ADMIN)) {
			return ResponseEntity.badRequest().body("You are not authorized to do this operations:");
		}
		
		//whom password need to send (super admin)
		if(adminDto.getSendMailToSuperAdmin() != null) {
			Admins admin = adminRepository.findByEmail(adminDto.getEmail()).orElseThrow(() ->
			new IllegalArgumentException("Invalid Email"));
			
			String email = principal.getName();
			String password = UUID.randomUUID().toString().substring(0,8);
			
			admin.setPassword(password);
			adminRepository.save(admin);
			
			superAdmin.sendEmailWithPassword(email, password);
			ResponseEntity.ok().body("Password Successfully Sent To Super Admin Mail");
		}else { //other admins
			Admins admin = adminRepository.findByEmail(adminDto.getEmail()).orElseThrow(() ->
			new IllegalArgumentException("Invalid Email"));
			
			String email = admin.getEmail();
			String password = UUID.randomUUID().toString().substring(0,8);
			
			admin.setPassword(password);
			
			superAdmin.sendEmailWithPassword(email, password);
			
			ResponseEntity.ok().body("Password Successfully Sent To Admin Mail");
		 }
		
		   return null;
	 }

	@Transactional
	@Override
	public ResponseEntity<String> updateByEmail(String email, AdminDto adminDto, Principal principal) {

		try {
			// Check who is trying to update(Only Super Admin*)
			Admins loggedInsuperAdmin = adminRepository.findByEmail(principal.getName()).orElseThrow(() ->
					new IllegalArgumentException("Invalid Email"));

			// Check which admin's update is going to be done.
			Admins admin = adminRepository.findByEmail(email)
					.orElseThrow(() ->
							new IllegalArgumentException("Admin not found with email: " + email));

			if(adminDto.getRole() != null){
				if (!loggedInsuperAdmin.getRole().equals(Role.SUPER_ADMIN)) {
					return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not allowed to change admin roles");
				}
				admin.setRole(adminDto.getRole());
			}

//			if (adminDto.getDeptId() != null && !adminDto.getDeptId().isEmpty()) {
//				List<Departments> newDepartments =
//						departmentRepository.findAllById(adminDto.getDeptId());
//
//				if (newDepartments.size() != adminDto.getDeptId().size()) {
//					throw new IllegalArgumentException("One or more departments not found");
//				}
//
//				admin.getDepartments().clear();
//				admin.getDepartments().addAll(newDepartments);
//			}

			admin.setName(adminDto.getName()); // You can know able to update the admin's name (TeamAdmin/SubAdmin).
			adminRepository.save(admin);
			return ResponseEntity.ok("Admin updated successfully");

		} catch (IllegalArgumentException ex) {
			return ResponseEntity
					.status(HttpStatus.NOT_FOUND)
					.body(ex.getMessage());

		} catch (Exception ex) {
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("Failed to update admin. Please try again later.");
		}
	}
		
	@Override
	public ResponseEntity<String>  updatePasswordBySuperAdmin(Map<String, String> passwordInfo, String adminEmailId, Principal principal) {
		String newPassword = passwordInfo.get("newPassword");
		String confirmNewPassword = passwordInfo.get("confirmNewPassword");

		Admins admin = adminRepository.findByEmail(adminEmailId).orElseThrow(() -> new RuntimeException("Admin Email Id Not Found"));

		Admins loggedInsuperAdmin = adminRepository.findByEmail(principal.getName()).orElseThrow(() ->
		new IllegalArgumentException("Invalid Email"));
		
		if(!loggedInsuperAdmin.getRole().equals(Role.SUPER_ADMIN)) {
			return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to perform this operation");
		}
		
		if(!newPassword.equals(confirmNewPassword)) {
			return ResponseEntity
                .badRequest()
                .body("New password and confirm password do not match");
		} 
		
		admin.setPassword(confirmNewPassword);
		adminRepository.save(admin);

		return ResponseEntity.ok("Password Updated Successfully");
	}


	// file server switching logic, without logge as of now get permission issue.
	@Override
	@Transactional
	public void switchFileServer(Long serverId) {
		try {
			EnvironmentSetting server = environmentSettingService.getById(serverId);
			String serverIp = server.getServerIp();

			ProcessBuilder processBuilder =
				new ProcessBuilder("/opt/scripts/configure-file-server.sh", serverIp);

			Process process = processBuilder.start();
			int exitCode = process.waitFor();

			if (exitCode != 0) {
				throw new RuntimeException("Mount failed for server IP: " + serverIp);
			}

		} catch (IOException e) {
			throw new RuntimeException("IO Exception during switch: " + e.getMessage(), e);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new RuntimeException("Process interrupted: " + e.getMessage(), e);
		} catch (Exception e) {
			throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
		}
	}



}

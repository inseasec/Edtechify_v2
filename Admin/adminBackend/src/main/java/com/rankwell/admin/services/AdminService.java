package com.rankwell.admin.services;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.rankwell.admin.dto.AdminDto;
import com.rankwell.admin.entity.Admins;

public interface AdminService {

	String createAdmin(AdminDto adminDto, String loggedInEmail);

	String updateAdminStatus(AdminDto adminDto);

	List<Admins> getAllAdmins();

	String updatePassword(Map<String, String> passwordInfo, String email);

	ResponseEntity<String> deleteAdmins(Long id);

	Admins getAdminsByLoggedInUser(String email);

	ResponseEntity<?> sendPasswordToMail(AdminDto adminDto, Principal principal);

	ResponseEntity<String> updateByEmail(String email, AdminDto adminDto, Principal principal);
	ResponseEntity<String> updatePasswordBySuperAdmin(Map<String, String> passwordInfo, String adminEmailId, Principal principal);

	void switchFileServer(Long serverId);
}

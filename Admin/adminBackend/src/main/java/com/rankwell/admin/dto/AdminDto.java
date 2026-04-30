package com.rankwell.admin.dto;

import java.util.Set;

import com.rankwell.admin.entity.Admins.Role;

public class AdminDto {
	
	private Long id;
	private String name;
	private String email;
	private String password;
	private Boolean isActive;
	private Role role;
	private Set<Long> deptId;
	private Boolean sendMailToSuperAdmin;
	private Boolean is2FAEnabled;
	private Boolean freezeAccess;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Boolean getIsActive() {
		return isActive;
	}
	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}	
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	
	public Set<Long> getDeptId() {
		return deptId;
	}
	public void setDeptId(Set<Long> deptId) {
		this.deptId = deptId;
	}	
	public Boolean getSendMailToSuperAdmin() {
		return sendMailToSuperAdmin;
	}
	public void setSendMailToSuperAdmin(Boolean sendMailToSuperAdmin) {
		this.sendMailToSuperAdmin = sendMailToSuperAdmin;
	}
	public Boolean getIs2FAEnabled() {
		return is2FAEnabled;
	}
	public void setIs2FAEnabled(Boolean is2faEnabled) {
		is2FAEnabled = is2faEnabled;
	}
	public Boolean getFreezeAccess() {
		return freezeAccess;
	}
	public void setFreezeAccess(Boolean freezeAccess) {
		this.freezeAccess = freezeAccess;
	}
	public AdminDto(Long id, String name, String email, String password, Boolean isActive, Role role, Set<Long> deptId,
			Boolean sendMailToSuperAdmin, Boolean is2faEnabled, Boolean freezeAccess) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.password = password;
		this.isActive = isActive;
		this.role = role;
		this.deptId = deptId;
		this.sendMailToSuperAdmin = sendMailToSuperAdmin;
		this.is2FAEnabled = is2faEnabled;
		this.freezeAccess = freezeAccess;
	}
	public AdminDto() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
}

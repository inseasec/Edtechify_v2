package com.rankwell.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_comm_config")
public class UserCommConfig {
	@Id
	private Long id = 1L;

	@Column(name = "user_mail_host")
	private String userMailHost;

	@Column(name = "user_mail_port")
	private String userMailPort;

	@Column(name = "user_mail_username")
	private String userMailUsername;

	@Column(name = "user_mail_password")
	private String userMailPassword;

	@Column(name = "user_mail_smtp_auth")
	private String userMailSmtpAuth;

	@Column(name = "user_mail_smtp_starttls")
	private String userMailSmtpStarttls;

	@Column(name = "user_twilio_enabled")
	private String userTwilioEnabled;

	@Column(name = "user_twilio_account_sid")
	private String userTwilioAccountSid;

	@Column(name = "user_twilio_auth_token")
	private String userTwilioAuthToken;

	@Column(name = "user_twilio_from_number")
	private String userTwilioFromNumber;

	@Column(name = "user_twilio_default_country_code")
	private String userTwilioDefaultCountryCode;

	@Column(name = "user_mail_instructions", columnDefinition = "TEXT")
	private String userMailInstructions;

	@Column(name = "user_twilio_instructions", columnDefinition = "TEXT")
	private String userTwilioInstructions;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserMailHost() {
		return userMailHost;
	}

	public void setUserMailHost(String userMailHost) {
		this.userMailHost = userMailHost;
	}

	public String getUserMailPort() {
		return userMailPort;
	}

	public void setUserMailPort(String userMailPort) {
		this.userMailPort = userMailPort;
	}

	public String getUserMailUsername() {
		return userMailUsername;
	}

	public void setUserMailUsername(String userMailUsername) {
		this.userMailUsername = userMailUsername;
	}

	public String getUserMailPassword() {
		return userMailPassword;
	}

	public void setUserMailPassword(String userMailPassword) {
		this.userMailPassword = userMailPassword;
	}

	public String getUserMailSmtpAuth() {
		return userMailSmtpAuth;
	}

	public void setUserMailSmtpAuth(String userMailSmtpAuth) {
		this.userMailSmtpAuth = userMailSmtpAuth;
	}

	public String getUserMailSmtpStarttls() {
		return userMailSmtpStarttls;
	}

	public void setUserMailSmtpStarttls(String userMailSmtpStarttls) {
		this.userMailSmtpStarttls = userMailSmtpStarttls;
	}

	public String getUserTwilioEnabled() {
		return userTwilioEnabled;
	}

	public void setUserTwilioEnabled(String userTwilioEnabled) {
		this.userTwilioEnabled = userTwilioEnabled;
	}

	public String getUserTwilioAccountSid() {
		return userTwilioAccountSid;
	}

	public void setUserTwilioAccountSid(String userTwilioAccountSid) {
		this.userTwilioAccountSid = userTwilioAccountSid;
	}

	public String getUserTwilioAuthToken() {
		return userTwilioAuthToken;
	}

	public void setUserTwilioAuthToken(String userTwilioAuthToken) {
		this.userTwilioAuthToken = userTwilioAuthToken;
	}

	public String getUserTwilioFromNumber() {
		return userTwilioFromNumber;
	}

	public void setUserTwilioFromNumber(String userTwilioFromNumber) {
		this.userTwilioFromNumber = userTwilioFromNumber;
	}

	public String getUserTwilioDefaultCountryCode() {
		return userTwilioDefaultCountryCode;
	}

	public void setUserTwilioDefaultCountryCode(String userTwilioDefaultCountryCode) {
		this.userTwilioDefaultCountryCode = userTwilioDefaultCountryCode;
	}

	public String getUserMailInstructions() {
		return userMailInstructions;
	}

	public void setUserMailInstructions(String userMailInstructions) {
		this.userMailInstructions = userMailInstructions;
	}

	public String getUserTwilioInstructions() {
		return userTwilioInstructions;
	}

	public void setUserTwilioInstructions(String userTwilioInstructions) {
		this.userTwilioInstructions = userTwilioInstructions;
	}
}


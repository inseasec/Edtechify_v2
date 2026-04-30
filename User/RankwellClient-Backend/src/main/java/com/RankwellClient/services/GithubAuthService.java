package com.RankwellClient.services;

public interface GithubAuthService {
	String getClientId();
	String buildAuthorizeUrl(String state, String redirectUri);
	String authenticateWithCode(String code, String redirectUri);
}


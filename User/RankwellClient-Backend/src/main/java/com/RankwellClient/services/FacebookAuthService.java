package com.RankwellClient.services;

public interface FacebookAuthService {
	String authenticateWithAccessToken(String accessToken);
	String getAppId();
}


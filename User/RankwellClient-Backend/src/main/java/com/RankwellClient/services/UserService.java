package com.RankwellClient.services;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.RankwellClient.dto.UserDto;
import com.RankwellClient.entity.Users;
import java.security.Principal;

public interface UserService {
    Users registerUser(UserDto userDto);
    String loginUser(String emailOrMobile, String password);
	ResponseEntity<String> uploadUserImage(Long userId, MultipartFile file);
	Users getUser(Long userId);
	String updateUserInfo(Long userId, UserDto userDto);
	String updateUserAddress(Long userId, UserDto userDto);
	String updatePassword(Long userId ,Map<String, String> passwordInfo); 
	 
}
 
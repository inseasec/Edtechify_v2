package com.example.UserBackend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.RankwellClient.dto.UserDto;
import com.RankwellClient.entity.Users;
import com.RankwellClient.services.UserService;
import java.security.Principal;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {
	
	private final UserService userService ;
	
	public UserController(UserService userService) {
		this.userService=userService;
	}
	
	@PostMapping("/signup")
	public ResponseEntity<Users> registerUser(@RequestBody UserDto userDTO){
		return ResponseEntity.ok(userService.registerUser(userDTO));	
	  }
	
	@PostMapping("/signin")
	public ResponseEntity<String> loginUser(@RequestBody UserDto userDTO) {
	
	    String loginIdentifier = (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) 
                ? userDTO.getEmail() 
                : (userDTO.getMobileNo() != null && !userDTO.getMobileNo().isEmpty())  
                      ? userDTO.getMobileNo() 
                      : null;

	    System.out.println("Login Identifier: " + loginIdentifier);
	    
	    String jwtToken = userService.loginUser(loginIdentifier, userDTO.getPassword()); 
	    return ResponseEntity.ok(jwtToken);
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

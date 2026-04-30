package com.RankwellClient.ServiceImpl;

import java.io.File;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.RankwellClient.config.JwtUtil;
import com.RankwellClient.config.StoragePathResolver;
//import com.RankwellClient.config.JwtUtil;
import com.RankwellClient.dto.UserDto;
import com.RankwellClient.entity.Users;
import com.RankwellClient.repository.UserRepository;
import com.RankwellClient.services.UserService;
//import com.RankwellClient.config.StoragePathResolver; 

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil; //JwtUtil

    private final StoragePathResolver pathResolver;

    public UserServiceImpl(StoragePathResolver pathResolver){
          this.pathResolver=pathResolver; 
      }

	 private String UPLOAD_DIR ="accounts";
    
    @Override
    public Users registerUser(UserDto userDto) {
        String hashedPassword = passwordEncoder.encode(userDto.getPassword());

        Users user = new Users();
        user.setEmail(userDto.getEmail());
        user.setMobileNo(userDto.getMobileNo());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }

    @Override
    public String loginUser(String emailOrMobile, String password) {
    	System.out.println(  emailOrMobile);
        Optional<Users> userOptional = userRepository.findByEmail(emailOrMobile);

		if (!userOptional.isPresent()) {
            userOptional = userRepository.findByMobileNo(emailOrMobile);
        }

        if (userOptional.isPresent()){
            Users user = userOptional.get();

            if (user.isFrozen()) {
                throw new RuntimeException("Account is frozen. Contact admin.");
              }
            if (passwordEncoder.matches(password, user.getPassword())){
               return jwtUtil.generateToken(user.getId());
               } else {
                  throw new RuntimeException("Invalid password");
                }
          } else {
            throw new RuntimeException("User not found");
         }
    }
    
	@Override
	public ResponseEntity<String> uploadUserImage(Long userId, MultipartFile file ){
		try {
			Optional<Users> userOpt = userRepository.findById(userId);
			if(!userOpt.isPresent()){
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
			   }
			String folderName;          
			Users user = userOpt.get();
			if(user.getEmail() == null || user.getEmail().isEmpty()){
				    folderName=user.getMobileNo();
			}
			else{
			    folderName=user.getEmail();
			}
			String basePath = pathResolver.getBasePath();
			File uploadDir = new File(basePath,"/"+UPLOAD_DIR+"/"+folderName);
			if(!uploadDir.exists()){
				uploadDir.mkdirs();
			 }
			
			String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+","_");
			File destination = new File(uploadDir, fileName);
			 if(user.getUserImg()!= null){
                File oldFile = new File(basePath+"/"+user.getUserImg());
				 if(oldFile.exists()){
					oldFile.delete();
				 }
			 }
			file.transferTo(destination);
			
			user.setUserImg(UPLOAD_DIR +"/"+folderName+"/"+fileName);
			userRepository.save(user);
			
			return ResponseEntity.ok("Image Uploaded successfully");
		}catch(Exception e){
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
		 }
	}

	@Override
	public Users getUser(Long userId){
		Optional<Users> userOpt = userRepository.findById(userId);
		if(userOpt.isPresent()) {
			return userOpt.get();
		}
		return null;
	}
 
	@Override
	public String updateUserInfo(Long userId, UserDto userDto) { 
		Optional<Users> userOpt = userRepository.findById(userId);
		if(userOpt.isPresent()) {
			Users user = userOpt.get();
			user.setEmail(userDto.getEmail());
			user.setMobileNo(userDto.getMobileNo());
			user.setUserName(userDto.getUserName());
			userRepository.save(user);
			return "User Updated Successfully";
		}
		return "User not found";
	}

	@Override
	public String updateUserAddress(Long userId, UserDto userDto) {
		Optional<Users> userOpt = userRepository.findById(userId);
		if(userOpt.isPresent()) {
			Users user = userOpt.get();
			user.setTimeZone(userDto.getTimeZone());
			user.setCountry(userDto.getCountry());
			user.setStreetAddress(userDto.getStreetAddress());
			user.setCity(userDto.getCity());
			user.setState(userDto.getState());
			user.setPostalCode(userDto.getPostalCode());
			userRepository.save(user);
			return "User Address Updated Successfully";
		}
		return "User not found";
	}

	@Override
	public String updatePassword(Long userId, Map<String, String> passwordInfo) {  
		String oldPassword = passwordInfo.get("oldPassword");
		String newPassword = passwordInfo.get("newPassword");
		
		Users user = userRepository.findById(userId).orElseThrow(()->
		new RuntimeException("User not found"));
		
		if(!passwordEncoder.matches(oldPassword, user.getPassword())) {
			return "Current password is incorrect";
		}
		
		if(oldPassword.equals(newPassword)) {
			return "Current and New password are same";
		}
		String hashedPassword = passwordEncoder.encode(newPassword);
		user.setPassword(hashedPassword);
		userRepository.save(user);
		return "Password Updated Successfully";
	}

}

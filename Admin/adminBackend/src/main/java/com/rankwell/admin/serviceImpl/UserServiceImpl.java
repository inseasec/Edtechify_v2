package com.rankwell.admin.serviceImpl;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rankwell.admin.dto.UserDto;
import com.rankwell.admin.entity.Users;
import com.rankwell.admin.repository.UserRepository;
import com.rankwell.admin.services.UserService;


@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;


    @Override
    public List<Users> getAllUsers(){
      //  return userRepository.findAll();
      return userRepository.findAllByOrderByIdDesc();
    }
    
    @Override
    public String FrezeOrUnfrezeUser(Long userId){
          
          Users user = userRepository.findById(userId)
               .orElseThrow(() -> new RuntimeException("User not found"));

           //  Toggle logic
           user.setFrozen(!user.isFrozen());
           userRepository.save(user);
         String message = user.isFrozen()  ? "User frozen successfully"  : "User unfrozen successfully";
             return message;
       }

       
	    @Override
	    public String updatePassword(Long userId, Map<String, String> passwordInfo) {  
		    // String oldPassword = passwordInfo.get("oldPassword");
		    String newPassword = passwordInfo.get("newPassword");
		
		    Users user = userRepository.findById(userId).orElseThrow(()->
		                 new RuntimeException("User not found"));
		
	    	// if(!passwordEncoder.matches(oldPassword, user.getPassword())) {
		    //  	return "Current password is incorrect";
		    // }
		
		//    if(oldPassword.equals(newPassword)) {
		//     	return "Current and New password are same";
		//     }
		   String hashedPassword = passwordEncoder.encode(newPassword);
		    user.setPassword(hashedPassword);
		   userRepository.save(user);
		   return "Password Updated Successfully";
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

}

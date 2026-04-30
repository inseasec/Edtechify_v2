package com.rankwell.admin.controllers;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rankwell.admin.dto.UserDto;
import com.rankwell.admin.entity.Users;
import com.rankwell.admin.services.UserService;



@RestController
@RequestMapping("/users")
public class UserController {

   @Autowired
   UserService userService;
	
	

     @GetMapping("/getAllUsers")
     public List<Users> getAllUsers(){
        return userService.getAllUsers();
     }


      @PutMapping("/admin/toggle-freeze/{userId}")
      public String toggleFreeze(@PathVariable Long userId) {
              
             return userService.FrezeOrUnfrezeUser(userId); 
       }

      @PutMapping("/updatePassword/{userId}")  
	   public ResponseEntity<String> updatePassword(@PathVariable Long userId ,@RequestBody Map<String,String> passwordInfo){
		String status =  userService.updatePassword(userId, passwordInfo);
		return ResponseEntity.ok(status); 
	  }

    @PutMapping("updateUserInfo/{userId}") 
	public String updateUserInfo(@PathVariable Long userId, @RequestBody UserDto userDto) {
		return userService.updateUserInfo(userId,userDto);
	}

}
	
	
	
	




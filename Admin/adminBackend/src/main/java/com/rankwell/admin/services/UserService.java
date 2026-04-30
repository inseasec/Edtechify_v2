package com.rankwell.admin.services;

import java.util.List;
import java.util.Map;

import com.rankwell.admin.dto.UserDto;
import com.rankwell.admin.entity.Users;


public interface UserService {
    
  public List<Users> getAllUsers();

  public String FrezeOrUnfrezeUser(Long userId); 

  String updatePassword(Long userId ,Map<String, String> passwordInfo); 
   public String updateUserInfo(Long userId,UserDto userDto);   
	
}
 
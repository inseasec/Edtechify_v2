package com.rankwell.admin.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rankwell.admin.entity.Users;



public interface UserRepository extends JpaRepository<Users, Long>{

    List<Users> findAllByOrderByIdDesc();
     
}

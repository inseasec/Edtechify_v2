package com.rankwell.admin.services;

import org.springframework.web.multipart.MultipartFile;
import com.rankwell.admin.dto.CareerRequestDto;
import com.rankwell.admin.entity.Careers;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CareersService {
 
    public List<Careers> getAllApplicants();
    
    public Careers  getApplicantById(Long id);

    public List<Careers> getApplicantByStatus(String status);

    public  Careers  updateByStatus(String status,Long id); 

    public  String updateHrAssignment(Long id,Long hrId);

    public ResponseEntity<?> getMyApplicantsByHrId(Long hrId);

    public String removeHrAssignment(Long id);

    public ResponseEntity<?> getApplicantsWithAssignedHr();
    
  }

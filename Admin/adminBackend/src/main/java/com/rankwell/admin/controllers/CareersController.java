package com.rankwell.admin.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.rankwell.admin.dto.CareerRequestDto;
import com.rankwell.admin.entity.Careers;
import com.rankwell.admin.services.CareersService;
import com.rankwell.admin.services.CareerArchiveService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import org.springframework.http.HttpStatus; 
import com.rankwell.admin.entity.ArchivedCareers; 
import com.rankwell.admin.repository.AdminRepository;
import java.security.Principal;
import org.springframework.web.bind.annotation.RequestParam;
import com.rankwell.admin.entity.Admins;





@RestController
@RequestMapping("/careers") 
public class CareersController {

      @Autowired
      private CareersService careersService; 

      @Autowired
      CareerArchiveService careerArchiveService;

      @Autowired
       AdminRepository adminRepository;

       


    @GetMapping("/getAllApplicants") 
    public ResponseEntity<List<Careers>>getAllApplicants(){ 

         List<Careers> applicants=careersService.getAllApplicants();
         if(applicants==null || applicants.isEmpty()){
             return ResponseEntity.noContent().build();
           }
         return ResponseEntity.ok().body(applicants);
    }
    
    @GetMapping("/getApplicantById/{id}")  
    public ResponseEntity<Careers> getApplicantById(@PathVariable Long id){
         Careers applicant=careersService.getApplicantById(id);
         return ResponseEntity.ok(applicant); 
    }


    @GetMapping("/getApplicantByStatus/{status}") 
    public ResponseEntity<List<Careers>>  getApplicantsByStatus(@PathVariable String status ){
           List<Careers> careerWithStatus= careersService.getApplicantByStatus(status);  
           return ResponseEntity.ok(careerWithStatus);
    }

    @PutMapping("/updateByStatus/{id}/{status}")
    public ResponseEntity<Careers> updateByStatus(@PathVariable String status,@PathVariable Long id){
            Careers statusToUpdate= careersService.updateByStatus(status,id);
            return   ResponseEntity.ok(statusToUpdate);
      }

     @PutMapping("/archive/{id}")
     public ResponseEntity<String> archive(@PathVariable Long id){
    
              careerArchiveService.archiveCareer(id);
          return ResponseEntity.status(HttpStatus.OK).body("Applicant Archived successfully");
       }

      @GetMapping("/getAllArchived")
      public ResponseEntity<List<Careers>> getAllArchived(){
        // Frontend careers pipeline expects `Careers` rows.
        // Treat "archived" as status=ARCHIVED on Careers (same shape as getAllApplicants).
        List<Careers> archived = careersService.getApplicantByStatus("ARCHIVED");
        if (archived == null || archived.isEmpty()) {
          return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(archived);
      }

        @PutMapping("updateHr/{id}")  
        public ResponseEntity<String> updateHr(@PathVariable Long id,@RequestParam boolean assign, Principal principal){
          Long hrId = getLoggedInUserId(principal);
          Admins admin = adminRepository.findByEmail(principal.getName()).orElseThrow(() -> new RuntimeException("User not found")); 

          if(assign && admin.getRole() == Admins.Role.HR){
            careersService.updateHrAssignment(id, hrId);
            String message="Applicant assigned successfully";
            return ResponseEntity.ok(message);
          }else if(admin.getRole() == Admins.Role.SUPER_ADMIN){           
              careersService.removeHrAssignment(id);
              return ResponseEntity.ok("Applicant unassigned successfully");
             }
           return ResponseEntity.status(HttpStatus.FORBIDDEN)
                  .body("You are not authorized to perform this action");
             }

      private Long getLoggedInUserId(Principal principal) {
        return adminRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
      }

       @GetMapping("/getAllOfHr") 
       public ResponseEntity<?> getMyApplicants(Principal principal){
           Admins admin= adminRepository.findByEmail(principal.getName())
                 .orElseThrow(() -> new RuntimeException("User not found"));
                 if(admin.getRole()== Admins.Role.HR){
                   Long hrId= admin.getId();
                   return careersService.getMyApplicantsByHrId(hrId); 
                 }
                 else if(admin.getRole()== Admins.Role.SUPER_ADMIN){
                    return careersService.getApplicantsWithAssignedHr();
                    }
                 return ResponseEntity.status(HttpStatus.FORBIDDEN)
                             .body("You are not authorized to perform this action");
            }

       @GetMapping("/getAdminById/{id}")
       public  Admins getAdminById(@PathVariable Long id){
             return adminRepository.findById(id).orElseThrow(() -> new RuntimeException("Admin not found")); 
       }
   }



package com.rankwell.admin.serviceImpl;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.rankwell.admin.entity.Careers;
import com.rankwell.admin.repository.CareersRepository;
import com.rankwell.admin.services.CareersService;


@Service
public class CareerServiceImpl implements CareersService { 

    @Autowired
    private CareersRepository careersRepository;

    @Override
    public List<Careers> getAllApplicants(){
      //  List<Careers> list= careersRepository.findAll();
      List<Careers> list= careersRepository.findAllByOrderByIdDesc(); 
       if(list==null){
          throw new  RuntimeException("No applicants");  
       }
       System.out.println("my new list");  
       return list; 
      }
     @Override
     public Careers getApplicantById(Long id){
        Careers applicant= careersRepository.findById(id)
                      .orElseThrow(()->new RuntimeException("Applicant not Fount by id"+id));
           return applicant;
      }

      @Override
      public List<Careers> getApplicantByStatus(String status){  
         //   return careersRepository.findByStatus(status);
             return careersRepository.findByStatusOrderByIdDesc(status); 
      }

      @Override
      public  Careers  updateByStatus(String status,Long id){
             Careers applicantToUpdate=this.getApplicantById(id);
                  applicantToUpdate.setStatus(status);
                 return  careersRepository.save(applicantToUpdate);
                }

      @Override
      public  String updateHrAssignment(Long id,Long hrId){
       Careers careers= careersRepository.findById(id).orElseThrow(()-> new RuntimeException("Career Not Found With Id: "+id));
       careers.setHrId(hrId);
        try {
        careersRepository.save(careers);
        return "HR assignment updated successfully";
       } catch (Exception e) {
        throw new RuntimeException("Failed to update HR assignment: " + e.getMessage(), e);
      }
    }
     
     @Override
     public ResponseEntity<?> getMyApplicantsByHrId(Long hrId){
      // List<Careers> applicants = careersRepository.findByHrIdAndStatus(hrId,"APPLIED");
      List<Careers> applicants = careersRepository.findByHrId(hrId);
         if(applicants.isEmpty()){
            return ResponseEntity.ok("No applicants being assigned yet");
            }
         return ResponseEntity.ok(applicants);
      }

    @Override
    public String removeHrAssignment(Long id){
       Careers career=careersRepository.findById(id)
                              .orElseThrow(()-> new RuntimeException("not found"));
            career.setHrId(null);
            careersRepository.save(career);
            return "HR unassigned successfuly";
        }

   
     @Override
     public ResponseEntity<?>getApplicantsWithAssignedHr(){
          List<Careers> applicants=careersRepository.findCareersWithAssignedHr();
          if(applicants.isEmpty()){
             return ResponseEntity.ok("No applicants being assigned yet");
          }
          return ResponseEntity.ok(applicants);
     }


 }

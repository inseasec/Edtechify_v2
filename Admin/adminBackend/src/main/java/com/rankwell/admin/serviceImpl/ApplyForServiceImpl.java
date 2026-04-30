package com.rankwell.admin.serviceImpl;

import com.rankwell.admin.repository.ApplyForRepository;
import com.rankwell.admin.dto.ApplyForDto;
import com.rankwell.admin.entity.ApplyFor;
import com.rankwell.admin.services.ApplyForService;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class ApplyForServiceImpl implements ApplyForService{

     private final ApplyForRepository repository;
        
     public ApplyForServiceImpl(ApplyForRepository repository){
          this.repository=repository;
        }
    
      @Override
      public ApplyFor createJob(ApplyForDto applyDto){

             ApplyFor apply=new ApplyFor();
             apply.setApplyingFor(applyDto.getApplyingFor());
             apply.setDescription(applyDto.getDescription());
             apply.setRoleType(applyDto.getRoleType());
             return repository.save(apply);
         }

       @Override
       public List<ApplyFor> getAllJobs(){
            return repository.findAll();
       }

      @Override
      public ApplyFor getJobsById(Long id){ 
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Data not found by ID: " + id));
       }
       
       @Override
       public ApplyFor updateJob(Long id,ApplyForDto job){
             ApplyFor obj=repository.findById(id)
                                   .orElseThrow(() -> new RuntimeException("Data not found by ID: " + id));
                obj.setApplyingFor(job.getApplyingFor());
                obj.setDescription(job.getDescription());
               return  repository.save(obj);
             }

       @Override
        public String deleteJObById(Long id){
          if (!repository.existsById(id)){
               throw new RuntimeException("Data not found by ID: " + id);
               }
          repository.deleteById(id);
          return "deleted Successfully";
        }
  }



package com.rankwell.admin.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import com.rankwell.admin.services.ApplyForService;
import org.springframework.web.bind.annotation.RequestBody;
import com.rankwell.admin.dto.ApplyForDto;
import com.rankwell.admin.entity.ApplyFor;
import jakarta.persistence.Entity;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.Min; 
import org.springframework.validation.annotation.Validated;


import java.util.List;


@RestController
@RequestMapping("/applyfor")  
@Validated 
public class ApplyForController{ 

    private final ApplyForService service;

    public ApplyForController(ApplyForService service) {
        this.service=service;
    }

    // Create a job //
    @PostMapping("/create")
    public ResponseEntity<ApplyFor> createJob( @Valid @RequestBody ApplyForDto apply) {
        ApplyFor createdJob= service.createJob(apply);
          return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }
   
     // Get all jobs  //
     @GetMapping("/getAllJobs") 
     public ResponseEntity<List<ApplyFor>> getAllJobs(){
           return  ResponseEntity.ok(service.getAllJobs());
       }

    // Get job by id
     @GetMapping("getJobsById/{id}")
        public ResponseEntity<ApplyFor> getJobsById(@PathVariable @Min(1) Long id){
         return ResponseEntity.ok(service.getJobsById(id));
        }

     //  Update a job

     @PutMapping("updateById/{id}")
     public ApplyFor updateById(@PathVariable Long id, @Valid @RequestBody ApplyForDto job) {
           
           ApplyFor updatedJob= service.updateJob(id,job);
           System.out.println(updatedJob);
           return updatedJob;
     }

     // Delete a job
      @DeleteMapping("deleteById/{id}")
      public String deleteJob(@PathVariable Long id) {
              service.deleteJObById(id);
            return "Job delted successfully";
        }   

}
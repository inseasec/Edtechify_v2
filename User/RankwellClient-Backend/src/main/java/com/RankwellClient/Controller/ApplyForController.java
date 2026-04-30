package com.RankwellClient.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.RankwellClient.services.ApplyForService;
import com.RankwellClient.entity.ApplyFor;
import org.springframework.http.ResponseEntity;
import java.util.List;


@RestController
@RequestMapping("/applyfor")    
public class ApplyForController{

    private final ApplyForService service;

    public ApplyForController(ApplyForService service) {
        this.service=service;
    }


     // Get all jobs  //
     @GetMapping("/getAllJobs")
     public ResponseEntity<List<ApplyFor>> getAllJobs(){
           List<ApplyFor> myList=service.getAllJobs();
           if(myList==null || myList.isEmpty()){
              return ResponseEntity.noContent().build();
           }
           return ResponseEntity.ok().body(myList);
       }
} 
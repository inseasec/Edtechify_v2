package com.rankwell.admin.serviceImpl;
import org.springframework.stereotype.Service;
import com.rankwell.admin.repository.CareersRepository;
import com.rankwell.admin.config.StoragePathResolver;
import com.rankwell.admin.repository.CareerArchiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.rankwell.admin.entity.ArchivedCareers; 
import com.rankwell.admin.entity.Careers;
import com.rankwell.admin.services.CareerArchiveService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.File;
import java.util.List;


@Service
public class CareerArchiveServiceImpl implements CareerArchiveService { 
   
   @Autowired
   private CareerArchiveRepository careerArchiveRepository;

   private CareersRepository careersRepository;

   private final StoragePathResolver pathResolver;

   public CareerArchiveServiceImpl(CareersRepository careersRepository,StoragePathResolver pathResolver){
     this.careersRepository=careersRepository;
     this.pathResolver=pathResolver;
   }

   private static final String CAREERS_DIR = "Careers";

   private static final String ARCHIVE_DIR="Archived"; 

   @Transactional
   @Override
   public String archiveCareer(Long careerId){
            
       Careers career =careersRepository.findById(careerId)
         .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"career not fount by ID"+careerId));
   
     ArchivedCareers archiveCareer=new ArchivedCareers(); 
       
      String basePath = pathResolver.getBasePath();

      String archivedResumePath = moveFile(
            career.getResume(), basePath, CAREERS_DIR, ARCHIVE_DIR
        );

        String archivedVideoPath = moveFile(
            career.getVideo(), basePath, CAREERS_DIR, ARCHIVE_DIR
        );

        ArchivedCareers archived = new ArchivedCareers(); 
        archived.setFullName(career.getFullName());
        archived.setEmail(career.getEmail());
        archived.setPhone(career.getPhone());
        archived.setCity(career.getCity());
        archived.setState(career.getState());
        archived.setGender(career.getGender());
        archived.setDob(career.getDob());
        archived.setMaritalStatus(career.getMaritalStatus());
        archived.setQualification(career.getQualification());
        archived.setExperienceLevel(career.getExperienceLevel());
        archived.setCurrentSalary(career.getCurrentSalary());
        archived.setExpectedSalary(career.getExpectedSalary());
        archived.setSubjects(career.getSubjects());
        archived.setStatus("Archived");
        archived.setApplicationDate(career.getApplicationDate()); 

        archived.setResume(archivedResumePath);
        archived.setVideo(archivedVideoPath);

        if (career.getApplyFor() != null){
            archived.setApplyingFor(
                career.getApplyFor().getApplyingFor() 
              );
           }

        careerArchiveRepository.save(archived);
        careersRepository.delete(career);
           return "Career Archived";
         }
    
    private String moveFile(String webPath, String basePath, String sourceDir, String targetDir) {

        if (webPath == null) return null;
        
        String fileName = new File(webPath).getName(); 
        File source = new File(basePath + "/" + sourceDir, fileName);

        File targetFolder = new File(basePath + "/" + sourceDir + "/" + targetDir);
            if (!targetFolder.exists()){
                targetFolder.mkdirs();
            }

            File target = new File(targetFolder, fileName);

            if (!source.exists()) {
                throw new RuntimeException("Source file not found: " + source.getAbsolutePath());
            }

            if (!source.renameTo(target)){
                throw new RuntimeException("Failed to move file:"+fileName);
            }
        
        return  sourceDir + "/" + targetDir + "/" + fileName;
    }

       @Override
       public List<ArchivedCareers> getAllArchived(){
            return careerArchiveRepository.findAll(); 
            // return careerArchiveRepository.findAllByOrderByIdDesc(); 
       }

   }






package com.RankwellClient.ServiceImpl;
import org.springframework.stereotype.Service;
import com.RankwellClient.repository.CareersRepository;
import com.RankwellClient.config.StoragePathResolver;
import com.RankwellClient.repository.CareerArchiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.RankwellClient.entity.ArchivedCareers; 
import com.RankwellClient.entity.Careers;
import com.RankwellClient.services.CareerArchiveService;
import java.io.File;


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

   @Override
   public String archiveCareer(Long careerId){ 
       
       Careers career =careersRepository.findById(careerId)
         .orElseThrow(()->new RuntimeException("career not fount by ID"+careerId));
   
     ArchivedCareers archiveCareer=new ArchivedCareers(); 
       
      String basePath = pathResolver.getCareerBasePath();

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

        if (career.getApplyFor() != null) {
            archived.setApplyingFor(
                career.getApplyFor().getApplyingFor()
            );
        }

        careerArchiveRepository.save(archived);
        careersRepository.delete(career);

        return "Archived successfully";
    }

    private String moveFile(String webPath, String basePath, String sourceDir, String targetDir) {

    if (webPath == null) return null;

    // Extract file name from web path
    String fileName = webPath.replace(sourceDir + "/", "");

    // Source: basePath/Careers/filename
    File source = new File(basePath + "/" + sourceDir, fileName);

    // Target folder: basePath/Careers/Archived
    File targetFolder = new File(basePath + "/" + sourceDir + "/" + targetDir);

    if (!targetFolder.exists()) {
        targetFolder.mkdirs();
    }

    // Target file: basePath/Careers/Archived/filename
    File target = new File(targetFolder, fileName);

    if (source.exists()) {
        source.renameTo(target); // move file
    }

    // Return new web path
    return sourceDir + "/" + targetDir + "/" + fileName;
}

}






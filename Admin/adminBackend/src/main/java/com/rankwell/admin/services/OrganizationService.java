package com.rankwell.admin.services; 

import java.io.IOException; 
import java.util.List; 

import org.springframework.web.multipart.MultipartFile;
import com.rankwell.admin.dto.OrganizationDetailDto;
import com.rankwell.admin.entity.OrganizationDetail; 
import com.rankwell.admin.entity.HomeVideo;
import com.rankwell.admin.entity.AboutImageTemplate;
import com.rankwell.admin.entity.HomeImage;
import com.rankwell.admin.dto.HeadingRequest;
import com.rankwell.admin.entity.OrgHome;
//import com.rankwell.admin.dto.CourseMetaDto;
//import com.rankwell.admin.entity.CourseDepartmentType;
import com.rankwell.admin.dto.TermsAndConditionsDto;




public interface OrganizationService {

   String saveHomePageTemplateVideo(MultipartFile video) throws IOException; 
   String saveHomePageTemplateImage(MultipartFile image) throws IOException;
   public List<HomeImage> getAllHomePageTemplateImages();
    public void deleteHomePageVideo(Long videoId);
    public List<HomeVideo> getAllHomePageVideos();
    public String addNotesDeptType( String departmentType);
//    public CourseDepartmentType addCourseDeptType(CourseMetaDto dto);
      
    public String saveAboutUsImage(MultipartFile file) throws IOException;
    public List<AboutImageTemplate> getAllAboutUsImages();
    public void deleteAboutUsImage(Long id); 
    public void deleteHomePageTemplateImage(Long id);
//    public String updateCourse(Long courseId,String  title, String description, MultipartFile video)throws IOException; 
//     public String addHeading( HeadingRequest request);
    public String addUpdateHeading(HeadingRequest request);
    public String addDepartmentType( String departmentType);
    public List<OrgHome> getAllOrgHomes();
//    public CourseMetaDto getCourseDeptTypeById(Long id);
//     public List<CourseMetaDto> getAllCourseDeptType();
         public void deleteCourseDeptType(Long id);
    public String addTermsAndConditions( TermsAndConditionsDto termsAndConditionsDto);


    OrganizationDetailDto getOrganizationDetails();

     public OrganizationDetail saveOrganization(
            OrganizationDetailDto dto,
            List<MultipartFile> courseVideos,
             MultipartFile bannerVideo,
             MultipartFile logo,
             MultipartFile wallpaper,
             MultipartFile directorImage,
             List<MultipartFile> achievementImages,
             List<MultipartFile> galleryImages) throws IOException; 

      public OrganizationDetail updateOrganizationDetails(
            Long id,
            OrganizationDetailDto dto,
            List<MultipartFile> courseVideos,
            MultipartFile bannerVideo,
            MultipartFile logo,
            MultipartFile wallpaper,
            MultipartFile directorImage,
            List<MultipartFile> achievementImages,
            List<MultipartFile> galleryImages) throws IOException; 

             //====Home========//
             public String updateRowStatus(String courseType, Boolean status);

            // ===== GALLERY OPERATIONS =====
                  void addGalleryImage(Long orgId, MultipartFile image) throws IOException;
                  void deleteGalleryImage(Long orgId, String imagePath);

                  // ===== ACHIEVEMENT OPERATIONS =====
                  void addAchievementImage(Long orgId, MultipartFile image) throws IOException;
                  void deleteAchievementImage(Long orgId, String imagePath);
                  // ===== COURSE OPERATIONS =====
                        void addCourse(Long orgId, String title, String description, MultipartFile video) throws IOException;
                        void deleteCourse(Long orgId, Long courseId);
     }


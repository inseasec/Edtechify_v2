package com.rankwell.admin.serviceImpl;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.nio.file.StandardCopyOption;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.rankwell.admin.dto.OrganizationDetailDto;
import com.rankwell.admin.entity.OrgAboutUs;   
import com.rankwell.admin.entity.OrgAchievement;
import com.rankwell.admin.entity.OrgDirectorDetail;
import com.rankwell.admin.entity.OrgGallery;
import com.rankwell.admin.entity.OrganizationDetail;
import com.rankwell.admin.repository.OrganizationRepository;
import com.rankwell.admin.services.FileStorageService;
import com.rankwell.admin.services.OrganizationService;
import com.rankwell.admin.config.StoragePathResolver;
import com.rankwell.admin.storage.Module;
import com.rankwell.admin.storage.MediaType;
import com.rankwell.admin.entity.OrgHome;
//import com.rankwell.admin.entity.OrgCourse;
import com.rankwell.admin.entity.OrgHome;
//import com.rankwell.admin.entity.OrgCourse;
import com.rankwell.admin.repository.HomeRepository;
import java.util.Arrays;
import com.rankwell.admin.entity.HomeVideo;
import com.rankwell.admin.repository.VideoTemplateRepository;
import org.springframework.transaction.annotation.Transactional;
import com.rankwell.admin.repository.AboutusRepository;
import com.rankwell.admin.entity.AboutImageTemplate;
import com.rankwell.admin.repository.AboutImageRepository;
//import com.rankwell.admin.repository.OrgCourseRepository;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.rankwell.admin.entity.HomeImage;
import com.rankwell.admin.repository.HomeImageRepository;
import com.rankwell.admin.dto.HeadingRequest;
//import com.rankwell.admin.repository.CourseDeptRepository;
//import com.rankwell.admin.entity.CourseDepartmentType;
//import com.rankwell.admin.dto.CourseMetaDto;
import com.rankwell.admin.dto.TermsAndConditionsDto;

 
@Service
public class OrganizationServiceImpl implements OrganizationService {

	@Autowired
	private ModelMapper modelMapper;

    @Autowired
    private HomeImageRepository homeImageRepository;

    @Autowired
    private HomeRepository homeRepository;

    @Autowired
     private VideoTemplateRepository videoTemplateRepository;

    @Autowired
     private AboutusRepository aboutUsRepository; 

//    @Autowired
//     OrgCourseRepository courseRepository;

    @Autowired
     private AboutImageRepository aboutImageRepository;
     
//    @Autowired
//    private CourseDeptRepository courseDeptRepository;

    private final OrganizationRepository organizationRepository;

    private final StoragePathResolver pathResolver;



    private static final String ORG_DATA_DIR = "OrgData";

    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                         StoragePathResolver pathResolver){
        this.organizationRepository = organizationRepository; 
        this.pathResolver = pathResolver;
    }

@Override
public OrganizationDetail saveOrganization(OrganizationDetailDto dto, List<MultipartFile> courseVideos,MultipartFile bannerVideo,MultipartFile logo,
                                                MultipartFile wallpaper, MultipartFile directorImage,
                                                List<MultipartFile> achievementImages,
                                                List<MultipartFile> galleryImages) throws IOException{ 

      OrganizationDetail org = new OrganizationDetail();
      org.setOrgName(dto.getOrgName()); 
      org.setOrgAddress(dto.getOrgAddress()); 
      org.setOrgPhone(dto.getOrgPhone());
      org.setOrgEmail(dto.getOrgEmail()); 

  if (logo != null && !logo.isEmpty()) {
    // Delete old logo
     if (org.getOrgLogo() != null){
           deleteFile(org.getOrgLogo());
         }
      // Save new logo
     String newLogo = saveFile(logo, Module.HOME_PAGE, MediaType.IMAGE,"logo",1);
              org.setOrgLogo(newLogo);
   }

     //========= HOME PAGE ========//
    if (dto.getOrgHome() != null) {
         OrgHome home = new OrgHome();

    //    if (bannerVideo != null && !bannerVideo.isEmpty()){
    //        String contentType = bannerVideo.getContentType();
    //        MediaType mediaType;
    //        String prefix;

    //        if(contentType != null && contentType.startsWith("video")){ 
    //           mediaType = MediaType.ANIMATION;
    //           prefix = "Homepage_Banner_Video";
    //         }
    //        else if(contentType != null && contentType.startsWith("image")){
    //           mediaType = MediaType.IMAGE;
    //           prefix = "HomePage_Banner_Image";
    //         }
    //         else {
    //           throw new RuntimeException("Only image or video allowed for banner");
    //         }

               
           //====== HOME PAGE ======//

            // if (dto.getOrgHome() != null) {

            //    OrgHome home = new OrgHome();

           //====== Banner Video ======//
      

      if (bannerVideo != null && !bannerVideo.isEmpty()) {

         String contentType = bannerVideo.getContentType();
         MediaType mediaType;
         String prefix;

       if (contentType != null && contentType.startsWith("video")) {

          mediaType = MediaType.ANIMATION;
          prefix = "Homepage_Banner_Video";

        } else if (contentType != null && contentType.startsWith("image")) {

            mediaType = MediaType.IMAGE;
            prefix = "HomePage_Banner_Image";
        } else {
           throw new RuntimeException("Only image or video allowed for banner");
         }

           String newBanner = saveFile(bannerVideo,Module.HOME_PAGE,mediaType, prefix, 1);
           home.setBannerVideo(newBanner);
        }

         home.setOrganization(org);
         org.setOrgHome(home);

            // ====== COURSES ======//
//           if (dto.getOrgHome().getCourses() != null && !dto.getOrgHome().getCourses().isEmpty()){
//
//             home.setCourses(new ArrayList<>());
//             List<OrgCourse> courseDtos = dto.getOrgHome().getCourses();
//
//             for (int i = 0; i < courseDtos.size(); i++){
//                OrgCourse courseDto = courseDtos.get(i);
//                OrgCourse course = new OrgCourse();
//                course.setTitle(courseDto.getTitle());
//                course.setDescription(courseDto.getDescription());
//
//                 // Each course gets its own video
//               if (courseVideos != null && courseVideos.size() > i){
//                   MultipartFile video = courseVideos.get(i);
//                  if (video != null && !video.isEmpty()){
//                      course.setVideoPath(saveFile(video, Module.HOME_PAGE, MediaType.ANIMATION,"Trending_Course_Image", i + 1));
//                      }
//                  }
//                course.setHome(home);
//                home.getCourses().add(course);
//              } 
//            }
        }

             // ABOUT US
              if (dto.getOrgAboutUs() != null){
                OrgAboutUs about = new OrgAboutUs();
                  about.setMission(dto.getOrgAboutUs().getMission());
                  about.setVision(dto.getOrgAboutUs().getVision());
                  about.setOrgValues(dto.getOrgAboutUs().getOrgValues());

               if (wallpaper != null && !wallpaper.isEmpty()){
                    about.setAboutWallpaper(
                      saveFile(wallpaper, Module.ABOUT_US, MediaType.IMAGE,"About_Wallpaper", 1));
                   }
                  about.setOrganization(org);
                  org.setOrgAboutUs(about);
                }

            // DIRECTOR
             if (dto.getOrgDirectorDetail() != null) {
                OrgDirectorDetail director = new OrgDirectorDetail();
                 director.setDirectorName(dto.getOrgDirectorDetail().getDirectorName());
                 director.setRole(dto.getOrgDirectorDetail().getRole());
                 director.setAboutDirector(dto.getOrgDirectorDetail().getAboutDirector());

             if (directorImage != null && !directorImage.isEmpty()){
                 director.setDirectorImage(
                    saveFile(directorImage, Module.ABOUT_US, MediaType.IMAGE,"Director_Image", 1));
                 }
               director.setOrganization(org);
               org.setOrgDirectorDetail(director);
           }

           // ACHIEVEMENTS
          if (dto.getOrgAchievement() != null) {
            OrgAchievement achievement = new OrgAchievement();
            achievement.setAchivementTitle(dto.getOrgAchievement().getAchivementTitle());
            achievement.setAchivementImages(
                    saveMultiple(achievementImages, Module.ABOUT_US, MediaType.IMAGE,"Achievement_Image"));
            achievement.setOrganization(org);
            org.setOrgAchievement(achievement);
          }

          // GALLERY
          if (dto.getOrgGallery() != null) {
              OrgGallery gallery = new OrgGallery();
              gallery.setGalleryTitle(dto.getOrgGallery().getGalleryTitle());
              gallery.setGalleryImages(saveMultiple(galleryImages, Module.GALLERY, MediaType.IMAGE,"Gallery_Image"));
              gallery.setOrganization(org);
              org.setOrgGallery(gallery);
          }
         return organizationRepository.save(org); 
    }

  @Override
  public OrganizationDetail updateOrganizationDetails( Long id, OrganizationDetailDto dto, List<MultipartFile> courseVideos, MultipartFile bannerVideo,
                                                         MultipartFile logo, MultipartFile wallpaper, MultipartFile directorImage,
                                                         List<MultipartFile> achievementImages,
                                                         List<MultipartFile> galleryImages) throws IOException{

        OrganizationDetail org = organizationRepository.findById(id)
             .orElseThrow(() -> new RuntimeException("Organization not found"));

          //========== BASIC DETAILS ===//
          org.setOrgName(dto.getOrgName());
          org.setOrgAddress(dto.getOrgAddress());
          org.setOrgPhone(dto.getOrgPhone());
          org.setOrgEmail(dto.getOrgEmail());

          //============= LOGO ========//
           if (logo != null && !logo.isEmpty()){

              // Delete old logo
             if (org.getOrgLogo() != null){
                    deleteFile(org.getOrgLogo());
                  }
               // Save new logo
                String newLogo = saveFile(logo, Module.HOME_PAGE, MediaType.IMAGE,"logo",1);
                org.setOrgLogo(newLogo);
                }
             //========== HOME PAGE =======//
             if (dto.getOrgHome() != null) {
              OrgHome home = org.getOrgHome();
                if (home == null) {
                home = new OrgHome();
                home.setOrganization(org);
                org.setOrgHome(home);
              }
         
       // Banner Media Update (Image or Video) //
        if (bannerVideo != null && !bannerVideo.isEmpty()) {

          // Delete old banner (since this is update)
           if (home.getBannerVideo() != null) {
              deleteFile(home.getBannerVideo());
            }

           String contentType = bannerVideo.getContentType();
           MediaType mediaType;
           String prefix;

          if(contentType != null && contentType.startsWith("video")) {

           mediaType = MediaType.ANIMATION;
           prefix = "Homepage_Banner_Video";

          } else if (contentType != null && contentType.startsWith("image")) {

          mediaType = MediaType.IMAGE;
          prefix = "HomePage_Banner_Image";

        } else {
            throw new RuntimeException("Only image or video allowed for banner");
           }

    String newBanner = saveFile( bannerVideo, Module.HOME_PAGE, mediaType, prefix, 1);
        home.setBannerVideo(newBanner);
    }
   
     // ========== COURSES UPDATE =========//

//   if (dto.getOrgHome().getCourses() != null) {
//
//      if (home.getCourses() == null) {
//          home.setCourses(new ArrayList<>());
//      }
//
//     List<OrgCourse> courseDtoList = dto.getOrgHome().getCourses();
//     List<OrgCourse> oldCourses = new ArrayList<>(home.getCourses());
//
//    home.getCourses().clear();

//    for (int i = 0; i < courseDtoList.size(); i++) {
//
//        OrgCourse courseDto = courseDtoList.get(i);
//        OrgCourse newCourse = new OrgCourse();
//
//        newCourse.setTitle(courseDto.getTitle());
//        newCourse.setDescription(courseDto.getDescription());
//
//        //  CASE 1: New video uploaded
//     if (courseVideos != null && courseVideos.size() > i) {
//
//              MultipartFile videoFile = courseVideos.get(i);
//
//              if (videoFile != null && !videoFile.isEmpty()) {
//               // delete old video
//                 if (oldCourses.size() > i && oldCourses.get(i).getVideoPath() != null){
//                    deleteFile(oldCourses.get(i).getVideoPath());
//                   }
//               String newVideo = saveFile(videoFile,Module.HOME_PAGE,MediaType.ANIMATION,"Trending_Course_Video",i+1);
//                              newCourse.setVideoPath(newVideo);
//             }
//         }
//        // CASE 2: No new video → keep old one
//      else if (oldCourses.size() > i) {
//            newCourse.setVideoPath(oldCourses.get(i).getVideoPath());
//          }
//          newCourse.setHome(home);
//          home.getCourses().add(newCourse);
//         }
//      }
 }
       //=======   ABOUT US ========//
        if (dto.getOrgAboutUs() != null) {

        OrgAboutUs about = org.getOrgAboutUs();
 
          if (about == null){
             about = new OrgAboutUs();
             about.setOrganization(org);
             org.setOrgAboutUs(about);
          }

         about.setMission(dto.getOrgAboutUs().getMission());
         about.setVision(dto.getOrgAboutUs().getVision());
         about.setOrgValues(dto.getOrgAboutUs().getOrgValues());

         if (wallpaper != null && !wallpaper.isEmpty()) {

         if (about.getAboutWallpaper() != null) {
          deleteFile(about.getAboutWallpaper());
        }

         String newWallpaper = saveFile(wallpaper, Module.ABOUT_US, MediaType.IMAGE,"About_Wallpaper", 1);
        about.setAboutWallpaper(newWallpaper);
     }
}

    // ============ DIRECTOR ============//
      
  if (dto.getOrgDirectorDetail() != null) {

    OrgDirectorDetail director = org.getOrgDirectorDetail();

    // If director not exists, create new //
    if (director == null){
        director = new OrgDirectorDetail();
        director.setOrganization(org);
        org.setOrgDirectorDetail(director);
      }

    // Update text fields //
    director.setDirectorName(dto.getOrgDirectorDetail().getDirectorName());
    director.setRole(dto.getOrgDirectorDetail().getRole());
    director.setAboutDirector(dto.getOrgDirectorDetail().getAboutDirector());

    //  IMAGE UPDATE LOGIC //
    if (directorImage != null && !directorImage.isEmpty()) {

        // Delete old image from file server
        if (director.getDirectorImage() != null) {
            deleteFile(director.getDirectorImage());
          }

        //  Save new image
          String newImagePath = saveFile(directorImage, Module.ABOUT_US, MediaType.IMAGE,"Director_Image", 1);

        //  Update DB path
        director.setDirectorImage(newImagePath);
    }
}
                                 
    //========= ACHIEVEMENTS ==========//
    if (dto.getOrgAchievement() != null) {
        OrgAchievement achievement = org.getOrgAchievement();

        if (achievement == null) {
            achievement = new OrgAchievement();
            achievement.setOrganization(org);
            org.setOrgAchievement(achievement);
           }
        achievement.setAchivementTitle(dto.getOrgAchievement().getAchivementTitle());
        if (achievementImages != null && !achievementImages.isEmpty()) {
            // Delete old images
            if (achievement.getAchivementImages() != null) {
               for (String oldPath : achievement.getAchivementImages()){
                deleteFile(oldPath);
               }
            }
         // Save new images
         List<String> newPaths = saveMultiple(
            achievementImages, Module.ABOUT_US, MediaType.IMAGE,"Achievement_Image");
             achievement.setAchivementImages(newPaths);
            }
        }

    // ========= GALLERY =========//
    if (dto.getOrgGallery() != null) {

        OrgGallery gallery = org.getOrgGallery();

        if (gallery == null){
            gallery = new OrgGallery();
            gallery.setOrganization(org);
            org.setOrgGallery(gallery);
           }

        gallery.setGalleryTitle(dto.getOrgGallery().getGalleryTitle());

            if (galleryImages != null && !galleryImages.isEmpty()) {

                 // Delete old gallery images
                  if (gallery.getGalleryImages() != null) {
                      for (String oldPath : gallery.getGalleryImages()){
                          deleteFile(oldPath);
                       }
                     }
                        // Save new gallery images
                        List<String> newPaths = saveMultiple(
                            galleryImages, Module.GALLERY, MediaType.IMAGE,"Gallery_Image");
                            gallery.setGalleryImages(newPaths);
                      }
                   }
                     return organizationRepository.save(org);
                }

	@Override
    public OrganizationDetailDto getOrganizationDetails(){
         OrganizationDetail organization = organizationRepository
                                        .findFirstByOrderByIdAsc()
                                        .orElseThrow(() -> new RuntimeException("No organization details found!"));
                return modelMapper.map(organization, OrganizationDetailDto.class);
           }

 public void addGalleryImage(Long orgId, MultipartFile image) throws IOException {

                OrganizationDetail org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                OrgGallery gallery = org.getOrgGallery(); 

                if(gallery == null){
                    gallery = new OrgGallery();
                    gallery.setOrganization(org);
                    gallery.setGalleryImages(new ArrayList<>());
                    org.setOrgGallery(gallery);
                 }

                if(gallery.getGalleryImages() == null) {
                    gallery.setGalleryImages(new ArrayList<>());
                  }
            int nextSerial = 1;

                    if (gallery.getGalleryImages() != null && !gallery.getGalleryImages().isEmpty()){

                        nextSerial = gallery.getGalleryImages().stream()
                                .map(path -> {
                                    try {
                                        String fileName = new File(path).getName();
                                        String number = fileName.replaceAll("[^0-9]","");
                                        return Integer.parseInt(number);
                                    } catch (Exception e){
                                        return 0;
                                      }
                                  })
                                .max(Integer::compareTo)
                                .orElse(0) + 1;
                         }

                    String path = saveFile( image, Module.GALLERY, MediaType.IMAGE, "Gallery_Image", nextSerial);
                                 gallery.getGalleryImages().add(path);
                                 organizationRepository.save(org);
              }



  public void deleteGalleryImage(Long orgId, String imagePath) {

            OrganizationDetail org = organizationRepository.findById(orgId)
                    .orElseThrow(() -> new RuntimeException("Organization not found"));

            OrgGallery gallery = org.getOrgGallery();

            if (gallery == null || gallery.getGalleryImages() == null) return;

            // Delete from file system
            deleteFile(imagePath);

            // Remove from DB list
            gallery.getGalleryImages().remove(imagePath);
            organizationRepository.save(org);
        }

 public void addAchievementImage(Long orgId, MultipartFile image) throws IOException{

                OrganizationDetail org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                OrgAchievement achievement = org.getOrgAchievement();

                if (achievement == null) {
                    achievement = new OrgAchievement();
                    achievement.setOrganization(org);
                    achievement.setAchivementImages(new ArrayList<>());
                    org.setOrgAchievement(achievement);
                }

                if (achievement.getAchivementImages() == null) {
                    achievement.setAchivementImages(new ArrayList<>());
                }

                int nextSerial = 1;
                if (achievement.getAchivementImages() != null && !achievement.getAchivementImages().isEmpty()){
                    nextSerial = achievement.getAchivementImages().stream()
                            .map(path -> {
                                try {
                                    String fileName = new File(path).getName();
                                    String number = fileName.replaceAll("[^0-9]", "");
                                    return Integer.parseInt(number);
                                } catch (Exception e) {
                                    return 0;
                                }
                            })
                            .max(Integer::compareTo)
                            .orElse(0) + 1;
                          }

                String path = saveFile(image,Module.ABOUT_US,MediaType.IMAGE,"Achievement_Image", nextSerial );
                achievement.getAchivementImages().add(path);
                organizationRepository.save(org);
            }



            public void deleteAchievementImage(Long orgId, String imagePath) {

                OrganizationDetail org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                OrgAchievement achievement = org.getOrgAchievement();

                if (achievement == null || achievement.getAchivementImages() == null) return;

                deleteFile(imagePath);
               achievement.getAchivementImages().remove(imagePath);
               organizationRepository.save(org);
            }

           @Override
            public void addCourse(Long orgId, String title, String description, MultipartFile video) throws IOException{

                OrganizationDetail org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                OrgHome home = org.getOrgHome();

                if (home == null) {
                    home = new OrgHome();
                    home.setOrganization(org);
//                    home.setCourses(new ArrayList<>());
                    org.setOrgHome(home);
                  }

//                if (home.getCourses() == null){
//                    home.setCourses(new ArrayList<>());
//                 }
//
//                OrgCourse course = new OrgCourse();
//                course.setTitle(title);
//                course.setDescription(description);

                if (video != null && !video.isEmpty()) {

//                    int nextSerial = home.getCourses().size() + 1;
//                   String videoPath = saveFile( video, Module.HOME_PAGE, MediaType.ANIMATION, "Trending_Course_Video",nextSerial);
//                   course.setVideoPath(videoPath);
                }
//                course.setHome(home);
//                home.getCourses().add(course);
                organizationRepository.save(org);
           }


            @Override
            public void deleteCourse(Long orgId, Long courseId) {

                OrganizationDetail org = organizationRepository.findById(orgId)
                        .orElseThrow(() -> new RuntimeException("Organization not found"));

                OrgHome home = org.getOrgHome();

//                if (home == null || home.getCourses() == null) return;
//
//                OrgCourse course = home.getCourses()
//                                   .stream()
//                                   .filter(c -> c.getId().equals(courseId))
//                                   .findFirst()
//                                   .orElseThrow(() -> new RuntimeException("Course not found"));

                // Delete video file
//                if (course.getVideoPath() != null) {
//                    deleteFile(course.getVideoPath());
//                  }
//
//                home.getCourses().remove(course);
                organizationRepository.save(org);
            }


     private String saveFile(MultipartFile file, Module module, MediaType type, String baseName,
                              int serialNumber) throws IOException {

            if (file == null || file.isEmpty()) return null;

            String basePath = pathResolver.getBasePath();
            String relativePath = ORG_DATA_DIR + "/" + module.getFolder() + "/" + type.getFolder(); 

            File dir = new File(basePath, relativePath);
            if (!dir.exists()) dir.mkdirs();

            // Get extension safely
            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // Clean base name
            baseName = baseName.replaceAll("\\s+", "_")
                            .replaceAll("[^a-zA-Z0-9_-]", "");

            String filename = baseName + "_" + serialNumber + extension;

            File destination = new File(dir, filename);
            file.transferTo(destination);
            return relativePath + "/" + filename;
       }


private List<String> saveMultiple(List<MultipartFile> files, Module module,MediaType type,
                                  String baseName) throws IOException {

    List<String> paths = new ArrayList<>();
    if (files == null) return paths;

    for (int i = 0; i < files.size(); i++) {

        String path = saveFile( files.get(i), module, type,baseName, i + 1);
        if (path != null) paths.add(path);
    }

    return paths;
}

private void deleteFile(String relativePath) {

     try {
        if (relativePath == null || relativePath.trim().isEmpty()) return;

        String basePath = pathResolver.getBasePath();
        File file = new File(basePath + "/" + relativePath);
        if (file.exists()){
            file.delete(); 
          }
        }  catch (Exception e) {
          System.err.println("Failed to delete file: " + relativePath);
          e.printStackTrace();
       }
    }

    @Override
    public String updateRowStatus(String courseType,Boolean status){ 
    
      OrgHome home= homeRepository.findFirstByOrderByIdAsc()
                                  .orElseThrow(()-> new RuntimeException("Not Found"));
           switch (courseType){

            case "ALLCOURSE":
             home.setAllCourses(status);
             break;

             case "NOTECOURSE":
              home.setNoteCourse(status);
              break;

             case "COMPLETECOURSE":
             home.setCompleteCourse(status);
               break;
      
             case "VIDEOCOURSE":
             home.setVideoCourse(status);
              break;
             default:
                throw new IllegalArgumentException("Invalid course type: " + courseType);
             }
             homeRepository.save(home);
             return "row Updated";
        }

       @Override
       @Transactional(readOnly = true)
       public List<HomeVideo> getAllHomePageVideos() {
       // Fetch all videos (or you can filter by homepage ID if needed)
       return videoTemplateRepository.findAll();
     }
        
       
//== NEW SEPARATE METHOD FOR TEMPLATE VIDEOS ==//

@Override
@Transactional
public String saveHomePageTemplateVideo(MultipartFile file) throws IOException {

    if (file == null || file.isEmpty()) {
        throw new RuntimeException("Video file is empty");
    }

    // Validate content type
    if (file.getContentType() == null || !file.getContentType().startsWith("video/")) {
        throw new RuntimeException("Only video files are allowed");
    }

    OrgHome home = homeRepository.findFirstByOrderByIdAsc()
            .orElseThrow(() -> new RuntimeException("Home not found"));

    //         //new code //

    //  // Get next number from DB
    // Integer maxSerial = videoTemplateRepository.findMaxSerialNumber();
    // int nextSerial = maxSerial + 1;

    //         //new code //

    String path = saveTemplateFile(file, Module.HOME_PAGE, MediaType.ANIMATION );

    HomeVideo video = new HomeVideo();
    video.setVideoPath(path);
    video.setHome(home);
    // video.setSerialNumber(nextSerial);

    // Ensure list is initialized
    if (home.getVideos() == null) {
        home.setVideos(new ArrayList<>());
    }

    home.getVideos().add(video);

    // If cascade = ALL on videos → just save home
    homeRepository.save(home);
     return path;
}

@Override
@Transactional
public String saveHomePageTemplateImage(MultipartFile image) throws IOException{

     OrgHome home = homeRepository.findFirstByOrderByIdAsc()
            .orElseThrow(() -> new RuntimeException("Home not found"));

    //          // Get next number from DB
    // Integer maxSerial = homeImageRepository.findTopByOrderBySerialNumberDesc();
    // int nextSerial = (lastImage == null) 
    //     ? 1 
    //     : lastImage.getSerialNumber() + 1;
    // int nextSerial = maxSerial + 1;

    //         //new code //
      
      String path = saveTemplateFile(image, Module.HOME_PAGE, MediaType.IMAGE);
        HomeImage images= new HomeImage();
         images.setImagePath(path);
         images.setHome(home);

         if(home.getImages() == null){
             home.setImages(new ArrayList<>());
         }
           home.getImages().add(images);
        homeRepository.save(home);
        return path;
  }

@Override
@Transactional
public String saveAboutUsImage(MultipartFile file) throws IOException {

     if(file == null || file.isEmpty()){
        throw new RuntimeException("Image file is empty");
       }

    // Validate image
    String contentType = file.getContentType();
    if(contentType == null || !contentType.startsWith("image/")){
        throw new RuntimeException("Only image files are allowed");
       }

    // Get parent AboutUs
    OrgAboutUs aboutUs = aboutUsRepository.findFirstByOrderByIdAsc()
            .orElseThrow(() -> new RuntimeException("AboutUs not found"));

    //          // Get next number from DB
    // Integer maxSerial = aboutImageRepository.findMaxSerialNumber();
    // int nextSerial = maxSerial + 1;

    //         //new code //

    // CALL YOUR GENERIC METHOD HERE
    String relativePath = saveTemplateFile(file,Module.ABOUT_US,MediaType.IMAGE);

    // Create child entity
    AboutImageTemplate image = new AboutImageTemplate();
    image.setImagePath(relativePath);

    // Maintain relationship
   List<AboutImageTemplate> images = aboutUs.getImages();

     if (images == null) {
         images = new ArrayList<>();
      }

      images.add(image);

    aboutUs.setImages(images);

    // Cascade save
    aboutUsRepository.save(aboutUs);

    return relativePath;
 }

public String saveTemplateFile(MultipartFile file, Module module, MediaType type) throws IOException {

    if (file == null || file.isEmpty()){
        throw new RuntimeException("File is empty");
      }

    String basePath = pathResolver.getBasePath();

    String templateFolder;
    String filePrefix;

    // =======================
    // HOME PAGE → VIDEO
    // =======================
    if (module == Module.HOME_PAGE) {

        if (type == MediaType.ANIMATION) {

            templateFolder = "HomePage_Template_videos";
            filePrefix = "HomePage_Template_Video_";
          }
        else if(type == MediaType.IMAGE){
            templateFolder = "HomePage_Template_Images";
            filePrefix = "HomePage_Template_Image_";
          }

          else{
              throw new RuntimeException("Unsupported media type for HOME_PAGE");
          }

        }

    // ===============================
    // ABOUT US → BANNER IMAGE
    // ===============================
    else if (module == Module.ABOUT_US) {

        if (type != MediaType.IMAGE) {
            throw new RuntimeException("ABOUT_US supports only IMAGE (banner)");
        }

        templateFolder = "AboutUs_Template_Images";
        filePrefix = "AboutUs_Template_Image_";
    }

    else {
        throw new RuntimeException("Unsupported module for template upload");
    }

    // Your Preferred Relative Path Format
    String relativePath = ORG_DATA_DIR + "/"
            + module.getFolder() + "/"
            + type.getFolder() + "/"
            + templateFolder;

    File dir = new File(basePath, relativePath);

    if (!dir.exists() && !dir.mkdirs()) {
        throw new RuntimeException("Could not create directory: " + dir.getAbsolutePath());
    }

    // Extract extension safely
    String originalName = file.getOriginalFilename();
    String extension = "";

    if (originalName != null && originalName.contains(".")) {
        extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
    }

    // Unique filename
    String fileName = filePrefix + java.util.UUID.randomUUID() + extension;

    File destination = new File(dir, fileName);
    file.transferTo(destination);

    // Return relative path (perfect for DB storage)
    return relativePath + "/" + fileName;
}

   
     
//     @Override
//     @Transactional
//     public String updateCourse(Long courseId,String title,
//                               String description,MultipartFile video) throws IOException{

//      OrgCourse course = courseRepository.findById(courseId)
//            .orElseThrow(() -> new RuntimeException("Course not found"));
//
//      // Update only if not null
//      if (title != null) {
//          course.setTitle(title);
//       }
//
//      if(description != null) {
//        course.setDescription(description);
//       }
//
//
//    if (video != null && !video.isEmpty()) {
//
//        String basePath = pathResolver.getBasePath();
//        String oldRelativePath = course.getVideoPath();
//
//        // Generate new file name FIRST
//        String fileName = "Trending_Course_Video"+ "_" + video.getOriginalFilename();
//
//        // Full old path
//        Path oldFullPath = Paths.get(basePath, oldRelativePath);
//
//        // Get folder (parent directory)
//        Path folderPath = oldFullPath.getParent();
//
//        // Delete old file
//        Files.deleteIfExists(oldFullPath);
//
//        // New file path
//        Path newPath = folderPath.resolve(fileName);
//
//        // Save new file
//        Files.copy(video.getInputStream(),
//                newPath,
//                StandardCopyOption.REPLACE_EXISTING);
//
//        // Update DB path (relative only)
//        String newRelativePath =
//                oldRelativePath.substring(0, oldRelativePath.lastIndexOf("/") + 1)
//                + fileName;
//
//        course.setVideoPath(newRelativePath);
//        // no need to change DB path
//    }
//    
//         courseRepository.save(course);
//         return "course updated";
//  }

        @Override
        @Transactional
        public void deleteHomePageVideo(Long videoId){

              // Fetch video from DB
              HomeVideo video = videoTemplateRepository.findById(videoId)
                              .orElseThrow(() -> new RuntimeException("Video not found with id: " + videoId));

              // Delete file from disk
               String basePath = pathResolver.getBasePath();
               File file = new File(basePath, video.getVideoPath());
             if(file.exists()){
                boolean deleted = file.delete();
             if (!deleted){
                 throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath()); 
               }
             }
                // Delete DB record
              videoTemplateRepository.delete(video);
           }

          @Override
          @Transactional
          public void deleteAboutUsImage(Long id){
               // Fetch image from DB
           AboutImageTemplate image = aboutImageRepository.findById(id)
                                    .orElseThrow(()-> new RuntimeException("Image Not Found by id"+id));
                //delete file form disk
             String basePath = pathResolver.getBasePath();
             File file= new File(basePath, image.getImagePath());
             if(file.exists()){
                boolean deleted=file.delete();
                if(!deleted){
                    throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath()); 
                  }
              }
               // Delete DB record
             aboutImageRepository.delete(image);

          }
          
           @Override
           @Transactional
           public void deleteHomePageTemplateImage(Long id){
                 HomeImage image = homeImageRepository.findById(id)
                                  .orElseThrow(()-> new RuntimeException("Image Not Found by id"+id));
                String basePath = pathResolver.getBasePath();
                File file= new File(basePath , image.getImagePath());
                if(file.exists()){
                    boolean deleted = file.delete();
                    if(!deleted){
                        throw new RuntimeException("Failed to delete file: " + file.getAbsolutePath());
                    }
                }
                homeImageRepository.delete(image);
            }
              public List<AboutImageTemplate> getAllAboutUsImages(){
                  return  aboutImageRepository.findAll();
                } 

        public List<HomeImage> getAllHomePageTemplateImages(){
               return homeImageRepository.findAll();
        }
        


     @Override
     @Transactional
      public String addUpdateHeading(HeadingRequest request){

         OrgHome home= homeRepository.findFirstByOrderByIdAsc()
                                  .orElseThrow(()-> new RuntimeException("Not Found"));

        switch (request.getType()){
            case NOTES:
                home.setNotesHeading(request.getValue());
                break;
            case COMPREHENSIVE:
                home.setComphrensiveHeading(request.getValue());
                break;
            case VIDEO:
                home.setVideoHeading(request.getValue());
                break;
            case COMPLETE:
                home.setCompleteHeading(request.getValue());
                break;
            case TRENDING_COURSE:
                home.setTrendingCourseHeading(request.getValue());
                break;
            default:
                throw new IllegalArgumentException("Invalid heading type");
             }

        homeRepository.save(home);
        return "TopicUpdated SuccessFully";
      }
      
       @Override
       @Transactional
       public String addDepartmentType( String departmentType){
            OrgHome home = homeRepository.findFirstByOrderByIdAsc()
                                  .orElseThrow(()-> new RuntimeException("Not Found"));

              if (home == null) {
                home = new OrgHome();
               }

              home.setDepartmentType(departmentType.replace("\"",""));
              homeRepository.save(home);
              return "department added";
            }


       @Override
       @Transactional
       public String addNotesDeptType( String departmentType){
            OrgHome home = homeRepository.findFirstByOrderByIdAsc()
                                  .orElseThrow(()-> new RuntimeException("Not Found"));

             String deptName= departmentType.replace("\"","");
              if (home == null) {
                home = new OrgHome();
               }

              home.setNotesDepartmentType(deptName);
              homeRepository.save(home);
              return "department added";
            }

        public List<OrgHome> getAllOrgHomes(){
            return homeRepository.findAll();
        }
        
//         @Override
//         @Transactional
//         public CourseDepartmentType addCourseDeptType(CourseMetaDto dto){
//            CourseDepartmentType courseDeptType ;
//            if(dto.getId()!=null){
//                courseDeptType = courseDeptRepository.findById(dto.getId())
//                                 .orElseThrow(() -> new RuntimeException("CourseDeptType not found with id " + dto.getId())); 
//               
//            }else{
//                courseDeptType= new CourseDepartmentType();
//            }
//            courseDeptType.setCourseType(dto.getCourseType());
//            courseDeptType.setDepartmentType(dto.getDepartmentType());
//            courseDeptType.setCourseHeading(dto.getCourseHeading());
//               
//             CourseDepartmentType saved = courseDeptRepository.save(courseDeptType); 
//
//            return saved;
//         }

//         public CourseMetaDto getCourseDeptTypeById(Long id){
//            CourseDepartmentType  courseDept = courseDeptRepository
//                                            .findById(id).orElseThrow(() -> new RuntimeException("CourseDeptType not found with id " + id)); 
//            CourseMetaDto dto = new CourseMetaDto();
//            dto.setCourseType(courseDept.getCourseType());
//            dto.setCourseHeading(courseDept.getCourseHeading());
//            dto.setDepartmentType(courseDept.getDepartmentType());
//            return dto;
//         }
//
//        public List<CourseMetaDto> getAllCourseDeptType() {
//            List<CourseDepartmentType> courseDeptList = courseDeptRepository.findAll();
//            List<CourseMetaDto> metaList = new ArrayList<>();
//            for(CourseDepartmentType courseDept : courseDeptList){
//                CourseMetaDto dto = new CourseMetaDto();
//                 dto.setCourseType(courseDept.getCourseType());
//                 dto.setCourseHeading(courseDept.getCourseHeading());
//                 dto.setDepartmentType(courseDept.getDepartmentType());
//                 dto.setId(courseDept.getId());
//                 metaList.add(dto);
//            }
//           return metaList;
//        }

//        public void deleteCourseDeptType(Long id){
//        CourseDepartmentType courseDeptType = courseDeptRepository.findById(id)
//                                           .orElseThrow(() -> new RuntimeException("CourseDeptType not found with id " + id));
//
//            courseDeptRepository.delete(courseDeptType);
//        }
          
          @Override
          public String addTermsAndConditions( TermsAndConditionsDto termsAndConditionsDto){
                OrgHome home = homeRepository.findFirstByOrderByIdAsc()
                                  .orElseThrow(()-> new RuntimeException("Not Found"));

                home.setTermsAndConditions(termsAndConditionsDto.getTermsAndConditions());
                    homeRepository.save(home);
                    return "terms added";

          }

		  @Override
		  public void deleteCourseDeptType(Long id) {
			// TODO Auto-generated method stub
			
		  }
   }  
package com.rankwell.admin.controllers;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rankwell.admin.dto.OrganizationDetailDto;
import com.rankwell.admin.entity.OrganizationDetail;
import com.rankwell.admin.repository.OrganizationRepository;
import com.rankwell.admin.services.OrganizationService; 
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.rankwell.admin.entity.HomeVideo;
import com.rankwell.admin.entity.AboutImageTemplate;
import com.rankwell.admin.entity.HomeImage;
import com.rankwell.admin.dto.HeadingRequest;
import org.springframework.web.bind.annotation.RequestBody;
import com.rankwell.admin.entity.OrgHome;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.util.*;
import java.util.stream.Collectors;
//import com.rankwell.admin.dto.CourseMetaDto;
import com.rankwell.admin.dto.TermsAndConditionsDto;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {

	@Autowired
	private OrganizationService organizationService;
	
	@Autowired
	private OrganizationRepository organizationRepository;
    
	@Value("${app.commondata.path.img_home}")
	private  String IMAGE_DIR_HOME ;
    
	@Value("${app.commondata.path.img_about}") 
	private String IMAGE_DIR_ABOUT;
    
	@Value("${app.commondata.path.vid_home}")
	private  String VIDEO_DIR_HOME ;


	

	@PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public ResponseEntity<OrganizationDetail> createOrganization(                          
    		@RequestPart("organization") String organizationJson,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile,
            @RequestPart(value = "wallpaper", required = false) MultipartFile wallpaperFile,
            @RequestPart(value = "directorImage", required = false) MultipartFile directorImageFile,
			@RequestPart(value = "courseVideos", required = false) List<MultipartFile> courseVideos,
			@RequestPart(value = "BannerVideo", required = false) MultipartFile bannerVideo,
            @RequestPart(value = "achievementImages", required = false) List<MultipartFile> achievementImages,
            @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) throws IOException {
		//  Manually convert JSON string to DTO
	    ObjectMapper mapper = new ObjectMapper();
	    OrganizationDetailDto organizationDetailDto = mapper.readValue(organizationJson, OrganizationDetailDto.class);

        OrganizationDetail savedOrganization = organizationService.saveOrganization(
                organizationDetailDto,courseVideos,bannerVideo, logoFile, wallpaperFile, directorImageFile, achievementImages, galleryImages);
       return ResponseEntity.status(HttpStatus.CREATED).body(savedOrganization);
    }
	
	
	//FETCH ORGANIZATION- DETAILS
    @GetMapping("/details")
    public ResponseEntity<OrganizationDetailDto> getOrganizationDetails(){
        OrganizationDetailDto organization = organizationService.getOrganizationDetails();   
        return ResponseEntity.ok(organization); 
    }
	
	
	//Add or Update Organization Details (returns OrganizationDetail)
	 @PostMapping(value = "/addUpdateDetails", consumes = {"multipart/form-data"}) 
	 public ResponseEntity<OrganizationDetail> addOrUpdateOrganizationDetails(
	        @RequestPart("organization") String organizationJson,
	        @RequestPart(value = "logo", required = false) MultipartFile logoFile, 
	        @RequestPart(value = "wallpaper", required = false) MultipartFile wallpaperFile,
	        @RequestPart(value = "directorImage", required = false) MultipartFile directorImageFile,
			@RequestPart(value = "courseVideos", required = false) List<MultipartFile> courseVideos,
			@RequestPart(value = "BannerVideo", required = false) MultipartFile bannerVideo,
	        @RequestPart(value = "achievementImages", required = false) List<MultipartFile> achievementImages,
	        @RequestPart(value = "galleryImages", required = false) List<MultipartFile> galleryImages) throws IOException {

	    ObjectMapper mapper = new ObjectMapper();
	    OrganizationDetailDto organizationDetailDto = mapper.readValue(organizationJson, OrganizationDetailDto.class); 

	    //  Check if any organization exists in the database
	    Optional<OrganizationDetail> existingOrg = organizationRepository.findFirstByOrderByIdAsc(); 

	    OrganizationDetail result;

	    if (existingOrg.isEmpty()) {
	        //  No record — create new organization
	        result = organizationService.saveOrganization( 
	               organizationDetailDto,courseVideos,bannerVideo, logoFile, wallpaperFile, directorImageFile, achievementImages, galleryImages);
	        return ResponseEntity.status(HttpStatus.CREATED).body(result);
	    } else {
			//  Record exists — update existing one
			result = organizationService.updateOrganizationDetails(existingOrg.get().getId(), organizationDetailDto,
					courseVideos,bannerVideo,logoFile, wallpaperFile, directorImageFile, achievementImages, galleryImages);
			   return ResponseEntity.ok(result);
	        }
	   }

	  @PostMapping("/homepage/template-video")
      public ResponseEntity<String> uploadTemplateVideo(
                         @RequestParam("video") MultipartFile video) throws IOException{

		 String path = organizationService.saveHomePageTemplateVideo(video);
          return ResponseEntity.ok("Uploaded Successfully:"+path); 
       }

	  @DeleteMapping("/homepage/DeletetempVideo/{id}")
      public ResponseEntity<String> deleteTemplateVideo(@PathVariable("id") Long videoId){
       organizationService.deleteHomePageVideo(videoId);
         return ResponseEntity.ok("Video deleted successfully:"+ videoId);
       }

	//  @GetMapping("/getAll/TemplateVideos")
    //  public ResponseEntity<List<HomeVideo>> getAllTemplateVideos() {
    //   List<HomeVideo> videos = organizationService.getAllHomePageVideos();
    //   return ResponseEntity.ok(videos);
    //  }

	  

    @GetMapping("/getAll/TemplateVideos")
    public List<Map<String, String>> getAllHomeTemplateVideos(){
        File folder = new File(VIDEO_DIR_HOME);
		  if (!folder.exists() || !folder.isDirectory()){
               System.out.println("Invalid directory: " + VIDEO_DIR_HOME);
               return Collections.emptyList();
                 }
        File[] files = folder.listFiles((dir,name) -> {
			String lower=name.toLowerCase();
            return lower.endsWith(".mp4");
		  });

        if (files == null) return Collections.emptyList();

        return  Arrays.stream(files)
                .map(file -> Map.of(
                        "name", file.getName(),
                        "url","/videos/"+ file.getName()
                ))
                .collect(Collectors.toList());
    }

	//  @GetMapping("/getAllHome/template-images")
    //  public ResponseEntity<List<HomeImage>> getAllTemplateImages(){
    //    List<HomeImage> images = organizationService.getAllHomePageTemplateImages();
    //    return ResponseEntity.ok(images);
    //  }
       
	@PostMapping("/homepage/template-image")
    public ResponseEntity<String> uploadTemplateImage(
                 @RequestParam("image") MultipartFile image) throws IOException{
 
     String path = organizationService.saveHomePageTemplateImage(image);
     return ResponseEntity.ok("Image Uploaded Successfully: ");
    }

    // new code //
	@PutMapping("/addUpdateHeading")
    public ResponseEntity<String> addUpdateHeading(@RequestBody HeadingRequest request) {
         organizationService.addUpdateHeading(request);
        return ResponseEntity.ok("Heading updated successfully");
    }

	@PostMapping("/department")
    public ResponseEntity<String> addDepartmentType( @RequestBody String departmentType) {

     organizationService.addDepartmentType(departmentType);
    return ResponseEntity.ok("Department type saved successfully"); 
  }

	@PostMapping("/NotesDepartment")
    public ResponseEntity<String> addNotesDepartmentType( @RequestBody String departmentType) {

     organizationService.addNotesDeptType(departmentType);
    return ResponseEntity.ok("Department type saved successfully"); 
  }


//new code ///
	@GetMapping("/getAllHome/template-image")
    public List<Map<String, String>> getAllHomeTemplateImages() {

        File folder = new File(IMAGE_DIR_HOME); 

            if (!folder.exists() || !folder.isDirectory()) {
               System.out.println("Invalid directory: " + IMAGE_DIR_HOME);
               return Collections.emptyList();
                 }

               File[] files = folder.listFiles((dir, name) -> {
               String lower = name.toLowerCase();
               return lower.endsWith(".jpg")  ||
                      lower.endsWith(".png")  ||
					  lower.endsWith(".webp") ||
					  lower.endsWith(".jfif") ||
                      lower.endsWith(".jpeg");
            });

           if (files == null) return Collections.emptyList();

        return Arrays.stream(files)
                .map(file -> Map.of(
                        "name", file.getName(),
                        "url","/images/"+ file.getName()
                     ))
                .collect(Collectors.toList());
    }




    @PostMapping("/aboutus/TemplateImages")
     public ResponseEntity<String> uploadAboutUsImage( @RequestParam("image") MultipartFile image) throws IOException {
          String path = organizationService.saveAboutUsImage(image);
          return ResponseEntity.ok("Uploaded Successfully:");
        }

	// @GetMapping("/aboutus/template-images")
    // public ResponseEntity<List<AboutImageTemplate>> getAllAboutUsImages() {
    //  List<AboutImageTemplate> images = organizationService.getAllAboutUsImages();
    //  return ResponseEntity.ok(images);
    //   }

	@GetMapping("/aboutus/template-images") 
    public List<Map<String, String>> getAllAboutImages(){

        File folder = new File(IMAGE_DIR_ABOUT);

            if (!folder.exists() || !folder.isDirectory()) {
               System.out.println("Invalid directory: " + IMAGE_DIR_ABOUT);
               return Collections.emptyList();
                 }

               File[] files = folder.listFiles((dir, name) -> {
               String lower = name.toLowerCase();
               return lower.endsWith(".jpg")  ||
                      lower.endsWith(".png")  ||
					  lower.endsWith(".webp") ||
					  lower.endsWith(".jfif") ||
                      lower.endsWith(".jpeg");
               });

           if (files == null) return Collections.emptyList();  

        return Arrays.stream(files)
                .map(file -> Map.of(
                        "name", file.getName(),
                        "url","/images/"+ file.getName()))
                .collect(Collectors.toList());
      }

	@DeleteMapping("delete/aboutustemplate-images/{id}")
	public ResponseEntity<?>deleteAboutUsImage(@PathVariable Long id){
           organizationService.deleteAboutUsImage(id); 
		   return ResponseEntity.ok("File is deleted");
	      }

	@DeleteMapping("/delete/homepage-template-image/{id}")
    public ResponseEntity<?> deleteHomePageTemplateImage(@PathVariable Long id){
      organizationService.deleteHomePageTemplateImage(id);
      return ResponseEntity.ok("Home Page Image deleted successfully");
    }

   @PostMapping(value = "/gallery/add", consumes = {"multipart/form-data"})
	 public ResponseEntity<String> addGalleryImage(@RequestPart("image") MultipartFile image) throws IOException {
                     OrganizationDetail org = organizationRepository
				                            	.findFirstByOrderByIdAsc()
					                            .orElseThrow(() -> new RuntimeException("Organization not found"));
                    organizationService.addGalleryImage(org.getId(), image);
                    return ResponseEntity.ok("Gallery image added successfully");
		           }

    @DeleteMapping("/gallery")
	public ResponseEntity<String> deleteGalleryImage(
				  @RequestParam("imagePath") String imagePath){

			OrganizationDetail org = organizationRepository
					.findFirstByOrderByIdAsc()
					.orElseThrow(() -> new RuntimeException("Organization not found"));

			organizationService.deleteGalleryImage(org.getId(), imagePath);
           return ResponseEntity.ok("Gallery image deleted successfully");
		}


	@PostMapping(value = "/achievement/add", consumes = {"multipart/form-data"})
	public ResponseEntity<String> addAchievementImage(@RequestPart("image") MultipartFile image) throws IOException {
          OrganizationDetail org = organizationRepository
						           .findFirstByOrderByIdAsc()
					  	           .orElseThrow(() -> new RuntimeException("Organization not found"));

				  organizationService.addAchievementImage(org.getId(), image);
                  return ResponseEntity.ok("Achievement image added successfully");
		    	}

	@DeleteMapping("/achievement")
	public ResponseEntity<String> deleteAchievementImage(@RequestParam("imagePath") String imagePath) {

		OrganizationDetail org = organizationRepository
							     .findFirstByOrderByIdAsc()
							     .orElseThrow(() -> new RuntimeException("Organization not found"));

					organizationService.deleteAchievementImage(org.getId(), imagePath);
                    return ResponseEntity.ok("Achievement image deleted successfully");
				  }

	@PostMapping(value = "/course/add", consumes = {"multipart/form-data"})
    public ResponseEntity<String> addCourse(@RequestParam("title") String title,
						                    @RequestParam("description") String description,
						                    @RequestPart(value = "video", required = false) MultipartFile video) throws IOException{

					OrganizationDetail org = organizationRepository
							                 .findFirstByOrderByIdAsc()
							                 .orElseThrow(() -> new RuntimeException("Organization not found")); 

					  organizationService.addCourse(org.getId(), title, description, video);
                      return ResponseEntity.ok("Course added successfully");
				  }


	@PutMapping(value = "/course/update/{courseId}",consumes = {"multipart/form-data"})
    public ResponseEntity<String> updateCourse(
        @PathVariable Long courseId,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "description", required = false) String description,
        @RequestPart(value = "video", required = false) MultipartFile video) throws IOException {

//        organizationService.updateCourse(courseId, title, description, video);
        return ResponseEntity.ok("Course updated successfully");
      }

	@DeleteMapping("/course")
	public ResponseEntity<String> deleteCourse(
				@RequestParam("courseId") Long courseId) {

			OrganizationDetail org = organizationRepository
						        	.findFirstByOrderByIdAsc()
						        	.orElseThrow(() -> new RuntimeException("Organization not found"));

					 organizationService.deleteCourse(org.getId(), courseId);
                     return ResponseEntity.ok("Course deleted successfully");
				}

	@PutMapping("/rowStatus/{courseType}/{status}")
    public ResponseEntity<String> updateRowStatus( @PathVariable String courseType,@PathVariable  Boolean status) { 
            organizationService.updateRowStatus(courseType, status);
                 return ResponseEntity.ok("Status updated successfully");
               } 

	@GetMapping("/getAllOrgHome")
    public ResponseEntity<List<OrgHome>> getAllOrgHome(){  
       List<OrgHome> home = organizationService.getAllOrgHomes();
       return ResponseEntity.ok(home);
     }
      
//    @PostMapping("/addCourseDeptType")
//    public ResponseEntity<?> addMeta(@RequestBody CourseMetaDto dto) {
//     return ResponseEntity.ok(organizationService.addCourseDeptType(dto)); 
//    }
    
//     @GetMapping("/getCourseDeptType/{id}")
//     public ResponseEntity<?> getCourseDeptTypeById(@PathVariable Long id) {
//     return ResponseEntity.ok(organizationService.getCourseDeptTypeById(id));
//    }

//   @GetMapping("/getCourseDeptType")
//   public ResponseEntity<?> getAllCourseDeptType() {
//    return ResponseEntity.ok(organizationService.getAllCourseDeptType());
//   }

    @DeleteMapping("/deleteCourseDeptType/{id}")
    public ResponseEntity<?> deleteCourseDeptType(@PathVariable Long id) {
     organizationService.deleteCourseDeptType(id);
     return ResponseEntity.ok("CourseDeptType deleted successfully");
   }  

   @PostMapping("/addTermsAndConditions")
   public  ResponseEntity<?> addTermsAndConditions(@RequestBody TermsAndConditionsDto termsAndConditionsDto ){
         organizationService.addTermsAndConditions(termsAndConditionsDto);
          return ResponseEntity.ok("terms added successfully");

   }
} 

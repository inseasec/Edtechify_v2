package com.rankwell.admin.serviceImpl;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rankwell.admin.entity.Admins;
import com.rankwell.admin.repository.AdminRepository;

@Component
public class SuperAdmin implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final JavaMailSender mailSender;
    
    @Value("${app.admin.username}")
    private String superAdminUsername;

    @Value("${app.admin.password}")
    private String superAdminPassword;

    @Value("${superadmin.email}")
    private String superAdminEmail;

    @Autowired
    public SuperAdmin(AdminRepository adminRepository,
                      JavaMailSender mailSender,
                      PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
//        this.departmentRepository = departmentRepository;
        this.mailSender = mailSender;
    }

    @Override
    public void run(String... args) {
        Admins superAdmin = adminRepository.findByRole(Admins.Role.SUPER_ADMIN)
                .orElse(new Admins()); // Create new if not exists

        boolean isNew = superAdmin.getId() == null; // check if it's a new record

        // Update username/email and password from properties
        superAdmin.setEmail(superAdminUsername); // username as email
        superAdmin.setPassword(superAdminPassword); // password
        superAdmin.setName("Super Admin");
        superAdmin.setRole(Admins.Role.SUPER_ADMIN);
        superAdmin.setIsActive(true);

        // Attach all departments if new
        if (isNew) {
//            List<Departments> departments = departmentRepository.findAll();
//            if (!departments.isEmpty()) {
//                superAdmin.setDepartments(departments);
//            }
        }

        adminRepository.save(superAdmin);

        if (isNew) {
            System.out.println("Super Admin Created!");
        } else {
            System.out.println("Super Admin Updated with new credentials!");
        }
    }


     public void sendEmailWithPassword(String toEmail, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Welcome to RankWell Admin Panel - Super Admin Access");
        message.setText(
        	    "Hello RankWell Admin,\n\n" +
        	    "Your account for the RankWell Admin Panel has been successfully created.\n\n" +
        	    "Your password: " + password + "\n\n" +
        	    "You can now log in and start managing your account.\n\n" +
        	    "We're excited to have you on board!\n\n" +
        	    "Best regards,\n" +
        	    "RankWell Support Team"
        	);

        message.setFrom("abhishekseasec@gmail.com"); // Your configured 'from' email

        mailSender.send(message);
        System.out.println("Password email sent to " + toEmail);
    }
    
    public void sendEmailWithOIP(String toEmail, String OTP) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Hey Rankwell Admin Use The Below Otp to login");
        message.setText("Your OTP is: " + OTP);
        message.setFrom("abhishekseasec@gmail.com"); // Your configured 'from' email

        mailSender.send(message);
        System.out.println("OTP email sent to " + toEmail);
    }
    
    
    
//  @Override
//  public void run(String... args) {
//      if (!adminRepository.existsByRole(Admins.Role.SUPER_ADMIN)) {
//          List<Departments> departments = departmentRepository.findAll();
//
//          // Generate random password
//          String rawPassword = UUID.randomUUID().toString().substring(0, 8);
//          System.out.println("RAW password before encoding: " + rawPassword);
//
//          Admins superAdmin = new Admins();
////          superAdmin.setEmail("superadmin@gmail.com");
//          superAdmin.setEmail(superAdminUsername); // Set from global-config.properties setting 
////          superAdmin.setEmail(superAdminEmail);
//          superAdmin.setName("Super Admin");
////          superAdmin.setPassword("superadmin");
//          superAdmin.setPassword(superAdminPassword); // Set from global-config.properties setting 
////          superAdmin.setPassword(rawPassword);
//          superAdmin.setRole(Admins.Role.SUPER_ADMIN);
//          superAdmin.setIsActive(true);
//
//          if (!departments.isEmpty()) {
//              superAdmin.setDepartments(departments);
//          }
//
//          adminRepository.save(superAdmin);
//          System.out.println("Super Admin Created!");
//
//          // Send email
////          sendEmailWithPassword(superAdminEmail, rawPassword);
//      } else {
//          System.out.println("Super Admin Already Exists");
//      }
//  }
    
    
}

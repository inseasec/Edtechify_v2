package com.RankwellClient.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Users {
	
	@Id
	@GeneratedValue(strategy =GenerationType.IDENTITY)
	private Long id;
	@Column(unique = true)
	private String email;
	@Column(unique = true,name = "mobile_no")
	private String mobileNo;
	@Column(nullable=false)
	private String password;
	private boolean isPaid;
	@Column(name = "email_verified", nullable = false)
	private boolean emailVerified;
	@Column(name = "mobile_verified", nullable = false)
	private boolean mobileVerified;
	private String userName; 
	private String timeZone;
	private String country;
	private String streetAddress;
	private String city;
	private String state;
	private String postalCode;
	private String userImg;
	private boolean frozen;
	
	 // One user can have many notes
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) 
//    @JsonIgnore
//    private List<VideoNotes> notes;


	public boolean isFrozen(){
		return frozen;
	}
 
	public void setFrozen(boolean frozen){
         this.frozen= frozen;
	}
	
//	public List<VideoNotes> getNotes() {
//		return notes;
//	}
//	public void setNotes(List<VideoNotes> notes) {
//		this.notes = notes;
//	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getMobileNo() {
		return mobileNo;
	}
	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public boolean isPaid() {
		return isPaid;
	}
	public void setPaid(boolean isPaid) {
		this.isPaid = isPaid;
	}
	public boolean isEmailVerified() {
		return emailVerified;
	}
	public void setEmailVerified(boolean emailVerified) {
		this.emailVerified = emailVerified;
	}
	public boolean isMobileVerified() {
		return mobileVerified;
	}
	public void setMobileVerified(boolean mobileVerified) {
		this.mobileVerified = mobileVerified;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getTimeZone() {
		return timeZone;
	}
	public void setTimeZone(String timeZone) {
		this.timeZone = timeZone;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public String getStreetAddress() {
		return streetAddress;
	}
	public void setStreetAddress(String streetAddress) {
		this.streetAddress = streetAddress;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
	public String getPostalCode() {
		return postalCode;
	}
	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}
	public String getUserImg() {
		return userImg;
	}
	public void setUserImg(String userImg) {
		this.userImg = userImg;
	}

	public Users(Long id, String email, String mobileNo, String password, boolean isPaid, String userName,
			String timeZone, String country, String streetAddress, String city, String state, String postalCode,
			String userImg) {
		super();
		this.id = id;
		this.email = email;
		this.mobileNo = mobileNo;
		this.password = password;
		this.isPaid = isPaid;
		this.userName = userName;
		this.timeZone = timeZone;
		this.country = country;
		this.streetAddress = streetAddress;
		this.city = city;
		this.state = state;
		this.postalCode = postalCode;
		this.userImg = userImg;
	}
	public Users() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Users(Long id) {
		super();
		this.id = id;
	}
	
	
}

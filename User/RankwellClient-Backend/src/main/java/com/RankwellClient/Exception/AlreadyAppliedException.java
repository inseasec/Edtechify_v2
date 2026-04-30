package com.RankwellClient.Exception;

import java.time.LocalDateTime;
     
public class AlreadyAppliedException extends RuntimeException{

    private final LocalDateTime appliedOn;

    public AlreadyAppliedException(String message, LocalDateTime appliedOn) {
        super(message);
        this.appliedOn = appliedOn;
    }

    public LocalDateTime getAppliedOn(){
        return appliedOn;
    } 
}

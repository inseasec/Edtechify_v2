package com.rankwell.admin.dto;

import com.rankwell.admin.entity.OrgHome.HeadingType;

public class HeadingRequest {

    private HeadingType type;

    private String value;

    public HeadingType getType() {
        return type;
    }

    public void setType(HeadingType type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
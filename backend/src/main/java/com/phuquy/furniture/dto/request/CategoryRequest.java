package com.phuquy.furniture.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String slug;

    private String description;

    private String imageUrl;

    private Integer displayOrder = 0;
}

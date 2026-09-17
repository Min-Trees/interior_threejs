package com.phuquy.furniture.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String slug;

    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;

    private BigDecimal discountPrice;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private Integer stockQuantity = 0;

    private String material;

    private String dimensions;

    private Double widthCm;

    private Double heightCm;

    private Double depthCm;

    private String model3dUrl;

    private String roomPlacementRole;

    private String color;

    private Double weight;

    private String thumbnail;

    private String images;

    private Boolean isFeatured = false;

    private Boolean isActive = true;
}

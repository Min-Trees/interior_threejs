package com.phuquy.furniture.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Builder.Default
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    /**
     * Chất liệu nội thất: Gỗ sồi, Gỗ óc chó, Da thật Ý, Nỉ Hàn Quốc, Kim loại mạ Titan...
     */
    @Column(length = 150)
    private String material;

    /**
     * Kích thước (Dài x Rộng x Cao): VD "2200 x 900 x 850 mm" hoặc "220 x 90 x 85 cm"
     */
    @Column(length = 100)
    private String dimensions;

    /**
     * Kích thước 3D thực tế tính theo cm phục vụ hệ tọa độ và tỉ lệ trong Three.js
     */
    @Column(name = "width_cm")
    private Double widthCm;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "depth_cm")
    private Double depthCm;

    /**
     * Đường dẫn model 3D glTF/GLB
     */
    @Column(name = "model_3d_url", length = 500)
    private String model3dUrl;

    /**
     * Vai trò sắp đặt trong phòng: SOFA, COFFEE_TABLE, TV_STAND, RUG, BOOKSHELF, BED, DINING_TABLE, FLOOR_LAMP
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "room_placement_role", length = 30)
    private RoomPlacementRole roomPlacementRole;

    /**
     * Màu sắc
     */
    @Column(length = 50)
    private String color;

    /**
     * Trọng lượng tính theo kg
     */
    private Double weight;

    @Column(length = 500)
    private String thumbnail;

    @Column(columnDefinition = "TEXT")
    private String images; // Chuỗi JSON hoặc phân cách bằng dấu phẩy

    @Builder.Default
    private Boolean isFeatured = false;

    @Builder.Default
    private Boolean isActive = true;

    /**
     * Vector embedding dạng chuỗi float array hoặc pgvector string phục vụ RAG
     */
    @Column(columnDefinition = "TEXT")
    private String embedding;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Hàm sinh văn bản tóm tắt nội thất phục vụ sinh embedding & RAG context
     */
    public String toRagContextText() {
        return String.format(
            "ID: %d. Tên sản phẩm: %s. Danh mục: %s. Giá: %s đ. Chất liệu: %s. Kích thước: %s. Màu sắc: %s. Tồn kho: %d. Mô tả: %s",
            id != null ? id : 0,
            name,
            category != null ? category.getName() : "Nội thất",
            discountPrice != null ? discountPrice.toPlainString() : (price != null ? price.toPlainString() : "0"),
            material != null ? material : "Chất liệu cao cấp",
            dimensions != null ? dimensions : "Tiêu chuẩn",
            color != null ? color : "Đa dạng",
            stockQuantity != null ? stockQuantity : 0,
            description != null ? description : ""
        );
    }
}

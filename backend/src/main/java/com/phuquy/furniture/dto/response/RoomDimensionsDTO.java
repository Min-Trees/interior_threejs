package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDimensionsDTO {
    @Builder.Default
    private Double widthM = 4.0;   // Chiều rộng theo trục X (m)

    @Builder.Default
    private Double lengthM = 3.5;  // Chiều dài theo trục Z (m)

    @Builder.Default
    private Double heightM = 2.8;  // Chiều cao trần nhà theo trục Y (m)
}
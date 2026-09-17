package com.phuquy.furniture.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dimensions3D {
    private Double widthM;
    private Double heightM;
    private Double depthM;
}
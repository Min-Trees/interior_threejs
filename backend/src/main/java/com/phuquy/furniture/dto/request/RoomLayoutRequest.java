package com.phuquy.furniture.dto.request;

import com.phuquy.furniture.dto.response.RoomDimensionsDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomLayoutRequest {
    private List<Long> productIds;
    private RoomDimensionsDTO roomDimensions;
    private String roomType; // LIVING_ROOM, BEDROOM, DINING_ROOM
}
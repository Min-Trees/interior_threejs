package com.phuquy.furniture.controller;

import com.phuquy.furniture.dto.request.RoomLayoutRequest;
import com.phuquy.furniture.dto.response.ApiResponse;
import com.phuquy.furniture.dto.response.RoomDimensionsDTO;
import com.phuquy.furniture.dto.response.RoomLayoutResponse;
import com.phuquy.furniture.service.RoomLayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai/room-concept")
@RequiredArgsConstructor
public class RoomConceptController {

    private final RoomLayoutService roomLayoutService;

    @GetMapping
    public ResponseEntity<ApiResponse<RoomLayoutResponse>> getConceptByRoomType(
            @RequestParam(defaultValue = "LIVING_ROOM") String roomType,
            @RequestParam(required = false) Double widthM,
            @RequestParam(required = false) Double lengthM
    ) {
        RoomDimensionsDTO customDims = null;
        if (widthM != null && lengthM != null && widthM > 2.0 && lengthM > 2.0) {
            customDims = RoomDimensionsDTO.builder().widthM(widthM).lengthM(lengthM).heightM(3.0).build();
        }
        RoomLayoutResponse response = roomLayoutService.getConceptByRoomType(roomType, customDims);
        return ResponseEntity.ok(ApiResponse.success("Lấy concept không gian 3D thành công", response));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<RoomLayoutResponse>> getDefaultConcept() {
        RoomLayoutResponse response = roomLayoutService.getDefaultLivingRoomConcept();
        return ResponseEntity.ok(ApiResponse.success("Lấy concept phòng khách 3D thành công", response));
    }

    @PostMapping("/layout")
    public ResponseEntity<ApiResponse<RoomLayoutResponse>> calculateLayout(@RequestBody RoomLayoutRequest request) {
        RoomLayoutResponse response = roomLayoutService.calculateLayout(request);
        return ResponseEntity.ok(ApiResponse.success("Tính toán không gian sắp đặt 3D thành công", response));
    }

    @PostMapping("/refine")
    public ResponseEntity<ApiResponse<RoomLayoutResponse>> refineItem(
            @RequestParam Long oldProductId,
            @RequestParam Long newProductId,
            @RequestParam(defaultValue = "LIVING_ROOM") String roomType,
            @RequestBody(required = false) RoomDimensionsDTO roomDimensions
    ) {
        RoomLayoutResponse response = roomLayoutService.refineConcept(oldProductId, newProductId, roomDimensions, roomType);
        return ResponseEntity.ok(ApiResponse.success("Đổi sản phẩm và cập nhật vị trí 3D thành công", response));
    }
}
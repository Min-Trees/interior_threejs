package com.phuquy.furniture.service;

import com.phuquy.furniture.dto.request.RoomLayoutRequest;
import com.phuquy.furniture.dto.response.*;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.RoomPlacementRole;
import com.phuquy.furniture.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomLayoutService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public RoomLayoutResponse calculateLayout(RoomLayoutRequest request) {
        String roomType = request.getRoomType() != null ? request.getRoomType().toUpperCase() : "LIVING_ROOM";
        RoomDimensionsDTO room = request.getRoomDimensions() != null
                ? request.getRoomDimensions()
                : getDefaultDimensionsForRoom(roomType);

        List<Product> products;
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            products = productRepository.findAllById(request.getProductIds());
        } else {
            products = getConceptProductsForRoom(roomType);
        }

        return generateRoomLayout(products, room, roomType);
    }

    @Transactional(readOnly = true)
    public RoomLayoutResponse getDefaultLivingRoomConcept() {
        return getConceptByRoomType("LIVING_ROOM", null);
    }

    @Transactional(readOnly = true)
    public RoomLayoutResponse getConceptByRoomType(String roomType, RoomDimensionsDTO customDimensions) {
        String type = (roomType != null && !roomType.isBlank()) ? roomType.toUpperCase() : "LIVING_ROOM";
        RoomDimensionsDTO room = customDimensions != null ? customDimensions : getDefaultDimensionsForRoom(type);
        List<Product> products = getConceptProductsForRoom(type);
        return generateRoomLayout(products, room, type);
    }

    @Transactional(readOnly = true)
    public RoomLayoutResponse refineConcept(Long oldProductId, Long newProductId, RoomDimensionsDTO roomDimensions, String roomType) {
        String type = (roomType != null && !roomType.isBlank()) ? roomType.toUpperCase() : "LIVING_ROOM";
        RoomDimensionsDTO room = roomDimensions != null ? roomDimensions : getDefaultDimensionsForRoom(type);
        List<Product> currentProducts = getConceptProductsForRoom(type);

        List<Product> updatedList = new ArrayList<>();
        Product newProduct = productRepository.findById(newProductId).orElse(null);

        for (Product p : currentProducts) {
            if (p.getId().equals(oldProductId)) {
                if (newProduct != null) {
                    updatedList.add(newProduct);
                }
            } else {
                updatedList.add(p);
            }
        }
        if (!updatedList.contains(newProduct) && newProduct != null && !currentProducts.contains(newProduct)) {
            updatedList.add(newProduct);
        }

        return generateRoomLayout(updatedList, room, type);
    }

    public RoomDimensionsDTO getDefaultDimensionsForRoom(String roomType) {
        switch (roomType) {
            case "LUXURY_VILLA":
                return RoomDimensionsDTO.builder().widthM(14.0).lengthM(9.0).heightM(6.8).build();
            case "BEDROOM":
                return RoomDimensionsDTO.builder().widthM(5.6).lengthM(4.8).heightM(3.0).build();
            case "DINING_ROOM":
                return RoomDimensionsDTO.builder().widthM(6.0).lengthM(5.0).heightM(3.0).build();
            case "HOME_OFFICE":
                return RoomDimensionsDTO.builder().widthM(5.2).lengthM(4.4).heightM(3.0).build();
            case "LIVING_ROOM":
            default:
                return RoomDimensionsDTO.builder().widthM(6.0).lengthM(5.2).heightM(3.0).build();
        }
    }

    private List<Product> getConceptProductsForRoom(String roomType) {
        List<Product> list = new ArrayList<>();

        switch (roomType) {
            case "LUXURY_VILLA":
                // 1. Living Zone
                productRepository.findBySlug("sofa-goc-chu-l-da-bo-y-florence").ifPresent(list::add);
                if (list.isEmpty()) productRepository.findBySlug("sofa-bang-vai-ni-bac-au-oslo").ifPresent(list::add);
                productRepository.findBySlug("ban-tra-doi-mat-da-ceramic-venus").ifPresent(list::add);
                productRepository.findBySlug("tham-sofa-scandinavian-nordic").ifPresent(list::add);
                productRepository.findBySlug("ke-tivi-go-oc-cho-sony").ifPresent(list::add);
                productRepository.findBySlug("den-cay-dung-arco-lamp").ifPresent(list::add);
                productRepository.findBySlug("ghe-thu-gian-armchair-barcelona").ifPresent(list::add);
                // 2. Dining Zone
                productRepository.findBySlug("bo-ban-an-go-oc-cho-kem-6-ghe-royal").ifPresent(list::add);
                // 3. Bedroom Zone
                productRepository.findBySlug("giuong-ngu-boc-nem-ni-luxury-grand").ifPresent(list::add);
                productRepository.findBySlug("tu-quan-ao-canh-kinh-cuong-luc-lumina").ifPresent(list::add);
                // 4. Office Zone
                productRepository.findBySlug("ban-lam-viec-nang-ha-dien-tu-smartdesk-pro").ifPresent(list::add);
                productRepository.findBySlug("ghe-cong-thai-hoc-luoi-ergonomic-master").ifPresent(list::add);
                productRepository.findBySlug("ke-sach-trang-tri-khung-thep-loft").ifPresent(list::add);
                break;

            case "BEDROOM":
                // Giường ngủ, Tủ quần áo, Thảm, Đèn cây, Ghế đơn
                productRepository.findBySlug("giuong-ngu-boc-nem-ni-luxury-grand").ifPresent(list::add);
                if (list.isEmpty()) productRepository.findBySlug("giuong-ngu-go-soi-tatami-nhat-ban").ifPresent(list::add);
                productRepository.findBySlug("tu-quan-ao-canh-kinh-cuong-luc-lumina").ifPresent(list::add);
                productRepository.findBySlug("tham-sofa-scandinavian-nordic").ifPresent(list::add);
                productRepository.findBySlug("den-cay-dung-arco-lamp").ifPresent(list::add);
                productRepository.findBySlug("ghe-thu-gian-armchair-barcelona").ifPresent(list::add);
                break;

            case "DINING_ROOM":
                // Bộ bàn ăn 6 ghế, Kệ tivi/tủ decor, Đèn cây, Thảm
                productRepository.findBySlug("bo-ban-an-go-oc-cho-kem-6-ghe-royal").ifPresent(list::add);
                productRepository.findBySlug("ke-tivi-go-oc-cho-sony").ifPresent(list::add);
                productRepository.findBySlug("tham-sofa-scandinavian-nordic").ifPresent(list::add);
                productRepository.findBySlug("den-cay-dung-arco-lamp").ifPresent(list::add);
                break;

            case "HOME_OFFICE":
                // Bàn làm việc thông minh SmartDesk, Ghế công thái học Ergonomic, Kệ sách Loft, Đèn cây, Thảm
                productRepository.findBySlug("ban-lam-viec-nang-ha-dien-tu-smartdesk-pro").ifPresent(list::add);
                productRepository.findBySlug("ghe-cong-thai-hoc-luoi-ergonomic-master").ifPresent(list::add);
                productRepository.findBySlug("ke-sach-trang-tri-khung-thep-loft").ifPresent(list::add);
                productRepository.findBySlug("den-cay-dung-arco-lamp").ifPresent(list::add);
                productRepository.findBySlug("tham-sofa-scandinavian-nordic").ifPresent(list::add);
                break;

            case "LIVING_ROOM":
            default:
                productRepository.findBySlug("sofa-goc-chu-l-da-bo-y-florence").ifPresent(list::add);
                if (list.isEmpty()) productRepository.findBySlug("sofa-bang-vai-ni-bac-au-oslo").ifPresent(list::add);
                productRepository.findBySlug("ban-tra-doi-mat-da-ceramic-venus").ifPresent(list::add);
                productRepository.findBySlug("tham-sofa-scandinavian-nordic").ifPresent(list::add);
                productRepository.findBySlug("ke-tivi-go-oc-cho-sony").ifPresent(list::add);
                productRepository.findBySlug("den-cay-dung-arco-lamp").ifPresent(list::add);
                productRepository.findBySlug("ghe-thu-gian-armchair-barcelona").ifPresent(list::add);
                break;
        }

        if (list.isEmpty()) {
            list = productRepository.findAll().stream().limit(5).collect(Collectors.toList());
        }
        return list;
    }

    private RoomLayoutResponse generateRoomLayout(List<Product> products, RoomDimensionsDTO room, String roomType) {
        double halfW = room.getWidthM() / 2.0;
        double halfL = room.getLengthM() / 2.0;

        List<PlacedItemDTO> placedItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;

        Map<RoomPlacementRole, List<Product>> roleMap = new EnumMap<>(RoomPlacementRole.class);
        for (Product p : products) {
            RoomPlacementRole role = p.getRoomPlacementRole() != null ? p.getRoomPlacementRole() : detectRoleFromProduct(p);
            roleMap.computeIfAbsent(role, k -> new ArrayList<>()).add(p);
        }

        double mainAnchorZ = 0.0;
        double mainAnchorDepth = 0.8;

        if ("BEDROOM".equalsIgnoreCase(roomType)) {
            // 1. Giường ngủ (BED): Đặt giữa phòng, tựa đầu sát tường sau (Z âm)
            if (roleMap.containsKey(RoomPlacementRole.BED)) {
                Product bed = roleMap.get(RoomPlacementRole.BED).get(0);
                Dimensions3D dims = convertDimensions(bed);
                double bedZ = -halfL + (dims.getDepthM() / 2.0) + 0.05;
                mainAnchorZ = bedZ;
                mainAnchorDepth = dims.getDepthM();

                placedItems.add(createPlacedItem(bed, 0.0, 0.0, bedZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(bed));
                totalDiscount = totalDiscount.add(discountOf(bed));
            }

            // 2. Thảm phòng ngủ (RUG): Lót dưới 2/3 thân giường kéo dài về phía chân giường
            if (roleMap.containsKey(RoomPlacementRole.RUG)) {
                Product rug = roleMap.get(RoomPlacementRole.RUG).get(0);
                Dimensions3D dims = convertDimensions(rug);
                double rugZ = mainAnchorZ + (mainAnchorDepth * 0.35);

                placedItems.add(createPlacedItem(rug, 0.0, 0.005, rugZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(rug));
                totalDiscount = totalDiscount.add(discountOf(rug));
            }

            // 3. Tủ quần áo (WARDROBE): Áp sát tường bên phải (X dương)
            if (roleMap.containsKey(RoomPlacementRole.WARDROBE)) {
                Product wardrobe = roleMap.get(RoomPlacementRole.WARDROBE).get(0);
                Dimensions3D dims = convertDimensions(wardrobe);
                double wX = halfW - (dims.getDepthM() / 2.0) - 0.05;
                double wZ = 0.0;

                placedItems.add(createPlacedItem(wardrobe, wX, 0.0, wZ, -Math.PI / 2.0, dims));
                totalPrice = totalPrice.add(priceOf(wardrobe));
                totalDiscount = totalDiscount.add(discountOf(wardrobe));
            }

            // 4. Ghế thư giãn / Đèn ngủ
            if (roleMap.containsKey(RoomPlacementRole.SOFA)) {
                Product chair = roleMap.get(RoomPlacementRole.SOFA).get(0);
                Dimensions3D dims = convertDimensions(chair);
                double cX = -halfW + (dims.getWidthM() / 2.0) + 0.4;
                double cZ = halfL - (dims.getDepthM() / 2.0) - 0.4;

                placedItems.add(createPlacedItem(chair, cX, 0.0, cZ, Math.PI / 4.0, dims));
                totalPrice = totalPrice.add(priceOf(chair));
                totalDiscount = totalDiscount.add(discountOf(chair));
            }

            if (roleMap.containsKey(RoomPlacementRole.FLOOR_LAMP)) {
                Product lamp = roleMap.get(RoomPlacementRole.FLOOR_LAMP).get(0);
                Dimensions3D dims = convertDimensions(lamp);
                double lampX = -halfW + 0.4;
                double lampZ = -halfL + 0.4;

                placedItems.add(createPlacedItem(lamp, lampX, 0.0, lampZ, Math.PI / 4.0, dims));
                totalPrice = totalPrice.add(priceOf(lamp));
                totalDiscount = totalDiscount.add(discountOf(lamp));
            }

        } else if ("HOME_OFFICE".equalsIgnoreCase(roomType)) {
            // 1. Bàn làm việc (DESK): Đặt tựa nhìn ra phòng hoặc sát tường
            double deskZ = -0.3;
            if (roleMap.containsKey(RoomPlacementRole.DESK)) {
                Product desk = roleMap.get(RoomPlacementRole.DESK).get(0);
                Dimensions3D dims = convertDimensions(desk);
                placedItems.add(createPlacedItem(desk, 0.0, 0.0, deskZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(desk));
                totalDiscount = totalDiscount.add(discountOf(desk));
            }

            // 2. Ghế công thái học (OFFICE_CHAIR): Đặt ngay phía sau bàn
            if (roleMap.containsKey(RoomPlacementRole.OFFICE_CHAIR)) {
                Product chair = roleMap.get(RoomPlacementRole.OFFICE_CHAIR).get(0);
                Dimensions3D dims = convertDimensions(chair);
                placedItems.add(createPlacedItem(chair, 0.0, 0.0, deskZ - 0.65, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(chair));
                totalDiscount = totalDiscount.add(discountOf(chair));
            }

            // 3. Kệ sách (BOOKSHELF): Sát tường sau
            if (roleMap.containsKey(RoomPlacementRole.BOOKSHELF)) {
                Product shelf = roleMap.get(RoomPlacementRole.BOOKSHELF).get(0);
                Dimensions3D dims = convertDimensions(shelf);
                double sZ = -halfL + (dims.getDepthM() / 2.0) + 0.05;
                placedItems.add(createPlacedItem(shelf, 0.0, 0.0, sZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(shelf));
                totalDiscount = totalDiscount.add(discountOf(shelf));
            }

            // 4. Thảm văn phòng (RUG)
            if (roleMap.containsKey(RoomPlacementRole.RUG)) {
                Product rug = roleMap.get(RoomPlacementRole.RUG).get(0);
                Dimensions3D dims = convertDimensions(rug);
                placedItems.add(createPlacedItem(rug, 0.0, 0.005, deskZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(rug));
                totalDiscount = totalDiscount.add(discountOf(rug));
            }

            // 5. Đèn đứng (FLOOR_LAMP)
            if (roleMap.containsKey(RoomPlacementRole.FLOOR_LAMP)) {
                Product lamp = roleMap.get(RoomPlacementRole.FLOOR_LAMP).get(0);
                Dimensions3D dims = convertDimensions(lamp);
                placedItems.add(createPlacedItem(lamp, halfW - 0.5, 0.0, deskZ, -Math.PI / 3.0, dims));
                totalPrice = totalPrice.add(priceOf(lamp));
                totalDiscount = totalDiscount.add(discountOf(lamp));
            }

        } else if ("DINING_ROOM".equalsIgnoreCase(roomType)) {
            // 1. Bàn ăn trung tâm (DINING_TABLE)
            if (roleMap.containsKey(RoomPlacementRole.DINING_TABLE)) {
                Product table = roleMap.get(RoomPlacementRole.DINING_TABLE).get(0);
                Dimensions3D dims = convertDimensions(table);
                placedItems.add(createPlacedItem(table, 0.0, 0.0, 0.0, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(table));
                totalDiscount = totalDiscount.add(discountOf(table));
            }

            // 2. Thảm dưới bàn ăn (RUG)
            if (roleMap.containsKey(RoomPlacementRole.RUG)) {
                Product rug = roleMap.get(RoomPlacementRole.RUG).get(0);
                Dimensions3D dims = convertDimensions(rug);
                placedItems.add(createPlacedItem(rug, 0.0, 0.005, 0.0, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(rug));
                totalDiscount = totalDiscount.add(discountOf(rug));
            }

            // 3. Tủ console / Kệ trang trí đặt sát vách tường phải (tránh lối đi vào)
            if (roleMap.containsKey(RoomPlacementRole.TV_STAND)) {
                Product credenza = roleMap.get(RoomPlacementRole.TV_STAND).get(0);
                Dimensions3D dims = convertDimensions(credenza);
                double cX = halfW - (dims.getDepthM() / 2.0) - 0.08;
                placedItems.add(createPlacedItem(credenza, cX, 0.0, 0.0, -Math.PI / 2.0, dims));
                totalPrice = totalPrice.add(priceOf(credenza));
                totalDiscount = totalDiscount.add(discountOf(credenza));
            }

            // 4. Đèn cây (FLOOR_LAMP)
            if (roleMap.containsKey(RoomPlacementRole.FLOOR_LAMP)) {
                Product lamp = roleMap.get(RoomPlacementRole.FLOOR_LAMP).get(0);
                Dimensions3D dims = convertDimensions(lamp);
                placedItems.add(createPlacedItem(lamp, halfW - 0.5, 0.0, -halfL + 0.5, -Math.PI / 4.0, dims));
                totalPrice = totalPrice.add(priceOf(lamp));
                totalDiscount = totalDiscount.add(discountOf(lamp));
            }

        } else if ("LUXURY_VILLA".equalsIgnoreCase(roomType)) {
            // =========================================================================
            // BIỆT THỰ ĐỈNH CAO (14.0m x 9.0m = 126m²): 4 PHÂN KHU LIÊN HOÀN ĐẲNG CẤP
            // =========================================================================

            // --- KHU 1: PHÒNG KHÁCH LỚN (Góc Tây-Bắc: X âm, Z âm) ---
            if (roleMap.containsKey(RoomPlacementRole.SOFA)) {
                List<Product> sofas = roleMap.get(RoomPlacementRole.SOFA);
                Product mainSofa = sofas.get(0);
                Dimensions3D dims = convertDimensions(mainSofa);
                placedItems.add(createPlacedItem(mainSofa, -3.5, 0.0, -2.8, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(mainSofa));
                totalDiscount = totalDiscount.add(discountOf(mainSofa));

                if (sofas.size() > 1) {
                    Product armchair = sofas.get(1);
                    Dimensions3D aDims = convertDimensions(armchair);
                    placedItems.add(createPlacedItem(armchair, -5.4, 0.0, -1.5, Math.PI / 3.0, aDims));
                    totalPrice = totalPrice.add(priceOf(armchair));
                    totalDiscount = totalDiscount.add(discountOf(armchair));
                }
            }

            if (roleMap.containsKey(RoomPlacementRole.COFFEE_TABLE)) {
                Product table = roleMap.get(RoomPlacementRole.COFFEE_TABLE).get(0);
                Dimensions3D dims = convertDimensions(table);
                placedItems.add(createPlacedItem(table, -3.5, 0.0, -1.4, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(table));
                totalDiscount = totalDiscount.add(discountOf(table));
            }

            if (roleMap.containsKey(RoomPlacementRole.RUG)) {
                List<Product> rugs = roleMap.get(RoomPlacementRole.RUG);
                Product rug = rugs.get(0);
                Dimensions3D dims = convertDimensions(rug);
                placedItems.add(createPlacedItem(rug, -3.5, 0.005, -1.4, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(rug));
                totalDiscount = totalDiscount.add(discountOf(rug));
            }

            if (roleMap.containsKey(RoomPlacementRole.TV_STAND)) {
                Product tv = roleMap.get(RoomPlacementRole.TV_STAND).get(0);
                Dimensions3D dims = convertDimensions(tv);
                placedItems.add(createPlacedItem(tv, -3.5, 0.0, -0.15, Math.PI, dims));
                totalPrice = totalPrice.add(priceOf(tv));
                totalDiscount = totalDiscount.add(discountOf(tv));
            }

            if (roleMap.containsKey(RoomPlacementRole.FLOOR_LAMP)) {
                Product lamp = roleMap.get(RoomPlacementRole.FLOOR_LAMP).get(0);
                Dimensions3D dims = convertDimensions(lamp);
                placedItems.add(createPlacedItem(lamp, -1.5, 0.0, -2.8, -Math.PI / 4.0, dims));
                totalPrice = totalPrice.add(priceOf(lamp));
                totalDiscount = totalDiscount.add(discountOf(lamp));
            }

            // --- KHU 2: PHÒNG ĂN & QUẦY BAR BẾP ĐẢO (Góc Tây-Nam: X âm, Z dương) ---
            if (roleMap.containsKey(RoomPlacementRole.DINING_TABLE)) {
                Product dining = roleMap.get(RoomPlacementRole.DINING_TABLE).get(0);
                Dimensions3D dims = convertDimensions(dining);
                placedItems.add(createPlacedItem(dining, -3.5, 0.0, 2.2, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(dining));
                totalDiscount = totalDiscount.add(discountOf(dining));
            }

            // --- KHU 3: PHÒNG NGỦ MASTER SUITE (Tầng 2 - Lầu 1, Cao độ Y = 3.6m) ---
            if (roleMap.containsKey(RoomPlacementRole.BED)) {
                Product bed = roleMap.get(RoomPlacementRole.BED).get(0);
                Dimensions3D dims = convertDimensions(bed);
                placedItems.add(createPlacedItem(bed, 4.0, 3.6, -2.2, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(bed));
                totalDiscount = totalDiscount.add(discountOf(bed));
            }

            if (roleMap.containsKey(RoomPlacementRole.WARDROBE)) {
                Product wardrobe = roleMap.get(RoomPlacementRole.WARDROBE).get(0);
                Dimensions3D dims = convertDimensions(wardrobe);
                placedItems.add(createPlacedItem(wardrobe, 6.2, 3.6, -1.0, -Math.PI / 2.0, dims));
                totalPrice = totalPrice.add(priceOf(wardrobe));
                totalDiscount = totalDiscount.add(discountOf(wardrobe));
            }

            // --- KHU 4: PHÒNG LÀM VIỆC & THƯ VIỆN EXECUTIVE (Tầng 2 - Lầu 1, Cao độ Y = 3.6m) ---
            if (roleMap.containsKey(RoomPlacementRole.DESK)) {
                Product desk = roleMap.get(RoomPlacementRole.DESK).get(0);
                Dimensions3D dims = convertDimensions(desk);
                placedItems.add(createPlacedItem(desk, 4.0, 3.6, 2.5, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(desk));
                totalDiscount = totalDiscount.add(discountOf(desk));
            }

            if (roleMap.containsKey(RoomPlacementRole.OFFICE_CHAIR)) {
                Product chair = roleMap.get(RoomPlacementRole.OFFICE_CHAIR).get(0);
                Dimensions3D dims = convertDimensions(chair);
                placedItems.add(createPlacedItem(chair, 4.0, 3.6, 1.85, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(chair));
                totalDiscount = totalDiscount.add(discountOf(chair));
            }

            if (roleMap.containsKey(RoomPlacementRole.BOOKSHELF)) {
                Product shelf = roleMap.get(RoomPlacementRole.BOOKSHELF).get(0);
                Dimensions3D dims = convertDimensions(shelf);
                placedItems.add(createPlacedItem(shelf, 6.2, 3.6, 2.5, -Math.PI / 2.0, dims));
                totalPrice = totalPrice.add(priceOf(shelf));
                totalDiscount = totalDiscount.add(discountOf(shelf));
            }

        } else {
            // LIVING_ROOM (Mặc định)
            // 1. SOFA
            double sofaZ = -halfL + 0.8;
            double sofaDepthM = 0.9;
            if (roleMap.containsKey(RoomPlacementRole.SOFA)) {
                Product sofa = roleMap.get(RoomPlacementRole.SOFA).get(0);
                Dimensions3D dims = convertDimensions(sofa);
                sofaDepthM = dims.getDepthM();
                sofaZ = -halfL + (sofaDepthM / 2.0) + 0.08;

                placedItems.add(createPlacedItem(sofa, 0.0, 0.0, sofaZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(sofa));
                totalDiscount = totalDiscount.add(discountOf(sofa));
            }

            // 2. BÀN TRÀ
            double tableZ = sofaZ + (sofaDepthM / 2.0) + 0.50 + 0.3;
            if (roleMap.containsKey(RoomPlacementRole.COFFEE_TABLE)) {
                Product table = roleMap.get(RoomPlacementRole.COFFEE_TABLE).get(0);
                Dimensions3D dims = convertDimensions(table);
                tableZ = sofaZ + (sofaDepthM / 2.0) + 0.50 + (dims.getDepthM() / 2.0);

                placedItems.add(createPlacedItem(table, 0.0, 0.0, tableZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(table));
                totalDiscount = totalDiscount.add(discountOf(table));
            }

            // 3. THẢM TRẢI SÀN
            if (roleMap.containsKey(RoomPlacementRole.RUG)) {
                Product rug = roleMap.get(RoomPlacementRole.RUG).get(0);
                Dimensions3D dims = convertDimensions(rug);
                double rugZ = tableZ > -0.5 ? tableZ * 0.7 : tableZ;

                placedItems.add(createPlacedItem(rug, 0.0, 0.005, rugZ, 0.0, dims));
                totalPrice = totalPrice.add(priceOf(rug));
                totalDiscount = totalDiscount.add(discountOf(rug));
            }

            // 4. KỆ TIVI
            if (roleMap.containsKey(RoomPlacementRole.TV_STAND)) {
                Product tv = roleMap.get(RoomPlacementRole.TV_STAND).get(0);
                Dimensions3D dims = convertDimensions(tv);
                double tvZ = halfL - (dims.getDepthM() / 2.0) - 0.06;

                placedItems.add(createPlacedItem(tv, 0.0, 0.0, tvZ, Math.PI, dims));
                totalPrice = totalPrice.add(priceOf(tv));
                totalDiscount = totalDiscount.add(discountOf(tv));
            }

            // 5. ĐÈN CÂY
            if (roleMap.containsKey(RoomPlacementRole.FLOOR_LAMP)) {
                Product lamp = roleMap.get(RoomPlacementRole.FLOOR_LAMP).get(0);
                Dimensions3D dims = convertDimensions(lamp);
                double lampX = halfW - 0.45;
                double lampZ = sofaZ + 0.1;

                placedItems.add(createPlacedItem(lamp, lampX, 0.0, lampZ, -Math.PI / 4.0, dims));
                totalPrice = totalPrice.add(priceOf(lamp));
                totalDiscount = totalDiscount.add(discountOf(lamp));
            }

            // 6. GHẾ BÀNH / TỦ SÁCH
            if (roleMap.get(RoomPlacementRole.SOFA) != null && roleMap.get(RoomPlacementRole.SOFA).size() > 1) {
                Product armchair = roleMap.get(RoomPlacementRole.SOFA).get(1);
                Dimensions3D dims = convertDimensions(armchair);
                double armX = -halfW + (dims.getWidthM() / 2.0) + 0.4;
                double armZ = tableZ;

                placedItems.add(createPlacedItem(armchair, armX, 0.0, armZ, Math.PI / 3.0, dims));
                totalPrice = totalPrice.add(priceOf(armchair));
                totalDiscount = totalDiscount.add(discountOf(armchair));
            } else if (roleMap.containsKey(RoomPlacementRole.BOOKSHELF)) {
                Product shelf = roleMap.get(RoomPlacementRole.BOOKSHELF).get(0);
                Dimensions3D dims = convertDimensions(shelf);
                double shelfX = -halfW + (dims.getDepthM() / 2.0) + 0.06;
                double shelfZ = (tableZ + sofaZ) / 2.0;

                placedItems.add(createPlacedItem(shelf, shelfX, 0.0, shelfZ, Math.PI / 2.0, dims));
                totalPrice = totalPrice.add(priceOf(shelf));
                totalDiscount = totalDiscount.add(discountOf(shelf));
            }
        }

        String advice = buildArchitecturalAdvice(roomType, room);
        String title = buildConceptTitle(roomType);

        return RoomLayoutResponse.builder()
                .conceptTitle(title)
                .roomType(roomType != null ? roomType : "LIVING_ROOM")
                .roomDimensions(room)
                .items(placedItems)
                .totalPrice(totalPrice)
                .totalDiscountPrice(totalDiscount)
                .architecturalAdvice(advice)
                .build();
    }

    private String buildConceptTitle(String roomType) {
        if ("LUXURY_VILLA".equals(roomType)) {
            return "Biệt Thự Đỉnh Cao Phú Quý - Toàn Cảnh Không Gian Sống 126m²";
        }
        switch (roomType) {
            case "BEDROOM":
                return "Không Gian Phòng Ngủ Master Sang Trọng & Thư Thái";
            case "DINING_ROOM":
                return "Không Gian Phòng Ăn Gia Đình Đẳng Cấp & Ấm Cúng";
            case "HOME_OFFICE":
                return "Phòng Làm Việc Công Thái Học Hiện Đại & Tập Trung";
            case "LIVING_ROOM":
            default:
                return "Không Gian Nội Thất Phòng Khách Đẳng Cấp Phú Quý";
        }
    }

    private String buildArchitecturalAdvice(String roomType, RoomDimensionsDTO room) {
        double area = room.getWidthM() * room.getLengthM();
        if ("LUXURY_VILLA".equals(roomType)) {
            return String.format(
                    "Dinh thự 2 tầng thượng lưu (%.1fm x %.1fm, tổng diện tích sàn 252m²): Tầng 1 là đại sảnh và không gian mở liên hoàn gồm Phòng khách lớn và Khu ẩm thực - Đảo Bar, kết nối cầu thang kính lên Tầng 2. Tầng 2 quy hoạch 2 phòng riêng biệt: Phòng ngủ Master Suite thư thái có ban công riêng và Phòng làm việc Executive cách âm yên tĩnh.",
                    room.getWidthM(), room.getLengthM()
            );
        }
        switch (roomType) {
            case "BEDROOM":
                return String.format(
                        "Phòng ngủ Master (%.1fm x %.1fm = %.1fm²): Giường ngủ đặt tựa đầu sát tường tạo cảm giác vững chãi và an tâm cho giấc ngủ sâu. Thảm lông mềm mại kết nối 2/3 thân giường giúp bước chân êm ái khi thức giấc. Tủ quần áo cánh kính LED bố trí sát vách bên tối ưu ánh sáng tự nhiên và mở rộng thị giác.",
                        room.getWidthM(), room.getLengthM(), area
                );
            case "DINING_ROOM":
                return String.format(
                        "Không gian phòng ăn (%.1fm x %.1fm = %.1fm²): Bàn ăn gỗ óc chó 6 ghế đặt tại vị trí trung tâm, cách tường tối thiểu 80cm để gia chủ và khách dễ dàng kéo ghế ra vào. Ánh sáng vàng dịu từ đèn cây và đèn trần tạo không khí sum vầy, kích thích vị giác.",
                        room.getWidthM(), room.getLengthM(), area
                );
            case "HOME_OFFICE":
                return String.format(
                        "Phòng làm việc tại gia (%.1fm x %.1fm = %.1fm²): Bàn nâng hạ SmartDesk kết hợp ghế công thái học Ergonomic đặt vuông góc hướng đón ánh sáng tự nhiên từ cửa sổ, bảo vệ thị lực và cột sống trong nhiều giờ làm việc. Kệ sách cao kịch trần tận dụng tối đa chiều cao không gian.",
                        room.getWidthM(), room.getLengthM(), area
                );
            case "LIVING_ROOM":
            default:
                return String.format(
                        "Không gian phòng khách (%.1fm x %.1fm = %.1fm²): Bộ sofa bọc da bố trí sát tường tạo điểm tựa vững chãi, khoảng cách tới bàn trà 50cm chuẩn công thái học thuận tiện đi lại, thảm trải sàn kết nối thị giác và kệ tivi gỗ tự nhiên đối diện tầm nhìn tối ưu.",
                        room.getWidthM(), room.getLengthM(), area
                );
        }
    }

    private BigDecimal priceOf(Product p) {
        return p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
    }

    private BigDecimal discountOf(Product p) {
        return p.getDiscountPrice() != null ? p.getDiscountPrice() : priceOf(p);
    }

    private Dimensions3D convertDimensions(Product p) {
        double w = p.getWidthCm() != null ? p.getWidthCm() / 100.0 : 1.8;
        double h = p.getHeightCm() != null ? p.getHeightCm() / 100.0 : 0.8;
        double d = p.getDepthCm() != null ? p.getDepthCm() / 100.0 : 0.8;
        return Dimensions3D.builder().widthM(w).heightM(h).depthM(d).build();
    }

    private PlacedItemDTO createPlacedItem(Product p, double x, double y, double z, double rotY, Dimensions3D dims) {
        return PlacedItemDTO.builder()
                .productId(p.getId())
                .name(p.getName())
                .category(p.getCategory() != null ? p.getCategory().getName() : "Nội thất")
                .model3dUrl(p.getModel3dUrl())
                .roomPlacementRole(p.getRoomPlacementRole() != null ? p.getRoomPlacementRole().name() : null)
                .position(Position3D.builder().x(x).y(y).z(z).build())
                .rotationY(rotY)
                .dimensions(dims)
                .color(p.getColor() != null ? p.getColor() : "#a85a28")
                .material(p.getMaterial())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .thumbnail(p.getThumbnail())
                .build();
    }

    private RoomPlacementRole detectRoleFromProduct(Product p) {
        String slug = (p.getSlug() != null ? p.getSlug() : p.getName()).toLowerCase();
        if (slug.contains("tham") || slug.contains("rug")) return RoomPlacementRole.RUG;
        if (slug.contains("smartdesk") || slug.contains("ban-lam-viec")) return RoomPlacementRole.DESK;
        if (slug.contains("ergonomic") || slug.contains("master-chair")) return RoomPlacementRole.OFFICE_CHAIR;
        if (slug.contains("tu-quan-ao")) return RoomPlacementRole.WARDROBE;
        if (slug.contains("giuong") || slug.contains("bed")) return RoomPlacementRole.BED;
        if (slug.contains("ban-an")) return RoomPlacementRole.DINING_TABLE;
        if (slug.contains("ban-tra") || slug.contains("coffee")) return RoomPlacementRole.COFFEE_TABLE;
        if (slug.contains("sofa") || slug.contains("ghe")) return RoomPlacementRole.SOFA;
        if (slug.contains("tivi") || slug.contains("tv")) return RoomPlacementRole.TV_STAND;
        if (slug.contains("den") || slug.contains("lamp")) return RoomPlacementRole.FLOOR_LAMP;
        if (slug.contains("ke-sach") || slug.contains("tu")) return RoomPlacementRole.BOOKSHELF;
        return RoomPlacementRole.SOFA;
    }
}
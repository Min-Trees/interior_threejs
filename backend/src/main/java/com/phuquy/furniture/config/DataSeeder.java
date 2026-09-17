package com.phuquy.furniture.config;

import com.phuquy.furniture.entity.Category;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.entity.Role;
import com.phuquy.furniture.entity.RoomPlacementRole;
import com.phuquy.furniture.entity.User;
import com.phuquy.furniture.repository.CategoryRepository;
import com.phuquy.furniture.repository.ProductRepository;
import com.phuquy.furniture.repository.RoleRepository;
import com.phuquy.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final com.phuquy.furniture.repository.VoucherRepository voucherRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedRoles();
        seedUsers();
        seedCategoriesAndProducts();
        seedVouchers();
    }

    private void seedRoles() {
        if (!roleRepository.existsByName(Role.ROLE_CUSTOMER)) {
            roleRepository.save(Role.builder().name(Role.ROLE_CUSTOMER).build());
        }
        if (!roleRepository.existsByName(Role.ROLE_ADMIN)) {
            roleRepository.save(Role.builder().name(Role.ROLE_ADMIN).build());
        }
        log.info("Roles seeded successfully.");
    }

    private void seedUsers() {
        Role adminRole = roleRepository.findByName(Role.ROLE_ADMIN).orElseThrow();
        Role customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER).orElseThrow();

        if (!userRepository.existsByEmail("admin@phuquy.com")) {
            User admin = User.builder()
                    .email("admin@phuquy.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản Trị Viên Phú Quý")
                    .phone("0909123456")
                    .address("Showroom Phú Quý, 88 Xa Lộ Hà Nội, TP. Thủ Đức, TP. HCM")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")
                    .status(User.UserStatus.ACTIVE)
                    .role(adminRole)
                    .build();
            userRepository.save(admin);
            log.info("Admin user seeded: admin@phuquy.com / admin123");
        }

        if (!userRepository.existsByEmail("khachhang@gmail.com")) {
            User customer = User.builder()
                    .email("khachhang@gmail.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Nguyễn Văn An")
                    .phone("0987654321")
                    .address("Số 123 Đường Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh")
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80")
                    .status(User.UserStatus.ACTIVE)
                    .role(customerRole)
                    .build();
            userRepository.save(customer);
            log.info("Customer user seeded: khachhang@gmail.com / customer123");
        }
    }

    private void seedCategoriesAndProducts() {
        if (categoryRepository.count() > 0 && productRepository.count() > 0) {
            log.info("Categories and products already seeded.");
            backfillProduct3DDimensions();
            return;
        }

        // 1. Danh mục
        Category cSofa = categoryRepository.save(Category.builder()
                .name("Sofa & Ghế Thư Giãn")
                .slug("sofa-ghe-thu-gian")
                .description("Bộ sưu tập sofa góc, sofa băng nỉ, ghế bành đơn cao cấp sang trọng cho phòng khách")
                .imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80")
                .displayOrder(1)
                .build());

        Category cBan = categoryRepository.save(Category.builder()
                .name("Bàn Ăn & Bàn Trà")
                .slug("ban-an-ban-tra")
                .description("Bàn ăn gỗ óc chó nguyên tấm, bàn mặt đá ceramic chống xước và bàn trà hiện đại")
                .imageUrl("https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80")
                .displayOrder(2)
                .build());

        Category cGiuong = categoryRepository.save(Category.builder()
                .name("Giường Ngủ Cao Cấp")
                .slug("giuong-ngu-cao-cap")
                .description("Giường ngủ gỗ sồi tự nhiên, giường bọc da Nappa và vải nỉ kháng khuẩn phong cách Bắc Âu")
                .imageUrl("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80")
                .displayOrder(3)
                .build());

        Category cTuKe = categoryRepository.save(Category.builder()
                .name("Tủ Quần Áo & Kệ Sách")
                .slug("tu-quan-ao-ke-sach")
                .description("Tủ áo cánh kính viền nhôm đèn LED, kệ trang trí phong cách tối giản tiện nghi")
                .imageUrl("https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80")
                .displayOrder(4)
                .build());

        Category cLamViec = categoryRepository.save(Category.builder()
                .name("Bàn Ghế Làm Việc")
                .slug("ban-ghe-lam-viec")
                .description("Bàn làm việc thông minh nâng hạ điện tử, ghế công thái học bảo vệ cột sống")
                .imageUrl("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80")
                .displayOrder(5)
                .build());

        // 2. Sản phẩm nội thất mẫu
        List<Product> products = Arrays.asList(
            // Sofa
            Product.builder()
                .category(cSofa)
                .name("Sofa Góc Chữ L Da Bò Ý Cao Cấp Florence")
                .slug("sofa-goc-chu-l-da-bo-y-florence")
                .description("Sofa góc Florence được gia công tỉ mỉ từ 100% da bò tự nhiên nhập khẩu trực tiếp từ Ý. Khung sườn gỗ sồi tự nhiên sấy khô chống mối mọt cong vênh vĩnh viễn, đệm mút cao su non êm ái chống xẹp lún. Thiết kế hiện đại mang lại đẳng cấp hoàng gia cho phòng khách rộng.")
                .price(new BigDecimal("28500000"))
                .discountPrice(new BigDecimal("25900000"))
                .stockQuantity(12)
                .material("Da bò Ý Mastrotto, khung gỗ sồi Nga sấy, mút nguyên khối D40")
                .dimensions("280cm x 170cm x 85cm (Dài x Rộng x Cao)")
                .color("Nâu Cognac sang trọng")
                .weight(85.0)
                .thumbnail("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80,https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cSofa)
                .name("Sofa Băng 3 Chỗ Vải Nỉ Bắc Âu Scandinavian Oslo")
                .slug("sofa-bang-vai-ni-bac-au-oslo")
                .description("Phong cách thiết kế Scandinavian tinh giản từ Đan Mạch. Vải nỉ nhung dệt thoi kháng nước, dễ lau chùi khi đổ cà phê hoặc chất lỏng. Chân gỗ sồi tiện tròn thanh thoát, phù hợp hoàn hảo với các căn hộ chung cư hoặc phòng khách diện tích vừa và nhỏ.")
                .price(new BigDecimal("12800000"))
                .discountPrice(new BigDecimal("11200000"))
                .stockQuantity(20)
                .material("Vải nỉ nhung Bỉ chống thấm, khung gỗ tần bì, đệm lông vũ kết hợp bông ép")
                .dimensions("210cm x 85cm x 80cm")
                .color("Xám tro nhạt (Light Grey)")
                .weight(48.0)
                .thumbnail("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cSofa)
                .name("Ghế Thư Giãn Đơn Armchair Chân Inox Mạ Vàng Barcelona")
                .slug("ghe-thu-gian-armchair-barcelona")
                .description("Biểu tượng trường tồn của nội thất hiện đại. Phần đệm ngồi bọc da microfiber dập quả trám sang chảnh, khung thép không gỉ nguyên khối uốn lượn mạ PVD vàng gương bóng loáng.")
                .price(new BigDecimal("6900000"))
                .discountPrice(new BigDecimal("5990000"))
                .stockQuantity(15)
                .material("Khung inox 304 mạ PVD vàng, da Nappa cao cấp")
                .dimensions("78cm x 80cm x 75cm")
                .color("Đen Huyền Bí")
                .weight(22.0)
                .thumbnail("https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80")
                .isFeatured(false)
                .isActive(true)
                .build(),

            // Bàn ăn & Bàn trà
            Product.builder()
                .category(cBan)
                .name("Bộ Bàn Ăn Gỗ Óc Chó Tự Nhiên Bắc Mỹ Kèm 6 Ghế Royal")
                .slug("bo-ban-an-go-oc-cho-kem-6-ghe-royal")
                .description("Bộ bàn ăn gia đình 6 người đẳng cấp với vân gỗ óc chó cuộn sóng 3D quyến rũ. Sơn phủ Inchem Mỹ 5 lớp giữ màu tự nhiên mộc mạc và chống xước tối ưu. Ghế ăn tựa lưng công thái học bọc da cao cấp.")
                .price(new BigDecimal("34500000"))
                .discountPrice(new BigDecimal("31900000"))
                .stockQuantity(8)
                .material("100% Gỗ óc chó Walnut nhập khẩu Bắc Mỹ, da Microfiber")
                .dimensions("Bàn: 180cm x 90cm x 75cm; Ghế: 48cm x 52cm x 85cm")
                .color("Nâu hạt dẻ trầm ấm")
                .weight(95.0)
                .thumbnail("https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cBan)
                .name("Bàn Trà Đôi Mặt Đá Ceramic Chống Xước Vân Mây Venus")
                .slug("ban-tra-doi-mat-da-ceramic-venus")
                .description("Bộ bàn trà đôi lồng ghép gồm 1 bàn lớn mặt đá ceramic chống ố chống va đập và 1 bàn nhỏ mặt kính cường lực trà. Chân thép sơn tĩnh điện đen mờ phong cách tối giản.")
                .price(new BigDecimal("5200000"))
                .discountPrice(new BigDecimal("4650000"))
                .stockQuantity(25)
                .material("Mặt đá phiến ceramic Italy, kính cường lực, chân thép sơn tĩnh điện")
                .dimensions("Bàn lớn: D70cm x H45cm; Bàn nhỏ: D50cm x H40cm")
                .color("Trắng vân mây + Kính trà")
                .weight(28.0)
                .thumbnail("https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80")
                .isFeatured(false)
                .isActive(true)
                .build(),

            // Giường ngủ
            Product.builder()
                .category(cGiuong)
                .name("Giường Ngủ Bọc Nệm Nỉ Phong Cách Ý Luxury Grand")
                .slug("giuong-ngu-boc-nem-ni-luxury-grand")
                .description("Chiếc giường mang lại giấc ngủ thư thái tựa khách sạn 5 sao. Đầu giường bọc đệm êm ái dày 15cm tạo điểm tựa thoải mái khi đọc sách hoặc xem tivi. Giát giường khung thép chịu tải trọng trên 500kg.")
                .price(new BigDecimal("19800000"))
                .discountPrice(new BigDecimal("17900000"))
                .stockQuantity(10)
                .material("Vải nỉ Bỉ cao cấp, khung gỗ thông tự nhiên kết hợp thép cường lực")
                .dimensions("180cm x 200cm (Kích thước lọt đệm)")
                .color("Xám khói thanh lịch")
                .weight(75.0)
                .thumbnail("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cGiuong)
                .name("Giường Ngủ Gỗ Sồi Tự Nhiên Tối Giản Kiểu Nhật Tatami")
                .slug("giuong-ngu-go-soi-tatami-nhat-ban")
                .description("Thiết kế gầm thấp phong cách Zen Nhật Bản. Từng đường nét mộng gỗ tinh xảo, tôn vinh sắc vàng ấm áp của gỗ sồi tự nhiên. Đầu giường có hộc để sách và tích hợp cổng sạc USB tiện dụng.")
                .price(new BigDecimal("14500000"))
                .discountPrice(new BigDecimal("13200000"))
                .stockQuantity(14)
                .material("100% Gỗ sồi trắng (White Oak) tự nhiên nhập khẩu")
                .dimensions("160cm x 200cm (Lọt lòng đệm)")
                .color("Màu gỗ sồi sáng tự nhiên")
                .weight(60.0)
                .thumbnail("https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=800&q=80")
                .isFeatured(false)
                .isActive(true)
                .build(),

            // Tủ & Kệ
            Product.builder()
                .category(cTuKe)
                .name("Tủ Quần Áo Cánh Kính Cường Lực Đèn LED Cảm Ứng Lumina")
                .slug("tu-quan-ao-canh-kinh-cuong-luc-lumina")
                .description("Đỉnh cao nội thất phòng ngủ hiện đại. Thùng tủ gỗ MDF chống ẩm An Cường phủ Melamine chống trầy xước. Cánh kính cường lực viền nhôm xước màu đen mờ kết hợp dải LED cảm biến đóng mở cửa thông minh.")
                .price(new BigDecimal("22500000"))
                .discountPrice(new BigDecimal("20500000"))
                .stockQuantity(7)
                .material("Gỗ MDF lõi xanh chống ẩm An Cường, cánh kính cường lực 5mm, khung nhôm Xingfa")
                .dimensions("240cm x 60cm x 240cm (Dài x Sâu x Cao)")
                .color("Kính trà viền nhôm đen")
                .weight(130.0)
                .thumbnail("https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cTuKe)
                .name("Kệ Sách Và Đồ Trang Trí Khung Thép Sơn Tĩnh Điện Loft Industrial")
                .slug("ke-sach-trang-tri-khung-thep-loft")
                .description("Kệ trang trí phong cách công nghiệp cá tính với 5 tầng bày sách, lọ hoa, mô hình hoặc tranh ảnh. Khung thép hộp dày chịu lực cực tốt, các đợt gỗ tự nhiên phủ dầu lau bóng mịn.")
                .price(new BigDecimal("4800000"))
                .discountPrice(new BigDecimal("4200000"))
                .stockQuantity(18)
                .material("Khung thép sơn tĩnh điện chống rỉ, đợt gỗ cao su tự nhiên chuẩn AA")
                .dimensions("120cm x 35cm x 180cm")
                .color("Khung đen - Gỗ nâu cánh gián")
                .weight(35.0)
                .thumbnail("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80")
                .isFeatured(false)
                .isActive(true)
                .build(),

            // Bàn ghế làm việc
            Product.builder()
                .category(cLamViec)
                .name("Bàn Làm Việc Nâng Hạ Điện Tử Thông Minh SmartDesk Pro")
                .slug("ban-lam-viec-nang-ha-dien-tu-smartdesk-pro")
                .description("Bàn làm việc công thái học chuyển đổi linh hoạt tư thế đứng và ngồi. Động cơ kép Dual Motor êm ái dưới 45dB, bảng điều khiển cảm ứng ghi nhớ 4 vị trí độ cao, tích hợp cảm biến chống va chạm an toàn.")
                .price(new BigDecimal("9800000"))
                .discountPrice(new BigDecimal("8650000"))
                .stockQuantity(16)
                .material("Mặt bàn gỗ sồi ghép thanh tự nhiên dày 25mm, khung thép cán nguội SPCC")
                .dimensions("140cm x 70cm (Độ cao nâng hạ 65cm - 125cm)")
                .color("Mặt gỗ vàng nhạt - Khung trắng")
                .weight(42.0)
                .thumbnail("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build(),

            Product.builder()
                .category(cLamViec)
                .name("Ghế Công Thái Học Lưới Thoáng Khí Ergonomic Master Chair")
                .slug("ghe-cong-thai-hoc-luoi-ergonomic-master")
                .description("Giải pháp bảo vệ cột sống và cổ vai gáy cho người làm việc văn phòng 8-12 tiếng mỗi ngày. Tựa lưng 3D điều chỉnh theo độ cong sinh lý của lưng, đệm ngồi trượt ngả lưng 135 độ, lưới Wintex nhập khẩu Hàn Quốc không giãn xệ.")
                .price(new BigDecimal("6500000"))
                .discountPrice(new BigDecimal("5500000"))
                .stockQuantity(22)
                .material("Lưới Wintex Hàn Quốc, chân hợp kim nhôm đúc nguyên khối, Piston Class 4 chứng nhận BIFMA")
                .dimensions("68cm x 68cm x 115-125cm")
                .color("Xám Không Gian (Space Grey)")
                .weight(21.0)
                .thumbnail("https://images.unsplash.com/photo-1589384267710-7a25a5895780?auto=format&fit=crop&w=800&q=80")
                .images("https://images.unsplash.com/photo-1589384267710-7a25a5895780?auto=format&fit=crop&w=800&q=80")
                .isFeatured(true)
                .isActive(true)
                .build()
        );

        productRepository.saveAll(products);
        log.info("Seeded {} furniture products successfully.", products.size());
    }

    private void seedVouchers() {
        if (voucherRepository.count() > 0) return;

        List<com.phuquy.furniture.entity.Voucher> vouchers = List.of(
                com.phuquy.furniture.entity.Voucher.builder()
                        .code("PHUQUY10")
                        .title("Giảm 10% Toàn Bộ Đơn Hàng (Tối đa 2.000.000đ)")
                        .description("Áp dụng cho mọi đơn hàng nội thất phòng khách, phòng ngủ từ 5 triệu đồng trở lên.")
                        .discountType(com.phuquy.furniture.entity.Voucher.DiscountType.PERCENTAGE)
                        .discountValue(new BigDecimal("10.00"))
                        .minOrderValue(new BigDecimal("5000000"))
                        .maxDiscountAmount(new BigDecimal("2000000"))
                        .usageLimit(200)
                        .usedCount(8)
                        .startDate(java.time.LocalDateTime.now().minusDays(10))
                        .endDate(java.time.LocalDateTime.now().plusMonths(3))
                        .isActive(true)
                        .build(),

                com.phuquy.furniture.entity.Voucher.builder()
                        .code("PHUQUY500")
                        .title("Giảm Trực Tiếp 500.000đ Đơn Hàng Đầu Tiên")
                        .description("Ưu đãi đặc quyền chào đón khách hàng mới khi mua sắm tại showroom online Phú Quý.")
                        .discountType(com.phuquy.furniture.entity.Voucher.DiscountType.FIXED_AMOUNT)
                        .discountValue(new BigDecimal("500000"))
                        .minOrderValue(new BigDecimal("3000000"))
                        .usageLimit(150)
                        .usedCount(12)
                        .startDate(java.time.LocalDateTime.now().minusDays(5))
                        .endDate(java.time.LocalDateTime.now().plusMonths(2))
                        .isActive(true)
                        .build(),

                com.phuquy.furniture.entity.Voucher.builder()
                        .code("FREESHIP")
                        .title("Miễn Phí Vận Chuyển & Lắp Đặt Tận Nhà (150.000đ)")
                        .description("Hỗ trợ cước vận chuyển giao hàng tận nơi cho đơn từ 1 triệu đồng.")
                        .discountType(com.phuquy.furniture.entity.Voucher.DiscountType.FIXED_AMOUNT)
                        .discountValue(new BigDecimal("150000"))
                        .minOrderValue(new BigDecimal("1000000"))
                        .usageLimit(500)
                        .usedCount(35)
                        .startDate(java.time.LocalDateTime.now().minusDays(15))
                        .endDate(java.time.LocalDateTime.now().plusMonths(6))
                        .isActive(true)
                        .build()
        );

        voucherRepository.saveAll(vouchers);
        log.info("Seeded {} promo vouchers successfully.", vouchers.size());
    }

    private void backfillProduct3DDimensions() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String slug = p.getSlug() != null ? p.getSlug() : "";
            boolean updated = false;

            if (slug.contains("tham")) {
                p.setWidthCm(240.0);
                p.setDepthCm(160.0);
                p.setHeightCm(2.0);
                p.setModel3dUrl("/models/rug.glb");
                p.setRoomPlacementRole(RoomPlacementRole.RUG);
                updated = true;
            } else if (slug.contains("smartdesk") || slug.contains("ban-lam-viec")) {
                p.setWidthCm(140.0);
                p.setDepthCm(70.0);
                p.setHeightCm(75.0);
                p.setModel3dUrl("/models/desk.glb");
                p.setRoomPlacementRole(RoomPlacementRole.DESK);
                updated = true;
            } else if (slug.contains("ergonomic") || slug.contains("master-chair")) {
                p.setWidthCm(65.0);
                p.setDepthCm(65.0);
                p.setHeightCm(115.0);
                p.setModel3dUrl("/models/office-chair.glb");
                p.setRoomPlacementRole(RoomPlacementRole.OFFICE_CHAIR);
                updated = true;
            } else if (slug.contains("tu-quan-ao")) {
                p.setWidthCm(180.0);
                p.setDepthCm(60.0);
                p.setHeightCm(210.0);
                p.setModel3dUrl("/models/wardrobe.glb");
                p.setRoomPlacementRole(RoomPlacementRole.WARDROBE);
                updated = true;
            } else if (slug.contains("sofa-goc-chu-l")) {
                p.setWidthCm(280.0);
                p.setDepthCm(170.0);
                p.setHeightCm(85.0);
                p.setModel3dUrl("/models/sofa.glb");
                p.setRoomPlacementRole(RoomPlacementRole.SOFA);
                updated = true;
            } else if (slug.contains("sofa-bang-vai-ni") || slug.contains("sofa")) {
                p.setWidthCm(210.0);
                p.setDepthCm(85.0);
                p.setHeightCm(80.0);
                p.setModel3dUrl("/models/sofa.glb");
                p.setRoomPlacementRole(RoomPlacementRole.SOFA);
                updated = true;
            } else if (slug.contains("ghe-thu-gian") || slug.contains("armchair")) {
                p.setWidthCm(85.0);
                p.setDepthCm(85.0);
                p.setHeightCm(82.0);
                p.setModel3dUrl("/models/chair.glb");
                p.setRoomPlacementRole(RoomPlacementRole.SOFA);
                updated = true;
            } else if (slug.contains("ban-tra")) {
                p.setWidthCm(110.0);
                p.setDepthCm(60.0);
                p.setHeightCm(45.0);
                p.setModel3dUrl("/models/coffee-table.glb");
                p.setRoomPlacementRole(RoomPlacementRole.COFFEE_TABLE);
                updated = true;
            } else if (slug.contains("ban-an")) {
                p.setWidthCm(180.0);
                p.setDepthCm(90.0);
                p.setHeightCm(76.0);
                p.setModel3dUrl("/models/table.glb");
                p.setRoomPlacementRole(RoomPlacementRole.DINING_TABLE);
                updated = true;
            } else if (slug.contains("giuong")) {
                p.setWidthCm(180.0);
                p.setDepthCm(200.0);
                p.setHeightCm(110.0);
                p.setModel3dUrl("/models/bed.glb");
                p.setRoomPlacementRole(RoomPlacementRole.BED);
                updated = true;
            } else if (slug.contains("ke-sach")) {
                p.setWidthCm(110.0);
                p.setDepthCm(35.0);
                p.setHeightCm(185.0);
                p.setModel3dUrl("/models/shelf.glb");
                p.setRoomPlacementRole(RoomPlacementRole.BOOKSHELF);
                updated = true;
            }
            if (updated) {
                productRepository.save(p);
            }
        }

        Category cSofa = categoryRepository.findBySlug("sofa-ghe-thu-gian").orElse(null);
        Category cTuKe = categoryRepository.findBySlug("tu-quan-ao-ke-sach").orElse(null);

        if (!productRepository.existsBySlug("ke-tivi-go-oc-cho-sony")) {
            Product tvStand = Product.builder()
                    .category(cTuKe != null ? cTuKe : cSofa)
                    .name("Kệ Tivi Gỗ Óc Chó Tự Nhiên Bắc Mỹ Grand")
                    .slug("ke-tivi-go-oc-cho-sony")
                    .description("Kệ tivi thiết kế thấp hiện đại tối giản với 3 ngăn kéo hít giảm chấn Hafele. Mặt gỗ óc chó vân núi phủ dầu sáp Osmo an toàn sức khỏe.")
                    .price(new BigDecimal("12500000"))
                    .discountPrice(new BigDecimal("11200000"))
                    .stockQuantity(15)
                    .material("Gỗ óc chó Bắc Mỹ nhập khẩu FAS")
                    .dimensions("180cm x 42cm x 45cm")
                    .widthCm(180.0)
                    .depthCm(42.0)
                    .heightCm(45.0)
                    .model3dUrl("/models/tv-stand.glb")
                    .roomPlacementRole(RoomPlacementRole.TV_STAND)
                    .color("Nâu trầm tự nhiên")
                    .thumbnail("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80")
                    .isFeatured(true)
                    .isActive(true)
                    .build();
            productRepository.save(tvStand);
        }

        if (!productRepository.existsBySlug("tham-sofa-scandinavian-nordic")) {
            Product rug = Product.builder()
                    .category(cSofa)
                    .name("Thảm Trải Sàn Nỉ Lông Ngắn Họa Tiết Bắc Âu Nordic")
                    .slug("tham-sofa-scandinavian-nordic")
                    .description("Thảm dệt sợi Polyester mật độ cao êm ái chống bám bụi và chống trượt tuyệt đối. Họa tiết hình học Scandi tối giản.")
                    .price(new BigDecimal("3500000"))
                    .discountPrice(new BigDecimal("2950000"))
                    .stockQuantity(25)
                    .material("Sợi nỉ tổng hợp kháng khuẩn, đế cao su TPR chống trượt")
                    .dimensions("240cm x 160cm x 1.5cm")
                    .widthCm(240.0)
                    .depthCm(160.0)
                    .heightCm(2.0)
                    .model3dUrl("/models/rug.glb")
                    .roomPlacementRole(RoomPlacementRole.RUG)
                    .color("Xám trắng họa tiết hình học")
                    .thumbnail("https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80")
                    .isFeatured(true)
                    .isActive(true)
                    .build();
            productRepository.save(rug);
        }

        if (!productRepository.existsBySlug("den-cay-dung-arco-lamp")) {
            Product lamp = Product.builder()
                    .category(cSofa)
                    .name("Đèn Cây Đứng Vòm Cung Cần Inox Arco Luxury")
                    .slug("den-cay-dung-arco-lamp")
                    .description("Đèn cây uốn vòm chân đế đá cẩm thạch trắng Carrara nguyên khối nặng 35kg vững chãi. Cần đèn inox 304 sáng bóng điều chỉnh vươn xa 2m.")
                    .price(new BigDecimal("6800000"))
                    .discountPrice(new BigDecimal("5900000"))
                    .stockQuantity(10)
                    .material("Inox 304 xước mờ, chân đế đá tự nhiên Carrara")
                    .dimensions("45cm x 45cm x 185cm")
                    .widthCm(45.0)
                    .depthCm(45.0)
                    .heightCm(185.0)
                    .model3dUrl("/models/lamp.glb")
                    .roomPlacementRole(RoomPlacementRole.FLOOR_LAMP)
                    .color("Bạc kim loại & Đá trắng")
                    .thumbnail("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80")
                    .isFeatured(true)
                    .isActive(true)
                    .build();
            productRepository.save(lamp);
        }
        log.info("Backfilled 3D dimensions and seeded living room accessories.");
    }
}

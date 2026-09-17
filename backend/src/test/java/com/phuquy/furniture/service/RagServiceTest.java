package com.phuquy.furniture.service;

import com.phuquy.furniture.entity.Category;
import com.phuquy.furniture.entity.Product;
import com.phuquy.furniture.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RagServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private RagService ragService;

    private List<Product> mockProducts;

    @BeforeEach
    void setUp() {
        Category sofaCat = Category.builder().id(1L).name("Sofa & Ghế").build();
        Category tableCat = Category.builder().id(2L).name("Bàn Ăn").build();

        Product sofa1 = Product.builder()
                .id(1L)
                .name("Sofa Góc Da Bò Ý Florence")
                .category(sofaCat)
                .price(new BigDecimal("28500000"))
                .discountPrice(new BigDecimal("25000000"))
                .material("Da bò Ý")
                .dimensions("280cm x 170cm")
                .stockQuantity(5)
                .isActive(true)
                .isFeatured(true)
                .description("Sofa da cao cấp phòng khách rộng")
                .build();

        Product table1 = Product.builder()
                .id(2L)
                .name("Bàn Ăn Gỗ Óc Chó 6 Ghế Royal")
                .category(tableCat)
                .price(new BigDecimal("32000000"))
                .material("Gỗ óc chó")
                .dimensions("180cm x 90cm")
                .stockQuantity(3)
                .isActive(true)
                .isFeatured(true)
                .description("Bàn ăn gia đình phong cách hiện đại")
                .build();

        mockProducts = Arrays.asList(sofa1, table1);
    }

    @Test
    void testRetrieveRelevantProducts_MatchesSofaQuery() {
        when(productRepository.findByIsActiveTrue()).thenReturn(mockProducts);

        List<Product> results = ragService.retrieveRelevantProducts("Tôi muốn tìm sofa da cho phòng khách", 2);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals("Sofa Góc Da Bò Ý Florence", results.get(0).getName());
    }

    @Test
    void testRetrieveRelevantProducts_MatchesTableQuery() {
        when(productRepository.findByIsActiveTrue()).thenReturn(mockProducts);

        List<Product> results = ragService.retrieveRelevantProducts("Tư vấn bàn ăn gỗ óc chó 6 người", 2);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals("Bàn Ăn Gỗ Óc Chó 6 Ghế Royal", results.get(0).getName());
    }

    @Test
    void testBuildRagContext_ContainsDetails() {
        String context = ragService.buildRagContext(mockProducts);

        assertNotNull(context);
        assertTrue(context.contains("Sofa Góc Da Bò Ý Florence"));
        assertTrue(context.contains("Bàn Ăn Gỗ Óc Chó 6 Ghế Royal"));
        assertTrue(context.contains("Da bò Ý"));
        assertTrue(context.contains("Gỗ óc chó"));
    }
}

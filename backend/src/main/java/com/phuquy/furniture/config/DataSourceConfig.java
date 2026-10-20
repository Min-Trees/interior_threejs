package com.phuquy.furniture.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Slf4j
@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:#{null}}")
    private String defaultJdbcUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String defaultUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        // 1. Kiểm tra biến môi trường DATABASE_URL (Railway / Heroku / Cloud container format)
        String rawUrl = (databaseUrl != null && !databaseUrl.isBlank()) 
                ? databaseUrl 
                : System.getenv("DATABASE_URL");

        if (rawUrl != null && !rawUrl.isBlank()) {
            try {
                log.info("Phát hiện biến môi trường DATABASE_URL (Railway/Cloud). Đang khởi tạo kết nối...");
                String cleanUrl = rawUrl.startsWith("jdbc:") ? rawUrl.substring(5) : rawUrl;
                URI uri = new URI(cleanUrl);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String database = (path != null && path.length() > 1) ? path.substring(1) : "railway";

                String userInfo = uri.getUserInfo();
                String username = defaultUsername;
                String password = defaultPassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
                log.info("Kết nối thành công PostgreSQL: {} tại {}:{} với user: {}", database, host, port, username);

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                return new HikariDataSource(config);
            } catch (Exception e) {
                log.error("Không thể phân tích DATABASE_URL: {}, chuyển về cấu hình mặc định. Chi tiết: {}", rawUrl, e.getMessage());
            }
        }

        // 2. Sử dụng cấu hình tiêu chuẩn cục bộ hoặc từ spring.datasource
        log.info("Khởi tạo kết nối cơ sở dữ liệu mặc định: {}", defaultJdbcUrl);
        config.setJdbcUrl(defaultJdbcUrl);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        return new HikariDataSource(config);
    }
}

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

    // 1. URL formats (Railway DATABASE_URL / DATABASE_PRIVATE_URL)
    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${DATABASE_PRIVATE_URL:#{null}}")
    private String databasePrivateUrl;

    // 2. Railway standard variables (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)
    @Value("${PGHOST:#{null}}")
    private String pgHost;

    @Value("${PGPORT:#{null}}")
    private String pgPort;

    @Value("${PGDATABASE:#{null}}")
    private String pgDatabase;

    @Value("${PGUSER:#{null}}")
    private String pgUser;

    @Value("${PGPASSWORD:#{null}}")
    private String pgPassword;

    // 3. Fallback standard spring.datasource properties
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

        // Priority 1: Check DATABASE_URL or DATABASE_PRIVATE_URL (Railway URL format)
        String rawUrl = getFirstNonBlank(
                databaseUrl,
                databasePrivateUrl,
                System.getenv("DATABASE_URL"),
                System.getenv("DATABASE_PRIVATE_URL")
        );

        if (rawUrl != null && !rawUrl.isBlank()) {
            try {
                log.info("Phát hiện URL kết nối Railway/Cloud. Đang khởi tạo...");
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
                log.info("Kết nối thành công PostgreSQL (Railway URL): {} tại {}:{} với user: {}", database, host, port, username);

                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                return new HikariDataSource(config);
            } catch (Exception e) {
                log.error("Không thể phân tích URL {}: {}, chuyển sang kiểm tra biến PG*...", rawUrl, e.getMessage());
            }
        }

        // Priority 2: Check Railway individual variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT)
        String host = getFirstNonBlank(pgHost, System.getenv("PGHOST"));
        String port = getFirstNonBlank(pgPort, System.getenv("PGPORT"), "5432");
        String database = getFirstNonBlank(pgDatabase, System.getenv("PGDATABASE"), "railway");
        String username = getFirstNonBlank(pgUser, System.getenv("PGUSER"));
        String password = getFirstNonBlank(pgPassword, System.getenv("PGPASSWORD"));

        if (host != null && !host.isBlank() && username != null && !username.isBlank()) {
            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            log.info("Phát hiện biến môi trường Railway (PGHOST={}): Đang kết nối {} với user: {}", host, jdbcUrl, username);
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(username);
            config.setPassword(password != null ? password : "");
            return new HikariDataSource(config);
        }

        // Priority 3: Use default configured properties (local host or spring.datasource.url)
        log.info("Sử dụng cấu hình cơ sở dữ liệu mặc định: {}", defaultJdbcUrl);
        config.setJdbcUrl(defaultJdbcUrl);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        return new HikariDataSource(config);
    }

    private String getFirstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }
}

package com.phuquy.furniture.repository;

import com.phuquy.furniture.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ChatSession> findBySessionToken(String sessionToken);
}

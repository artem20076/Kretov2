package ru.example.edu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.example.edu.model.ComputerComponent;
import java.util.List;

public interface ComputerComponentRepository extends JpaRepository<ComputerComponent, Long> {
    List<ComputerComponent> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
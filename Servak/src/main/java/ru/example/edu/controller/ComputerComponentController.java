package ru.example.edu.controller;

import org.springframework.web.bind.annotation.*;
import ru.example.edu.model.ComputerComponent;
import ru.example.edu.repository.ComputerComponentRepository;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/component")
public class ComputerComponentController {
    private final ComputerComponentRepository repository;

    public ComputerComponentController(ComputerComponentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ComputerComponent> getAllComponents() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ComputerComponent getComponentById(@PathVariable long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public long addComponent(@RequestBody ComputerComponent component) {
        ComputerComponent saved = repository.save(component);
        return saved.getId();
    }

    @PutMapping("/{id}")
    public ComputerComponent updateComponent(@PathVariable long id, @RequestBody ComputerComponent component) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(component.getName());
                    existing.setType(component.getType());
                    existing.setDescription(component.getDescription());
                    existing.setSpecs(component.getSpecs());
                    existing.setImageUrl(component.getImageUrl());
                    return repository.save(existing);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteComponent(@PathVariable long id) {
        repository.deleteById(id);
    }

    @GetMapping("/search")
    public List<ComputerComponent> searchComponents(@RequestParam String query) {
        return repository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
}
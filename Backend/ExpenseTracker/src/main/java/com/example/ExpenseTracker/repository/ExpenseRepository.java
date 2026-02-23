package com.example.ExpenseTracker.repository;

import com.example.ExpenseTracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Long> {
    List<Expense> findByUserId(Long id);
    Optional<Expense>findById(Long expenseId);
}

package com.kosa.fillinv.stock.repository;

import com.kosa.fillinv.stock.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;

public interface StockRepository extends JpaRepository<Stock, String> {

    @Modifying
    @Query("UPDATE Stock s SET s.quantity = s.quantity - 1 " +
            "WHERE s.serviceKey = :key AND s.quantity > 0")
    int decreaseQuantity(@Param("key") String key);

    @Modifying
    @Query("UPDATE Stock s SET s.quantity = s.quantity + 1 " +
            "WHERE s.serviceKey = :key")
    int increaseQuantity(@Param("key") String key);

    List<Stock> findAllByServiceKeyIn(Collection<String> serviceKeys);
}

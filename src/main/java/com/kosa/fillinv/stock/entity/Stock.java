package com.kosa.fillinv.stock.entity;

import com.kosa.fillinv.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "stocks")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Stock extends BaseEntity {
    @Id
    @Column(name = "stock_id", nullable = false)
    private String id;

    @Column(name = "service_key", nullable = false)
    private String serviceKey;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Builder
    public Stock(String id, String serviceKey, Integer quantity) {
        this.id = id;
        this.serviceKey = serviceKey;
        this.quantity = quantity;
    }
}

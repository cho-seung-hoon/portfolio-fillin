package com.kosa.fillinv.lesson.service.client;

import com.kosa.fillinv.stock.entity.Stock;
import com.kosa.fillinv.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DefaultStockClient implements StockClient {

    private final StockRepository stockRepository;

    @Override
    public Map<String, Integer> getStock(Set<String> keys) {
        return stockRepository.findAllByServiceKeyIn(keys).stream()
                .collect(Collectors.toMap(
                        Stock::getServiceKey,
                        Stock::getQuantity));
    }
}

package com.kosa.fillinv.lesson.service.client;

import java.util.Map;
import java.util.Set;

public interface StockClient {
    Map<String, Integer> getStock(Set<String> keys);
}

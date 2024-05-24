package com.example.GroupRecommend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IndexedValue implements Comparable<IndexedValue> {
    double value;
    int index;

    public IndexedValue(double value, int index) {
        this.value = value;
        this.index = index;
    }

    // 按值降序排序
    @Override
    public int compareTo(IndexedValue other) {
        return Double.compare(other.value, this.value);  // 降序
    }
}
package com.example.GroupRecommend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND) // 404 Error
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    // 如果你需要更详细的错误处理，可以添加构造函数来接收原因或其他属性
}
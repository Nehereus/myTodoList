package dev.javacafe.todolist.infrastructure.persistence.mybatis;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.Instant;

@Data
@TableName("todos")
public class TodoPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;
    private String description;
    private boolean completed;
    private String category;
    private Instant dueAt;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean deleted;

}

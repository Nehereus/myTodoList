package dev.javacafe.todolist.infrastructure.persistence.mybatis;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("users")
public class UserPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    // Maps to 'hashed_password' column
    private String hashedPassword;

}

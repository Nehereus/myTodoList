package dev.javacafe.todolist.infrastructure.persistence.persistence;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import dev.javacafe.todolist.domain.model.user.User;
import dev.javacafe.todolist.domain.model.user.UserId;
import dev.javacafe.todolist.domain.repository.IUserRepository;
import dev.javacafe.todolist.infrastructure.persistence.mybatis.UserMapper;
import dev.javacafe.todolist.infrastructure.persistence.mybatis.UserPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.swing.text.html.Option;
import java.util.Optional;

@Component
public class UserRepositoryImpl implements IUserRepository {
    private final UserMapper userMapper;

    @Autowired
    public UserRepositoryImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }


    @Override
    public User save(User user) {
        //not implemented yet
        return null;
    }

    @Override
    public Optional<User> findByName(String username) {
        QueryWrapper<UserPO> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return Optional.ofNullable( userMapper.selectOne(wrapper))
                .map(this::mapToDomain);
    }

    @Override
    public boolean existsByUsername(String username) {
        QueryWrapper<UserPO> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        return userMapper.selectCount(wrapper) > 0;
    }

    private UserPO mapToPO(User user) {
        UserPO po = new UserPO();
        if (user.getId() != null) {
            po.setId(user.getId().value());
        }
        po.setUsername(user.getUsername());
        po.setHashedPassword(user.getHashedPassword());
        return po;
    }

    private User mapToDomain(UserPO po) {
        return User.from(
                new UserId(po.getId()),
                po.getUsername(),
                po.getHashedPassword()
        );
    }
}

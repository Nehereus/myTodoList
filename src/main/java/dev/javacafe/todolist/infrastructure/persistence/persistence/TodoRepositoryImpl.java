package dev.javacafe.todolist.infrastructure.persistence.persistence;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import dev.javacafe.todolist.domain.model.todo.Todo;
import dev.javacafe.todolist.domain.model.user.UserId;
import dev.javacafe.todolist.domain.repository.ITodoRepository;
import dev.javacafe.todolist.infrastructure.persistence.mybatis.TodoMapper;
import dev.javacafe.todolist.infrastructure.persistence.mybatis.TodoPO;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class TodoRepositoryImpl implements ITodoRepository {

    private final TodoMapper todoMapper;

    @Autowired
    public TodoRepositoryImpl(TodoMapper todoMapper) {
        this.todoMapper = todoMapper;
    }

    @Override
    public Todo save(Todo todo) {
        TodoPO todoPo = mapToPO(todo);
        if(todo.getId()==null||todo.getId()==-1L){
            todoMapper.insert(todoPo);
        }else{
            todoMapper.updateById(todoPo);
        }
        return mapToDomain(todoPo);
    }

    @Override
    public Optional<Todo> findById(Long id) {
        TodoPO todoPO = todoMapper.selectById(id);

        return Optional.ofNullable(todoPO)
                .map(this::mapToDomain);
    }

    @Override
    public List<Todo> findByUserId(UserId userId) {
        // Build a query using QueryWrapper
        QueryWrapper<TodoPO> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId.value());

        List<TodoPO> poList = todoMapper.selectList(wrapper);

        return poList.stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }


    @Override
    public List<Todo> findByUserIdAndUpdatedAtAfter(UserId userId, Instant lastSyncAt) {
        // Build the sync query
        QueryWrapper<TodoPO> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId.value());
        wrapper.gt("updated_at", lastSyncAt);

        List<TodoPO> poList = todoMapper.selectList(wrapper);

        return poList.stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    protected TodoPO mapToPO(Todo todo) {
        TodoPO po = new TodoPO();
        po.setId(todo.getId()); // Will be null for new todos
        po.setUserId(todo.getUserId().value());
        po.setTitle(todo.getTitle());
        po.setDescription(todo.getDescription());
        po.setCompleted(todo.isCompleted());
        po.setCategory(todo.getCategory());
        po.setDueAt(todo.getDueAt());
        po.setCreatedAt(todo.getCreatedAt());
        po.setUpdatedAt(todo.getUpdatedAt());
        po.setDeleted(todo.isDeleted());
        return po;
    }

    protected Todo mapToDomain(TodoPO po) {
        return Todo.from(
                po.getId(),
                new UserId(po.getUserId()),
                po.getTitle(),
                po.getDescription(),
                po.isCompleted(),
                po.getCategory(),
                po.getDueAt(),
                po.getCreatedAt(),
                po.getUpdatedAt(),
                po.isDeleted()
        );
    }
}

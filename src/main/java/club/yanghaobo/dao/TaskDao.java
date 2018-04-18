package club.yanghaobo.dao;

import club.yanghaobo.entity.Task;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface TaskDao {

    List<Task> getTaskList(@Param("start")int start, @Param("length")int length, @Param("params")Map<String, Object> params);

    int taskCount(@Param("params")Map<String, Object> params);

    void createTask(@Param("params")Map<String, Object> params);
}

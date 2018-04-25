package club.yanghaobo.dao;

import club.yanghaobo.entity.Rule;
import club.yanghaobo.entity.Task;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface TaskDao {

    List<Task> getTaskList(@Param("start") int start, @Param("length") int length, @Param("params") Map<String, Object> params);

    Task getTaskInfo(@Param("taskId") String taskId);

    int taskCount(@Param("params") Map<String, Object> params);

    void createTask(@Param("params") Map<String, Object> params);

    void addDeptInTask(@Param("taskId") String taskId, @Param("deptId") String deptId);

    void addRule(@Param("ruleId") String ruleId, @Param("taskId") String taskId, @Param("deptId") String deptId, @Param("expression") String expression);

    List<Map<String, String>> getTaskDeptFinishInfo(@Param("taskId") String taskId);

    void finishTask(@Param("taskId") String taskId);

    List<Rule> getRules(@Param("taskId") String taskId, @Param("deptId") String deptId);

    Rule getRuleBySheetName(@Param("taskId") String taskId, @Param("deptId") String deptId, @Param("sheetName") String sheetName);

    int finishTaskInput(@Param("taskId") String taskId, @Param("deptId") String deptId);
}

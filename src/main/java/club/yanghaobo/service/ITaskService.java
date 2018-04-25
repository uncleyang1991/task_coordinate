package club.yanghaobo.service;

import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Rule;
import club.yanghaobo.entity.TableCell;
import club.yanghaobo.entity.Task;

import java.util.List;
import java.util.Map;

public interface ITaskService {

    DataTableResult getTaskList(Map<String, Object> params);

    Task getTaskInfo(String taskId);

    List<String> getSheetName(String fileName, String fileType);

    boolean createTask(Map<String, Object> newTaskMap);

    List<Map<String, String>> detailedProgress(String taskId);

    boolean finishTask(String taskId);

    List<String> getSheetNameByDept(String taskId, String deptId);

    Map<String, Object> sheetMap(String taskId, String deptId, String sheetName);

    boolean saveSheet(Map<String, Object> inputMap) throws Exception;

    boolean finishTaskInput(Map<String, Object> inputMap) throws Exception;
}

package club.yanghaobo.service;

import club.yanghaobo.entity.DataTableResult;

import java.util.List;
import java.util.Map;

public interface ITaskService {

    DataTableResult getTaskList(Map<String,Object> params);

    List<String> getSheetName(String fileName, String fileType);

    boolean createTask(Map<String,Object> newTaskMap);
}

package club.yanghaobo.service;

import club.yanghaobo.entity.DataTableResult;

import java.util.Map;

public interface ITaskService {

    DataTableResult getTaskList(Map<String,Object> params);
}

package club.yanghaobo.service;

import club.yanghaobo.dao.TaskDao;
import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TaskServiceImpl implements ITaskService {

    @Autowired
    private TaskDao taskDao;

    @Override
    public DataTableResult getTaskList(Map<String,Object> params) {
        int start = Integer.parseInt(params.get("start").toString());
        int length = Integer.parseInt(params.get("length").toString());
        List<Task> list = taskDao.getTaskList(start, length, params);
        int count = taskDao.taskCount(params);
        DataTableResult result = new DataTableResult();
        result.setRecordsTotal(count);
        result.setRecordsFiltered(count);
        result.setList(list);
        return result;
    }
}

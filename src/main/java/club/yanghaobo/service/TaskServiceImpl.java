package club.yanghaobo.service;

import club.yanghaobo.dao.TaskDao;
import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Task;
import club.yanghaobo.tool.IdTool;
import club.yanghaobo.tool.JsonTool;
import org.apache.ibatis.annotations.Param;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class TaskServiceImpl implements ITaskService {

    @Autowired
    private TaskDao taskDao;

    @Override
    public DataTableResult getTaskList(Map<String, Object> params) {
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

    @Override
    public Task getTaskInfo(String taskId) {
        return taskDao.getTaskInfo(taskId);
    }

    @Override
    public List<String> getSheetName(String fileName, String fileType) {
        List<String> list = new ArrayList<>();
        File file = new File("task_files/" + fileName + "." + fileType);
        try {
            Workbook workbook;
            if ("xls".equals(fileType)) {
                workbook = new HSSFWorkbook(new FileInputStream(file));
            } else {
                workbook = new XSSFWorkbook(new FileInputStream(file));
            }
            Iterator<Sheet> iter = workbook.sheetIterator();
            while (iter.hasNext()) {
                Sheet sheet = iter.next();
                list.add(sheet.getSheetName());
            }
            workbook.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return list;
    }

    @Override
    @Transactional
    public boolean createTask(Map<String, Object> newTaskMap) {
        String fileId = newTaskMap.get("fileId").toString();
        String fileType = newTaskMap.get("fileType").toString();
        List<Map<String, Object>> deptList = (List<Map<String, Object>>) newTaskMap.get("dept");
        if ("xls".equals(fileType) || "xlsx".equals(fileType)) {
            //excel表格
            taskDao.createTask(newTaskMap);
            for (Map<String, Object> dept : deptList) {
                Object sheetObj = dept.get("sheet");
                if (sheetObj != null) {
                    List<Map<String, Object>> sheetList = (List<Map<String, Object>>) sheetObj;
                    if (sheetList.size() > 0) {
                        taskDao.addDeptInTask(fileId, dept.get("deptId").toString());
                        for (Map<String, Object> sheet : sheetList) {
                            StringBuffer expression = new StringBuffer();
                            expression.append("{sheetName:\"").append(sheet.get("sheetName")).append("\",rule:[");
                            List<Map<String, Object>> ruleList = (List<Map<String, Object>>) sheet.get("rule");
                            for (Map<String, Object> rule : ruleList) {
                                expression.append("{");
                                expression.append("range:\"").append(rule.get("range")).append("\",");
                                expression.append("formatType:\"").append(rule.get("formatType")).append("\",");
                                expression.append("custom:\"").append(rule.get("custom")).append("\"");
                                expression.append("},");
                            }
                            expression = new StringBuffer(expression.substring(0, expression.length() - 1));
                            expression.append("]}");
                            taskDao.addRule(IdTool.getUUID(),fileId,dept.get("deptId").toString(),expression.toString());
                        }

                    }
                }
            }
        } else if ("doc".equals(fileType) || "docx".equals(fileType)) {
            //word文档
            newTaskMap.put("type", "word");
        }

        return true;
    }

    @Override
    public List<Map<String, String>> detailedProgress(String taskId) {
        return taskDao.getTaskDeptFinishInfo(taskId);
    }

    @Override
    public boolean finishTask(String taskId) {
        taskDao.finishTask(taskId);
        return true;
    }
}

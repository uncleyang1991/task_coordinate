package club.yanghaobo.service;

import club.yanghaobo.dao.TaskDao;
import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Rule;
import club.yanghaobo.entity.TableCell;
import club.yanghaobo.entity.Task;
import club.yanghaobo.tool.IdTool;
import club.yanghaobo.tool.JsonTool;
import club.yanghaobo.util.POIReadExcel;
import com.alibaba.fastjson.JSON;
import org.apache.ibatis.annotations.Param;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.*;

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
        Workbook workbook = null;
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(file);
            if ("xls".equals(fileType)) {
                workbook = new HSSFWorkbook(fis);
            } else {
                workbook = new XSSFWorkbook(fis);
            }
            Iterator<Sheet> iter = workbook.sheetIterator();
            while (iter.hasNext()) {
                Sheet sheet = iter.next();
                list.add(sheet.getSheetName());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            try {
                fis.close();
                workbook.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
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
                            taskDao.addRule(IdTool.getUUID(), fileId, dept.get("deptId").toString(), expression.toString());
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

    @Override
    public List<String> getSheetNameByDept(String taskId, String deptId) {

        List<String> sheetNameList = new ArrayList<>();
        List<Rule> rules = taskDao.getRules(taskId, deptId);
        for (Rule rule : rules) {
            String expression = rule.getExpression();
            Map map = (Map) JSON.parse(expression);
            sheetNameList.add(map.get("sheetName").toString());
        }
        return sheetNameList;
    }

    @Override
    public Map<String, Object> sheetMap(String taskId, String deptId, String sheetName) {
        Map<String, Object> result = new HashMap<>();

        Rule rule = taskDao.getRuleBySheetName(taskId, deptId, sheetName);
        Map map = (Map) JSON.parse(rule.getExpression());
        result.put("rule", map.get("rule"));

        Task task = taskDao.getTaskInfo(taskId);
        List<List<TableCell>> sheetMap
                = POIReadExcel.readExcelToList("task_files" + File.separator + taskId + "." + task.getType(), sheetName, true);
        result.put("sheetMap", sheetMap);
        return result;
    }

    @Override
    public boolean saveSheet(Map<String, Object> obj) throws Exception {
        String taskId = obj.get("taskId").toString();
        Task task = taskDao.getTaskInfo(taskId);
        String taskType = task.getType();

        File taskFile = new File("task_files" + File.separator + taskId + "." + taskType);
        FileInputStream fis = new FileInputStream(taskFile);
        List<Map<String, Object>> inputMap = (List<Map<String, Object>>) obj.get("inputMap");
        Workbook wb = WorkbookFactory.create(fis);
        for (Map<String, Object> sheetInputMap : inputMap) {
            String sheetName = sheetInputMap.get("sheetName").toString();
            Sheet sheet = wb.getSheet(sheetName);
            List<Map<String, Object>> changeInputList = (List<Map<String, Object>>) sheetInputMap.get("changeInput");
            for (int i = 0, len = changeInputList.size(); i < len; i++) {
                Map<String, Object> changeInput = changeInputList.get(i);
                Integer x = Integer.parseInt(changeInput.get("x").toString());
                Integer y = Integer.parseInt(changeInput.get("y").toString());
                String value = changeInput.get("value").toString();
                Cell cell = sheet.getRow(y).getCell(x);
                try{
                    if(cell == null){
                        sheet.getRow(y).createCell(x).setCellValue(Integer.parseInt(value));
                    }else{
                        cell.setCellValue(Integer.parseInt(value));
                    }
                }catch(NumberFormatException e){
                    if(cell == null){
                        sheet.getRow(y).createCell(x).setCellValue(value);
                    }else{
                        cell.setCellValue(value);
                    }
                }
            }
        }
        FileOutputStream fos = new FileOutputStream(taskFile);
        wb.write(fos);
        fos.close();
        fis.close();
        return true;
    }

    @Override
    @Transactional
    public boolean finishTaskInput(Map<String, Object> obj) throws Exception {
        String taskId = obj.get("taskId").toString();
        String deptId = obj.get("deptId").toString();
        int result = taskDao.finishTaskInput(taskId, deptId);
        if(result != 1){
            throw new Exception("提交任务出错");
        }
        saveSheet(obj);
        return true;
    }
}

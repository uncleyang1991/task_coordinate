package club.yanghaobo.service;

import club.yanghaobo.dao.TaskDao;
import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Task;
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
    public List<String> getSheetName(String fileName, String fileType) {
        List<String> list = new ArrayList<>();
        File file = new File("task_files/" + fileName + "." + fileType);
        try{
            Workbook workbook;
            if("xls".equals(fileType)){
                workbook = new HSSFWorkbook(new FileInputStream(file));
            }else{
                workbook = new XSSFWorkbook(new FileInputStream(file));
            }
            Iterator<Sheet> iter = workbook.sheetIterator();
            while(iter.hasNext()){
                Sheet sheet = iter.next();
                list.add(sheet.getSheetName());
            }
            workbook.close();
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
        return list;
    }

    @Override
    @Transactional
    public boolean createTask(Map<String, Object> newTaskMap) {
        String createId = newTaskMap.get("createId").toString();
        String fileId = newTaskMap.get("fileId").toString();
        String fileType = newTaskMap.get("fileType").toString();
        List<Map<String,Object>> deptList = (List<Map<String,Object>>)newTaskMap.get("dept");
        if("xls".equals(fileType) || "xlsx".equals(fileType)){
            //excel表格
            newTaskMap.put("type","excel");
            taskDao.createTask(newTaskMap);
            for(Map<String,Object> dept:deptList){

            }
        }else if("doc".equals(fileType) || "docx".equals(fileType)){
            //word文档
            newTaskMap.put("type","word");
        }

        return true;
    }
}

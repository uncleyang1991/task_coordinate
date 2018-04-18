package club.yanghaobo.controller;

import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.User;
import club.yanghaobo.service.ITaskService;
import club.yanghaobo.tool.IdTool;
import club.yanghaobo.tool.JsonTool;
import com.alibaba.fastjson.JSON;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tc/task")
public class TaskController {

    @Autowired
    private ITaskService taskService;

    @RequestMapping("/list.do")
    public String list(@RequestParam Map<String, Object> params) {
        if (params.get("start") == null) {
            params.put("start", "0");
        }
        if (params.get("length") == null) {
            params.put("length", "15");
        }
        DataTableResult result = taskService.getTaskList(params);
        return JsonTool.obj2json(result);
    }

    @RequestMapping("/upload.do")
    public String upload(@RequestParam("file") MultipartFile file) {
        String fileName = file.getOriginalFilename();
        String fileType = fileName.substring(fileName.lastIndexOf("."));
        String taskId = IdTool.getUUID();
        File targetFile = new File("task_files");
        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }
        try {
            FileOutputStream out = new FileOutputStream(targetFile + File.separator + taskId + fileType);
            out.write(file.getBytes());
            out.flush();
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
            return JsonTool.makeResultJson(false, e.getMessage());
        }
        return JsonTool.makeResultJson(true, taskId);
    }

    @RequestMapping("/sheetList.do")
    public String sheetList(@RequestParam String fileName, @RequestParam String fileType) {
        if (!("xls".equals(fileType) || "xlsx".equals(fileType))) {
            return JsonTool.makeResultJson(false, "任务文件不是表格文件");
        }
        List<String> list = taskService.getSheetName(fileName, fileType);
        if (list == null || list.size() == 0) {
            return JsonTool.makeResultJson(false, "任务文件表格解析失败");
        }
        return JsonTool.obj2json(list);
    }

    @RequestMapping("/cancelCreateTask.do")
    public String cancelCreateTask(@RequestParam String fileName, @RequestParam String fileType) {
        File file = new File("task_files" + File.separator + fileName + "." + fileType);
        if(file.exists()){
            file.delete();
        }
        return JsonTool.makeResultJson(true, null);
    }

    @RequestMapping("/createTask.do")
    public String createTask(HttpSession session, @RequestParam String taskJson){
        Map<String,Object> newTaskMap = (Map<String, Object>)JSON.parse(taskJson);
        User loginUser = (User)session.getAttribute("loginUserInfo");
        //newTaskMap.put("createId",loginUser.getUserId());
        newTaskMap.put("createId","0");
        boolean flag = taskService.createTask(newTaskMap);
        return JsonTool.makeResultJson(flag, null);
    }
}

package club.yanghaobo.controller;

import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.entity.Task;
import club.yanghaobo.entity.User;
import club.yanghaobo.service.ITaskService;
import club.yanghaobo.tool.IdTool;
import club.yanghaobo.tool.JsonTool;
import com.alibaba.fastjson.JSON;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLEncoder;
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
        if("@none".equals(fileName) && "@none".equals(fileType)){
            return JsonTool.makeResultJson(true, null);
        }
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

    @RequestMapping("/detailedProgress.do")
    public String detailedProgress(@RequestParam String taskId){
        return JsonTool.obj2json(taskService.detailedProgress(taskId));
    }

    @RequestMapping("/download.do")
    public ResponseEntity<InputStreamResource> download(@RequestParam String taskId) throws IOException{
        Task task = taskService.getTaskInfo(taskId);
        String filePath = "task_files"+File.separator+taskId+"."+task.getType();
        FileSystemResource file = new FileSystemResource(filePath);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Content-Disposition", "attachment; filename=" + URLEncoder.encode(task.getTaskName(), "UTF-8")+"."+task.getType());
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        String contentType = "application/octet-stream";
        if("doc".equals(task.getType())){
            contentType = "application/msword";
        }else if("docx".equals(task.getType())){
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }else if("xls".equals(task.getType())){
            contentType = "application/vnd.ms-excel";
        }else if("xlsx".equals(task.getType())){
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentLength(file.contentLength())
                .contentType(MediaType.parseMediaType(contentType))
                .body(new InputStreamResource(file.getInputStream()));
    }

    @RequestMapping("/finishTask.do")
    public String finishTask(@RequestParam String taskId){
        boolean flag = taskService.finishTask(taskId);
        return JsonTool.makeResultJson(flag, null);
    }
}

package club.yanghaobo.controller;

import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.service.ITaskService;
import club.yanghaobo.tool.IdTool;
import club.yanghaobo.tool.JsonTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
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
}

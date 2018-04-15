package club.yanghaobo.controller;

import club.yanghaobo.entity.DataTableResult;
import club.yanghaobo.service.ITaskService;
import club.yanghaobo.tool.JsonTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/tc/task")
public class TaskController {

    @Autowired
    private ITaskService taskService;

    @RequestMapping("/list.do")
    public String list(@RequestParam Map<String,Object> params){
        if(params.get("start") == null){
            params.put("start","0");
        }
        if(params.get("length") == null){
            params.put("length","15");
        }
        DataTableResult result = taskService.getTaskList(params);
        return JsonTool.obj2json(result);
    }
}

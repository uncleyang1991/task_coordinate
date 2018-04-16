package club.yanghaobo.controller;

import club.yanghaobo.entity.Department;
import club.yanghaobo.service.IDepartmentService;
import club.yanghaobo.tool.JsonTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tc/dept")
public class DepartmentController {

    @Autowired
    private IDepartmentService departmentService;

    @RequestMapping("/list.do")
    public String list(){
        List<Department> list = departmentService.getAllDept();
        return JsonTool.obj2json(list);
    }
}

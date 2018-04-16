package club.yanghaobo.service;

import club.yanghaobo.dao.DepartmentDao;
import club.yanghaobo.entity.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements IDepartmentService{

    @Autowired
    private DepartmentDao departmentDao;

    @Override
    public List<Department> getAllDept() {
        return departmentDao.getAllDept();
    }
}

package club.yanghaobo.dao;

import club.yanghaobo.entity.Department;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentDao {

    List<Department> getAllDept();
}
package club.yanghaobo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("club.yanghaobo.dao")
public class TaskCoordinateApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskCoordinateApplication.class, args);
	}
}

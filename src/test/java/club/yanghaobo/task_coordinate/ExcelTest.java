package club.yanghaobo.task_coordinate;

import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Sheet;

import java.io.File;
import java.io.FileInputStream;

public class ExcelTest{
    public static void main(String[] args) throws Exception{
        File file = new File("E://qbzd//task_files//fd208447863b447f87e912cb72b5d8f1.xls");
        HSSFWorkbook workbook = new HSSFWorkbook(new FileInputStream(file));
        HSSFSheet sheet = workbook.getSheet("表一");
        System.out.println(sheet.getLastRowNum());
    }

}

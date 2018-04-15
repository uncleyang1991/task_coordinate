package club.yanghaobo.base64;

import sun.misc.BASE64Encoder;

public class Base64Encode {

    private final static String token = "qbzd";

    public static String encode(String text){
        text += token;
        BASE64Encoder encoder = new BASE64Encoder();
        return encoder.encode(text.getBytes());
    }
}

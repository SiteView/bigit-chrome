package bigit.downloader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.aliyun.openservices.ClientConfiguration;
import com.aliyun.openservices.ClientException;
import com.aliyun.openservices.oss.OSSClient;
import com.aliyun.openservices.oss.OSSException;
import com.aliyun.openservices.oss.model.ObjectMetadata;

public class AliyunOSSApi {
	private static final String ACCESS_ID = "lrJnbWG6iTqpTi4e";
	private static final String ACCESS_KEY = "roPMYlYUEaVWNNLPfcCxL50KCYVBR6";
	private static final String OSS_ENDPOINT = "http://oss-cn-hangzhou.aliyuncs.com/";
	private static final String bucketName = "test-bigit";
	
	private static OSSClient init(){
		ClientConfiguration config = new ClientConfiguration();
		OSSClient client = new OSSClient(OSS_ENDPOINT, ACCESS_ID, ACCESS_KEY, config);
		return client;
	}
	
	public static boolean updateApk(String apkName, String apkFile, String title, String version){
		OSSClient client = init();
		Map<String,String> meta = new HashMap<String,String>();
		meta.put("title", title);
		meta.put("version", version);
		
		try {
			uploadFile(client, bucketName, apkName+".apk", apkFile,"application/vnd.android.package-archive",meta);
		} catch (OSSException | ClientException | FileNotFoundException e) {
			e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	public static URL downloadApk(String apkName){
		OSSClient client = init();
		String key = apkName + ".apk";
		ObjectMetadata meta = client.getObjectMetadata(bucketName, key);
		if (meta!=null){
			Date dt = new Date(new Date().getTime()+60000);
			return client.generatePresignedUrl(bucketName, key, dt);
		}
		return null;
	}
	
	private static void uploadFile(OSSClient client, String bucketName,
			String key, String filename, String contentType,Map<String, String> meta)
			throws OSSException, ClientException, FileNotFoundException {
		
		File file = new File(filename);

		ObjectMetadata objectMeta = new ObjectMetadata();
		objectMeta.setContentLength(file.length());

		if (meta != null)
			objectMeta.setUserMetadata(meta);
		// 可以在metadata中标记文件类型
		objectMeta.setContentType(contentType);

		InputStream input = new FileInputStream(file);
		client.putObject(bucketName, key, input, objectMeta);
	}
}

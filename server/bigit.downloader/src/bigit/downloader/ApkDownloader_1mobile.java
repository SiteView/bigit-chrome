package bigit.downloader;

import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

public class ApkDownloader_1mobile extends ApkDownloader {
	
	public ApkDownloader_1mobile(String apkname, HttpServletResponse resp) {
		super(apkname, resp);
	}

	@Override
	public boolean run() {
		String strUrl = "http://package.1mobile.com/d.php?pkg=" + this.getApkName()
				+ "&channel=304";
		CloseableHttpClient httpclient = HttpClients.createDefault();
		HttpServletResponse httpres = this.getResp();
		String pkg = this.getApkName();
		int b;
		try{
			HttpGet httpGet = new HttpGet(strUrl);
			CloseableHttpResponse response1 = httpclient.execute(httpGet);
			for (Header hd : response1.getAllHeaders()) {
				System.out.println("header:[" + hd.getName() + "]=["
						+ hd.getValue() + "]");
				httpres.addHeader(hd.getName(), hd.getValue());
			}
			httpres.setHeader("Content-Disposition", "attachment; filename="
					+ pkg + ".apk");
			HttpEntity entity1 = response1.getEntity();
			InputStream is = entity1.getContent();
	
			OutputStream os = httpres.getOutputStream();
			while ((b = is.read()) != -1) {
				os.write(b);
				for(OutputStream os2 : this.getOtherOutputStreams()){
					os2.write(b);
				}
			}
			os.flush();
			response1.close();
			return true;
		}catch(Exception e){
			e.printStackTrace();
		}

		return false;
	}

}

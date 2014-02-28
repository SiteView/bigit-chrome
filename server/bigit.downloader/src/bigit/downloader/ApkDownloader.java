package bigit.downloader;

import java.io.OutputStream;
import java.util.ArrayList;

import javax.servlet.http.HttpServletResponse;

/*
 *  apk downloader
 */
public abstract class ApkDownloader {
	String apkName;
	HttpServletResponse resp;
	ArrayList<OutputStream> oss;
	
	public ApkDownloader(String apkname, HttpServletResponse resp){
		this.apkName = apkname;
		this.resp = resp;
		this.oss = new ArrayList<OutputStream>();
	}
	
	/*
	 * add output stream to downloader
	 */
	public void addOtherOutputStream(OutputStream os){
		oss.add(os);
	}
	
	/*
	 * get all output stream
	 */
	public ArrayList<OutputStream> getOtherOutputStreams(){
		return oss;
	}
	
	/*
	 * abstract methon run
	 */
	public abstract boolean run();

	/*
	 * get name of apk
	 */
	public String getApkName() {
		return apkName;
	}

	/*
	 * get http response object
	 */
	public HttpServletResponse getResp() {
		return resp;
	}
}

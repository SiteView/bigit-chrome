package bigit.downloader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import Siteview.IAuthenticationBundle;
import Siteview.Operators;
import Siteview.SiteviewException;
import Siteview.SiteviewQuery;
import Siteview.SiteviewValue;
import Siteview.UpdateResult;
import Siteview.Api.BusinessObject;
import Siteview.Api.ISiteviewApi;
import Siteview.Api.SiteviewApi;
import Siteview.Asd.AuthenticationBundle;
import Siteview.thread.IPrincipal;

public class BigitDl implements javax.servlet.Servlet {

	private ISiteviewApi api = null;
	private IPrincipal principal;
	private String localDir;

	@Override
	public void init(ServletConfig config) throws ServletException {
		localDir = "d:\\cache";
		boolean ret = initApi();
		System.out.println("bigit download servlet init:" + ret);
		TorrentTracker.start(localDir);
	}

	@Override
	public ServletConfig getServletConfig() {
		return null;
	}

	@Override
	public void service(ServletRequest req, ServletResponse res)
			throws ServletException, IOException {
		int b;
		String pkg = req.getParameter("pkg");
		javax.servlet.http.HttpServletResponse httpres = (HttpServletResponse) res;

		String filepath;
		filepath = getPath(pkg);
		
		//数据库里有记录
		if (filepath.length()>0) {
			File f = new File(filepath);
			
//				URL url = AliyunOSSApi.downloadApk(pkg);
//				if (url!=null){
//					httpres.sendRedirect(url.toString());
			if (f.exists()){
				FileInputStream is = new FileInputStream(f);
				if (f.getAbsolutePath().endsWith(".apk")){
					httpres.setHeader("Content-Disposition", "attachment; filename="
							+ pkg + ".apk");
					httpres.setContentType("application/vnd.android.package-archive");
				}else if (f.getAbsolutePath().endsWith(".torrent")){
					httpres.setHeader("Content-Disposition", "attachment; filename="
							+ f.getName());
					//httpres.setContentType("application/vnd.android.package-archive");
				}
				httpres.setContentLength((int) f.length());
				OutputStream os = res.getOutputStream();
				while ((b = is.read()) != -1) {
					os.write(b);
				}
				os.flush();
				
				return ;
			}
		} 
		{
			
			File fd = new File(localDir + File.separator +pkg.substring(0, 6) );
			if (!fd.exists()) fd.mkdirs();
			
			filepath = pkg.substring(0, 6)+File.separator + pkg + ".apk";
			File f = new File(localDir +File.separator +filepath);
			File f2 = new File(f.getAbsolutePath()+".tmp");
			FileOutputStream fos = new FileOutputStream(f2);
			
			ApkDownloader down = new ApkDownloader_wandoujia(pkg, httpres);
	
			down.addOtherOutputStream(fos);

			boolean ret =down.run();
			
			fos.close();
			
			//更新到数据库
			if (ret){
				if (f.exists())f.delete();
				f2.renameTo(f);
				String torrentFile = f.getAbsolutePath()+".torrent";
				//String[] vn = ApkTool.unZip(f.getAbsolutePath(), fd.getAbsolutePath()+File.separator+pkg+".png");
				String[] vn = AaptTool.unZip(f.getAbsolutePath(), fd.getAbsolutePath()+File.separator+pkg+".png");
				//if (AliyunOSSApi.updateApk(pkg, f.getAbsolutePath(), vn[2], vn[0]))
				//大文件，生成torrent文件
				if (f.length()>10000000){
					TorrentFile.create(torrentFile, f.getAbsolutePath());
					TorrentTracker.announce(torrentFile);
					updateApkPath(pkg, torrentFile,vn[2],vn[0]);
				}else
					updateApkPath(pkg, f.getAbsolutePath(),vn[2],vn[0]);
				System.out.println("download done!");
			}else{
				f2.delete();
			}
		}
	}

	/*
	 *  get apk location from database
	 */
	private String getPath(String pkg) {
		if (initApi()){
			Siteview.thread.Thread.set_CurrentPrincipal(principal);
			try{
			SiteviewQuery query =new SiteviewQuery();
			query.set_BusinessObjectName("MobileApp");
			query.set_BusObSearchCriteria(query.get_CriteriaBuilder().FieldAndValueExpression("AppId", Operators.Equals, pkg));
			BusinessObject bo = api.get_BusObService().GetBusinessObject(query);
			if (bo!=null){
				String rPath = bo.GetField("AppLocation").get_Value().ToText();
				return rPath;
			}
			}catch(SiteviewException e){
				e.printStackTrace();
			}
		}
		return "";
	}
	
	/*
	 * update apk's path,if not exist,create new one.
	 */
	public boolean updateApkPath(String apkId, String path, String name, String version){
		if (initApi()){
			Siteview.thread.Thread.set_CurrentPrincipal(principal);
			try{
				SiteviewQuery query =new SiteviewQuery();
				query.set_BusinessObjectName("MobileApp");
				query.set_BusObSearchCriteria(query.get_CriteriaBuilder().FieldAndValueExpression("AppId", Operators.Equals, apkId));
				BusinessObject bo = api.get_BusObService().GetBusinessObject(query);
				if (bo!=null){
					bo.GetField("AppLocation").SetValue(new SiteviewValue(path));
					bo.GetField("AppTitle").SetValue(new SiteviewValue(name));
					bo.GetField("AppVer").SetValue(new SiteviewValue(version));
				}else{
					bo = api.get_BusObService().Create("MobileApp");
					bo.GetField("AppId").SetValue(new SiteviewValue(apkId));
					bo.GetField("AppLocation").SetValue(new SiteviewValue(path));
					bo.GetField("AppTitle").SetValue(new SiteviewValue(name));
					bo.GetField("AppVer").SetValue(new SiteviewValue(version));
				}
				UpdateResult ur =bo.SaveObject(api, false, false);
				if (!ur.get_Success()){
					System.err.println(ur.get_ErrorMessages());
				}
			}catch(SiteviewException e){
				e.printStackTrace();
			}
		}
		return true;
	}

	@Override
	public String getServletInfo() {
		return null;
	}

	@Override
	public void destroy() {
	}

	/*
	 *  init siteview api
	 */
	private boolean initApi() {
		if (api == null) {
			api = SiteviewApi.get_CreateInstance();
		}
		try {
			if (api.get_LoggedIn()) return true;
			
			api.Connect(System.getProperty("bigit.downloader.connection"));
			// api.get_BusObEventPublisher().Register(new ServerSideRuleExecutor(api));

			IAuthenticationBundle ab = AuthenticationBundle.Create();
			ab.set_AuthenticationId(System.getProperty("bigit.downloader.username"));
			ab.set_Password(System.getProperty("bigit.downloader.password"));

			boolean ret = api.Login(ab);
			if (ret) {
			} else {
				api.Disconnect();
			}

			principal = Siteview.thread.Thread.get_CurrentPrincipal();
			return ret;
		} catch (SiteviewException e) {
			e.printStackTrace();
			return false;
		}
	}

}

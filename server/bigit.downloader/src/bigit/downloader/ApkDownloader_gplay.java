package bigit.downloader;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.servlet.http.HttpServletResponse;

import com.gc.android.market.api.MarketSession;
import com.gc.android.market.api.model.Market.GetAssetResponse.InstallAsset;
import com.google.protobuf.Descriptors.FieldDescriptor;

public class ApkDownloader_gplay extends ApkDownloader {

	public ApkDownloader_gplay(String apkname, HttpServletResponse resp) {
		super(apkname, resp);
	}

	@Override
	public boolean run() {
		try {
			MarketSession session = new MarketSession(true);
			String assetId = this.getApkName();
			HttpServletResponse httpres = this.getResp();

			GplayAccount ga = GplayAccountPool.Instance().getOne();
			if (ga==null){
				System.err.println("no valid google account");
			}
			System.out.println("Google Login...");
			session.login(ga.getName(), ga.getPass(), ga.getAndroidId());
			System.out.println("Google Login done");

			InstallAsset ia = session.queryGetAssetRequest(assetId)
					.getInstallAsset(0);
			for(FieldDescriptor fd:ia.getAllFields().keySet()){
				System.out.println(fd.getFullName()+":"+ia.getField(fd));
			}
			String cookieName = ia.getDownloadAuthCookieName();
			String cookieValue = ia.getDownloadAuthCookieValue();
			URL url = new URL(ia.getBlobUrl());

			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.setRequestProperty("User-Agent",
					"Android-Market/2 (sapphire PLAT-RC33); gzip");
			conn.setRequestProperty("Cookie", cookieName + "=" + cookieValue);

			httpres.setHeader("Content-Disposition", "attachment; filename="
					+ assetId + ".apk");
			if (conn.getHeaderField("Content-Length") != null)
				httpres.setHeader("Content-Length",conn.getHeaderField("Content-Length"));
			
			InputStream inputstream = (InputStream) conn.getInputStream();
			OutputStream os = httpres.getOutputStream();

			byte buf[] = new byte[1024];
			int k = 0;
			for (long l = 0L; (k = inputstream.read(buf)) != -1; l += k) {
				os.write(buf, 0, k);
				for (OutputStream os2 : this.getOtherOutputStreams()) {
					os2.write(buf, 0, k);
				}
			}
			inputstream.close();
			os.flush();
			return true;
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return false;
	}

}

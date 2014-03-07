package bigit.downloader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Arrays;

import com.turn.ttorrent.common.Torrent;

public class TorrentFile {
	//private static String annonceUrl = "http://down.bigit.com:6969/announce";
	private static String annonceUrl = "http://localhost:6969/announce";

	public static boolean create(String torrentFile, String file) {
		try {
			OutputStream fos = new FileOutputStream(torrentFile);
			File source = new File(file);
			if (!source.exists() || !source.canRead()) {
				throw new IllegalArgumentException(
						"Cannot access source file or directory "
								+ source.getName());
			}

			URI announceURI = new URI(annonceUrl);
			String creator = String.format("%s (ttorrent)",
					System.getProperty("user.name"));

			Torrent torrent = null;
			if (source.isDirectory()) {
				File[] files = source.listFiles();
				Arrays.sort(files);
				torrent = Torrent.create(source, Arrays.asList(files),
						announceURI, creator);
			} else {
				torrent = Torrent.create(source, announceURI, creator);
			}
			torrent.save(fos);
			
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}
	
	
}

package bigit.downloader;

import java.io.File;
import java.io.FilenameFilter;
import java.net.InetSocketAddress;

import com.turn.ttorrent.tracker.TrackedTorrent;
import com.turn.ttorrent.tracker.Tracker;

/*
 * Tracker Torrent File
 */
public class TorrentTracker {
	private static Tracker t;
	/*
	 * start tracker service
	 */
	public static boolean start(String dir){
		
		if (t != null) return false;
		
//		BasicConfigurator.configure(new ConsoleAppender(
//				new PatternLayout("%d [%-25t] %-5p: %m%n")));

		String directory = dir.length() > 0	? dir	: ".";
		FilenameFilter filter = new FilenameFilter() {
			@Override
			public boolean accept(File dir, String name) {
				File f = new File(dir.getAbsolutePath()+File.separator + name);
				return name.endsWith(".torrent")||f.isDirectory();
			}
		};
		
		try {
			t = new Tracker(new InetSocketAddress(Tracker.DEFAULT_TRACKER_PORT));

			File parent = new File(directory);
			for (File f : parent.listFiles(filter)) {
				if (!f.isDirectory()){
					System.out.println("Loading torrent from " + f.getName());
					t.announce(TrackedTorrent.load(f));
				}else{
					for (File f2 : f.listFiles(filter)) {
						if (!f2.isDirectory()){
							System.out.println("Loading torrent from " + f2.getName());
							t.announce(TrackedTorrent.load(f2));
						}
					}
				}
			}
			
			

			System.out.println(String.format("Starting tracker with %s announced torrents...",
				t.getTrackedTorrents().size()));
			new Thread(new Runnable(){

				@Override
				public void run() {
					t.start();
				}}).run();

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}
	
	/*
	 * stop tracker service
	 */
	public static boolean stop(){
		if (t!=null){
			t.stop();
			t = null;
		}
		return true;
	}
	
	/*
	 * announce a torrent file
	 */
	public static boolean announce(String torrentFile){
		if (t == null)
			return false;
		try{
			File f = new File(torrentFile);
			if (!f.exists()) 
			{
				System.err.println("torrent file not exist.");
				return false;
			}
			TrackedTorrent tt = TrackedTorrent.load(f);
			t.announce(tt);
			return true;
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}
	}
}

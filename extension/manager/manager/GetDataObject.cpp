

#include "phone.pb.h"

#include "base64/base64.h"

#include "TinyThread/fast_mutex.h"

#include<string>
#include <string.h>
#include <stdlib.h>
#include "plugin.h"
#if defined(WIN32)
#include <Windows.h>
#include <atlstr.h>
#include <sstream>
#include <iostream>
#include <fstream>
#endif


#include "Tool.h"

#include "GetDataObject.h"

using namespace std;
using namespace tthread;

//ofstream outdata;

	PhoneDataObject::PhoneDataObject()
	{
	//	outdata.open("c:\\out.dat",ios_base::app | ios_base::out);
	//	outdata << "start.."; 
	};
	PhoneDataObject::~PhoneDataObject()
	{
	//	outdata.close();
	};
	bool PhoneDataObject::checkDevice()
	{
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, "devices");
		string all = CString2String(ss);
		string::size_type re = all.find("device");
		if(re == std::string::npos ||  all.size() < strlen("List of devices attached +device") )
		{
			if(hasDeviceInf)
			{
				hasDeviceInf = false;
				PhoneDataObject::DeviceInf.clear();
			}
			if(hasApplist)
			{
				hasApplist = false;
				AppList.clear();
			}
	//		outdata << "connected error" << endl;
	//		outdata.flush();
			return false;
		}
		else
		{
//			outdata << "connected" << endl;
//			outdata.flush();
			return true;
		}
		return false;
	}
	void PhoneDataObject::GetDeviceInf()
	{
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, "shell cat /system/build.prop");
		std::string pmodel = GetKeyValue(ss, CString("product.model="));
        std::string pbrand = GetKeyValue(ss, CString("product.brand="));
        std::string pname = GetKeyValue(ss, CString("product.name="));
        std::string pcpu = GetKeyValue(ss, CString("product.cpu"));

        ss =  ExecuteExternalFile(ADB_COMMAND_PATH, "shell getprop ro.serialno"); // 获取sn
        ss = ss.Trim();

        std::string psn = CString2String(ss);

        ss =  ExecuteExternalFile(ADB_COMMAND_PATH, "shell dumpsys iphonesubinfo"); // 获取imei 号

        std::string imei = GetKeyValue(ss, CString("Device ID = "));

        ss =  ExecuteExternalFile(ADB_COMMAND_PATH, "shell cat /sys/class/net/wlan0/address"); // 获取mac地址

        std::string pmac = CString2String(ss);
        int first = pcpu.find("=");
        pcpu = pcpu.substr(first + 1, pcpu.size() - first - 1);
        bigit::DeviceInfo devinf;
        devinf.set_brand(pbrand);
        devinf.set_model(pmodel);
        devinf.set_name(pname);
        devinf.set_sn(psn);
        devinf.set_cpu(pcpu);
        devinf.set_imei(imei);
		if (pmac.find("No such file")>0)
			devinf.set_mac("");
		else
			devinf.set_mac(pmac);
        //int size = devinf.ByteSize();
		devinf.SerializeToString(&DeviceInf);
		hasDeviceInf = true;
		//outdata << "get deviceinf" << DeviceInf << endl;
	};
	void PhoneDataObject::GetApplist()
	{
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, "shell pm list packages -3 -f");

        bigit::AppList plist;
        int last = 0;
        int first = 0;
        int cout = 0;
        char pname_[128];

        std::string pname;
        std::string all;

        for (int i = 0; ss.GetLength() > 2 ; i++)
        {
            last = ss.Find(CString("\x0d\x0d\0a")); // 行结束

            std::string ssline = CString2String(ss.Mid(first, last)); // 取得一行

            string::size_type de = ssline.find("=");  //等号后为软件名

            if(de  != std::string::npos)
            {
                pname = ssline.substr(de + 1, ssline.size() - de - 1); //name

                // std::string path = ssline.substr(8, de - 1); //path

                sprintf(pname_, "shell dumpsys package %s", pname.c_str());

                CString sub = ExecuteExternalFile(ADB_COMMAND_PATH, pname_); //  详细信息

                std::string pversionname = GetKeyValue(sub, CString("versionName="));

                std::string resourcePath =  GetKeyValue(sub, CString("resourcePath="));

                bigit::AppInfo *pnewapp = plist.add_app();

                sprintf(pname_, "shell ls -s %s", resourcePath.c_str());

                sub = ExecuteExternalFile(ADB_COMMAND_PATH, pname_); //  大小

                std::string  line = CString2String(sub);

                string::size_type  split = line.find_first_of(" ");

                std::string psize = line.substr(0, split);
				std::string fsize;
				FormatSize(psize,fsize,1);

                pnewapp->set_name(pname);
                pnewapp->set_id(pname);
                pnewapp->set_version(pversionname);

                pnewapp->set_size(fsize);
                pnewapp->set_location(resourcePath);
                pnewapp->set_icodata(pname);
                all = all + pname + pversionname + resourcePath;
//               outdata <<  pname  << " " << pversionname << " " << resourcePath << endl;
            }
            ss = ss.Mid(last + 3, ss.GetLength() - (last + 3));
        }
        std::string aProtocolBuffer;
        plist.SerializeToString(&aProtocolBuffer);
        AppList = base64_encode(reinterpret_cast<const unsigned char *>(aProtocolBuffer.c_str()), aProtocolBuffer.length());
		hasApplist = true;
	}

bool PhoneDataObject::m_break = false;
bool PhoneDataObject::isConnected = false;
bool PhoneDataObject::hasDeviceInf = false;
bool PhoneDataObject::hasApplist = false;
string PhoneDataObject::DeviceInf;
string PhoneDataObject::AppList;


unsigned WINAPI  Run(void *aArg)
{
//	outdata << "run.." << endl; 

	for(;;)
	{
		if(PhoneDataObject::m_break)
		{
	//		outdata << "break.." << endl; 
			break;
		}
		PhoneDataObject::isConnected = PhoneDataObject::checkDevice();
		if(PhoneDataObject::isConnected && !PhoneDataObject::hasDeviceInf)
		{
			PhoneDataObject::GetDeviceInf();
		}
		if(PhoneDataObject::isConnected && !PhoneDataObject::hasApplist)
		{
			PhoneDataObject::GetApplist();
		}
		Sleep(5000);

	}
	return 0;
};

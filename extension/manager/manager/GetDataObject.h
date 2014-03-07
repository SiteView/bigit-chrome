#ifndef GETDATAOBJECT_h_
 #define GETDATAOBJECT_h_

#include <base64/base64.h>

#include <TinyThread/tinythread.h>
#include <TinyThread/fast_mutex.h>

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

using namespace std;
using namespace tthread;

ofstream outdata;



class PhoneDataObject
{
public:
	PhoneDataObject()
	{
	//	outdata.open("c:\\out.dat");
	};
	~PhoneDataObject()
	{
	//	outdata.close();
	};
	void start()
	{
		thread task(Run, 0);
		task.join();

	};
static	bool checkDevice()
	{
		CString ss = ExecuteExternalFile(ADB_COMMAND_PATH, "devices");
		string all = CString2String(ss);
		string::size_type re = all.find("device");
		if(re == std::string::npos )
		{
			hasDeviceInf = false;
			outdata << "connected error" << endl;
			outdata.flush();
			return false;
		}
		else
		{
			outdata << "connected" << endl;
			outdata.flush();
			return true;
		}
		return false;
	}
static	void GetDeviceInf()
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
        devinf.set_mac(pmac);
        //int size = devinf.ByteSize();
		devinf.SerializeToString(&DeviceInf);
		hasDeviceInf = true;
		//outdata << "get deviceinf" << DeviceInf << endl;
	};

static void Run(void *aArg)
{
	while(true)
	{
		if(m_break)
			break;
		//isConnected = checkDevice();
		//if(isConnected && !hasDeviceInf)
		//{
		//	GetDeviceInf();
		//}
 		Sleep(100000);
	}
};
static void DoBreak()
{
	m_break	= true;
};

static bool isConnected;
string AppList;
static bool hasDeviceInf;
static string DeviceInf;
private:
static	bool m_break;

};

bool PhoneDataObject::m_break = false;
bool PhoneDataObject::isConnected = false;
bool PhoneDataObject::hasDeviceInf = false;
string PhoneDataObject::DeviceInf;

#endif
#ifndef GETDATAOBJECT_h_

#define GETDATAOBJECT_h_


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


using namespace std;
using namespace tthread;


unsigned WINAPI Run(void *aArg);

class PhoneDataObject
{
public:
	PhoneDataObject();

	~PhoneDataObject();
	void start()
	{
//		outdata << "do run.." << endl; 
		m_handle = (HANDLE)_beginthreadex(NULL, 0,Run, 0, 0, NULL);

		//WaitForSingleObject(m_handle, INFINITE);

	};
	void stop()
	{
		m_break = true;
		CloseHandle(m_handle);
	}
static	bool checkDevice();

static	void GetDeviceInf();
static	void  GetApplist();


static void DoBreak()
{
//	outdata << "break" << endl;
	m_break	= true;
};

static bool isConnected;
static string AppList;
static bool hasApplist;
static bool hasDeviceInf;
static string DeviceInf;
static	bool m_break;
private:

HANDLE m_handle;

};


unsigned WINAPI  Run(void *aArg);


#endif
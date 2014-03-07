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



using namespace std;
using namespace tthread;


class PhoneDataObject
{
public:
	PhoneDataObject();
	~PhoneDataObject();

static void Run(void *aArg)
{
	while(true)
	{
		if(m_break)
			break;
		this_thread::sleep_for(chrono::milliseconds(100));
	}
};
void DoBreak()
{
	m_break	= true;
};

bool isConnected;
string AppList;
private:
static	bool m_break;

};

bool PhoneDataObject::m_break = false;

#endif
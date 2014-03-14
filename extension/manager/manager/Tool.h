
#ifndef TOOL_h_
#define TOOL_h_

#include<string>
#include<vector>
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

#include "TinyThread\fast_mutex.h"

using namespace std;

#define ADB_COMMAND_PATH  "adb.exe"

CString ExecuteExternalFile(CString csExeName, CString csArguments);

string trim(const string &str);

int split(const string &str, std::vector<string> &ret_, string sep = ",") ;

string replace(const string &str, const string &src, const string &dest);


#ifdef UNCODE
std::string CString2String(CString _input);

#else
std::string CString2String(CString _input);

#endif

std::string GetKeyValue(CString all, CString key);


void GetDataThread(void *aArg);

void clean_string(char *str);

CString ExecuteExternalFile(CString csExeName, CString csArguments);

// read a token from line
int ReadToken(std::string src, int start, char tc, std::string& out);

bool FormatSize(std::string src, std::string& out, int unit);


#endif
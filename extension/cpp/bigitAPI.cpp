/**********************************************************\

  Auto-generated bigitAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"
#include "bigitAPI.h"
#include "fstream"
#include <string>
#include <iostream>
#include <stdio.h>
using namespace std;
///////////////////////////////////////////////////////////////////////////////
/// @fn FB::variant bigitAPI::echo(const FB::variant& msg)
///
/// @brief  Echos whatever is passed from Javascript.
///         Go ahead and change it. See what happens!
///////////////////////////////////////////////////////////////////////////////
FB::variant bigitAPI::echo(const FB::variant& msg)
{
    static int n(0);
    fire_echo("So far, you clicked this many times: ", n++);
    ofstream file;
    file.open("file.txt");      
    file<<"Hello file/n"<<75;       
    file.close();       
    // return "foobar";
    return msg;
}

///////////////////////////////////////////////////////////////////////////////
/// @fn bigitPtr bigitAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////
bigitPtr bigitAPI::getPlugin()
{
    bigitPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

// Read/Write property testString
std::string bigitAPI::get_testString()
{
    return m_testString;
}

void bigitAPI::set_testString(const std::string& val)
{
    m_testString = val;
}

// Read-only property version
std::string bigitAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void bigitAPI::testEvent()
{
    fire_test();
}

std::string bigitAPI::exec(const char* cmd) {
    FILE* pipe = popen(cmd, "r");
    if (!pipe) return "ERROR";
    char buffer[128];
    std::string result = "";
    while(!feof(pipe)) {
        if(fgets(buffer, 128, pipe) != NULL)
            result += buffer;
    }
    pclose(pipe);
    return result;
}
std::string getExec(string appid){
    string execStr("python ~/workspace/chrome/gplay-downloader.py --email ec.huyinghuan@gmail.com --password 0O.O0-00O --name @appid@ --country China --operator 'China Mobile' --device 32F64DC4664CF48F");
    string dest("@appid@");
    execStr.replace(execStr.find(dest),dest.size(),appid);
    return execStr;
}

FB::variant bigitAPI::mytest(const FB::variant& msg)
{
    //FB::variant a = exec("~/workspace/c++/hello");
    string appid = msg.convert_cast<string>();
   string execstr = getExec(appid);
//   string downloadURL = exec( "python ~/workspace/chrome/gplay-downloader.py --email ec.huyinghuan@gmail.com --password 0O.O0-00O --name com.goldrun.snaps --country China --operator 'China Mobile' --device 32F64DC4664CF48F");
    const char * execchar = execstr.c_str();
    //std::string execstr = ~/workspace/c++/hello
    FB::variant downloadURL = exec(execchar);
 //   printf("S:\t%s\n", a.c_FB::variantstr());
    return downloadURL; 
}
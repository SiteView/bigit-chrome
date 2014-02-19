/**********************************************************\

  Auto-generated helloworldAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"
#include "helloworldAPI.h"
#include "fstream"
#include <string>
#include <iostream>
#include <stdio.h>
using namespace std;
///////////////////////////////////////////////////////////////////////////////
/// @fn FB::variant helloworldAPI::echo(const FB::variant& msg)
///
/// @brief  Echos whatever is passed from Javascript.
///         Go ahead and change it. See what happens!
///////////////////////////////////////////////////////////////////////////////
FB::variant helloworldAPI::echo(const FB::variant& msg)
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
/// @fn helloworldPtr helloworldAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////
helloworldPtr helloworldAPI::getPlugin()
{
    helloworldPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

// Read/Write property testString
std::string helloworldAPI::get_testString()
{
    return m_testString;
}

void helloworldAPI::set_testString(const std::string& val)
{
    m_testString = val;
}

// Read-only property version
std::string helloworldAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void helloworldAPI::testEvent()
{
    fire_test();
}

std::string helloworldAPI::exec(const char* cmd) {
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

FB::variant helloworldAPI::mytest(const FB::variant& msg)
{
    //FB::variant a = exec("~/workspace/c++/hello");
    FB::variant a = exec("~/workspace/c++/hello");
 //   printf("S:\t%s\n", a.c_FB::variantstr());
    return a; 
}
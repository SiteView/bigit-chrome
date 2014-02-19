/**********************************************************\

  Auto-generated helloworldAPI.h

\**********************************************************/

#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "helloworld.h"
#include <variant.h>
#ifndef H_helloworldAPI
#define H_helloworldAPI

class helloworldAPI : public FB::JSAPIAuto
{
public:
    ////////////////////////////////////////////////////////////////////////////
    /// @fn helloworldAPI::helloworldAPI(const helloworldPtr& plugin, const FB::BrowserHostPtr host)
    ///
    /// @brief  Constructor for your JSAPI object.
    ///         You should register your methods, properties, and events
    ///         that should be accessible to Javascript from here.
    ///
    /// @see FB::JSAPIAuto::registerMethod
    /// @see FB::JSAPIAuto::registerProperty
    /// @see FB::JSAPIAuto::registerEvent
    ////////////////////////////////////////////////////////////////////////////
    helloworldAPI(const helloworldPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        registerMethod("echo",      make_method(this, &helloworldAPI::echo));
        //myself methed
        registerMethod("mytest",      make_method(this, &helloworldAPI::mytest));

        registerMethod("testEvent", make_method(this, &helloworldAPI::testEvent));
        
        // Read-write property
        registerProperty("testString",
                         make_property(this,
                                       &helloworldAPI::get_testString,
                                       &helloworldAPI::set_testString));
        
        // Read-only property
        registerProperty("version",
                         make_property(this,
                                       &helloworldAPI::get_version));
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn helloworldAPI::~helloworldAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~helloworldAPI() {};

    helloworldPtr getPlugin();

    // Read/Write property ${PROPERTY.ident}
    std::string get_testString();
    void set_testString(const std::string& val);

    // Read-only property ${PROPERTY.ident}
    std::string get_version();



    // Method echo
    FB::variant echo(const FB::variant& msg);
    
    
   
    // Event helpers
    FB_JSAPI_EVENT(test, 0, ());
    FB_JSAPI_EVENT(echo, 2, (const FB::variant&, const int));

    // Method test-event
    void testEvent();
    //=======================
    // Method echo
    FB::variant mytest(const FB::variant& msg);
    std::string exec(const char* cmd);
private:
    helloworldWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;

    std::string m_testString;
};

#endif // H_helloworldAPI


/**********************************************************\

  Auto-generated bigitAPI.h

\**********************************************************/

#include <string>
#include <sstream>
#include <boost/weak_ptr.hpp>
#include "JSAPIAuto.h"
#include "BrowserHost.h"
#include "bigit.h"
#include <variant.h>
#ifndef H_bigitAPI
#define H_bigitAPI

class bigitAPI : public FB::JSAPIAuto
{
public:
    ////////////////////////////////////////////////////////////////////////////
    /// @fn bigitAPI::bigitAPI(const bigitPtr& plugin, const FB::BrowserHostPtr host)
    ///
    /// @brief  Constructor for your JSAPI object.
    ///         You should register your methods, properties, and events
    ///         that should be accessible to Javascript from here.
    ///
    /// @see FB::JSAPIAuto::registerMethod
    /// @see FB::JSAPIAuto::registerProperty
    /// @see FB::JSAPIAuto::registerEvent
    ////////////////////////////////////////////////////////////////////////////
    bigitAPI(const bigitPtr& plugin, const FB::BrowserHostPtr& host) :
        m_plugin(plugin), m_host(host)
    {
        registerMethod("echo",      make_method(this, &bigitAPI::echo));
        //myself methed
        registerMethod("mytest",      make_method(this, &bigitAPI::mytest));

        registerMethod("testEvent", make_method(this, &bigitAPI::testEvent));
        
        // Read-write property
        registerProperty("testString",
                         make_property(this,
                                       &bigitAPI::get_testString,
                                       &bigitAPI::set_testString));
        
        // Read-only property
        registerProperty("version",
                         make_property(this,
                                       &bigitAPI::get_version));
    }

    ///////////////////////////////////////////////////////////////////////////////
    /// @fn bigitAPI::~bigitAPI()
    ///
    /// @brief  Destructor.  Remember that this object will not be released until
    ///         the browser is done with it; this will almost definitely be after
    ///         the plugin is released.
    ///////////////////////////////////////////////////////////////////////////////
    virtual ~bigitAPI() {};

    bigitPtr getPlugin();

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
    bigitWeakPtr m_plugin;
    FB::BrowserHostPtr m_host;

    std::string m_testString;
};

#endif // H_bigitAPI


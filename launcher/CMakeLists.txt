cmake_minimum_required(VERSION 3.20)
project(GtaViCountdown LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT WIN32)
  message(FATAL_ERROR "This launcher targets Windows (Win32 + WebView2).")
endif()

add_executable(GtaViCountdown WIN32
  src/main.cpp
  src/AppWindow.cpp
  src/app.rc
)

target_include_directories(GtaViCountdown PRIVATE src)

target_compile_definitions(GtaViCountdown PRIVATE
  UNICODE
  _UNICODE
  NOMINMAX
  WIN32_LEAN_AND_MEAN
)

# WebView2 via NuGet package path or WEBVIEW2_SDK_PATH
if(DEFINED ENV{WEBVIEW2_SDK_PATH})
  set(WEBVIEW2_SDK_PATH "$ENV{WEBVIEW2_SDK_PATH}")
endif()

if(NOT WEBVIEW2_SDK_PATH)
  # Common NuGet restore location relative to build tree
  file(GLOB WEBVIEW2_CANDIDATES
    "${CMAKE_BINARY_DIR}/_deps/webview2-src/build/native/include"
    "$ENV{USERPROFILE}/.nuget/packages/microsoft.web.webview2/*/build/native/include"
  )
  if(WEBVIEW2_CANDIDATES)
    list(GET WEBVIEW2_CANDIDATES 0 WEBVIEW2_INCLUDE)
    get_filename_component(WEBVIEW2_SDK_PATH "${WEBVIEW2_INCLUDE}/.." ABSOLUTE)
  endif()
endif()

include(FetchContent)
FetchContent_Declare(
  webview2
  URL https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2849.39
  DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(webview2)

set(WV2_ROOT "${webview2_SOURCE_DIR}/build/native")
target_include_directories(GtaViCountdown PRIVATE "${WV2_ROOT}/include")

if(CMAKE_SIZEOF_VOID_P EQUAL 8)
  set(WV2_ARCH x64)
else()
  set(WV2_ARCH x86)
endif()

target_link_libraries(GtaViCountdown PRIVATE
  "${WV2_ROOT}/lib/${WV2_ARCH}/WebView2LoaderStatic.lib"
  ole32
  oleaut32
  uuid
  user32
  gdi32
  shell32
  dwmapi
  shlwapi
)

set_target_properties(GtaViCountdown PROPERTIES
  OUTPUT_NAME "GtaViCountdown"
  WIN32_EXECUTABLE TRUE
)

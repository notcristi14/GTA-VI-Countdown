cmake_minimum_required(VERSION 3.20)
project(GtaViCountdown LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT WIN32)
  message(FATAL_ERROR "This launcher targets Windows (Win32 + WebView2).")
endif()

# --- GTA VI logo as executable icon ---
set(GTA_LOGO_ICO "")
foreach(_candidate
    "${CMAKE_CURRENT_SOURCE_DIR}/assets/GtaLogo.ico"
    "${CMAKE_CURRENT_SOURCE_DIR}/assets/app.ico"
    "${CMAKE_CURRENT_SOURCE_DIR}/../desktop/GtaViCountdownWpf/Assets/GtaLogo.ico"
)
  if(EXISTS "${_candidate}")
    set(GTA_LOGO_ICO "${_candidate}")
    break()
  endif()
endforeach()

if(NOT GTA_LOGO_ICO)
  message(FATAL_ERROR
    "GTA VI logo icon not found.\n"
    "Place GtaLogo.ico at launcher/assets/GtaLogo.ico\n"
    "(or keep desktop/GtaViCountdownWpf/Assets/GtaLogo.ico).")
endif()

file(TO_NATIVE_PATH "${GTA_LOGO_ICO}" GTA_LOGO_ICO_NATIVE)
string(REPLACE "\\" "\\\\" GTA_LOGO_ICO_RC "${GTA_LOGO_ICO_NATIVE}")

set(GENERATED_RC "${CMAKE_CURRENT_BINARY_DIR}/app_icon.rc")
file(WRITE "${GENERATED_RC}"
"#include \"${CMAKE_CURRENT_SOURCE_DIR}/src/resource.h\"\n"
"IDI_APPICON ICON \"${GTA_LOGO_ICO_RC}\"\n"
)
message(STATUS "Exe icon: ${GTA_LOGO_ICO}")

add_executable(GtaViCountdown WIN32
  src/main.cpp
  src/AppWindow.cpp
  "${GENERATED_RC}"
)

target_include_directories(GtaViCountdown PRIVATE src "${CMAKE_CURRENT_SOURCE_DIR}/src")

target_compile_definitions(GtaViCountdown PRIVATE
  UNICODE
  _UNICODE
  NOMINMAX
  WIN32_LEAN_AND_MEAN
)

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
  ole32 oleaut32 uuid user32 gdi32 shell32 dwmapi shlwapi
)

set_target_properties(GtaViCountdown PROPERTIES
  OUTPUT_NAME "GtaViCountdown"
  WIN32_EXECUTABLE TRUE
)

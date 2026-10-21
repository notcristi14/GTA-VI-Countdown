#include "AppWindow.h"

#include <windows.h>

int APIENTRY wWinMain(HINSTANCE hInstance, HINSTANCE, LPWSTR, int) {
  // STA required for WebView2 / COM
  HRESULT hr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
  if (FAILED(hr)) return 1;

  AppWindow app(hInstance);
  if (!app.Create()) {
    MessageBoxW(nullptr, L"Failed to create window.", AppWindow::kAppTitle, MB_OK | MB_ICONERROR);
    CoUninitialize();
    return 1;
  }

  const int code = app.MessageLoop();
  CoUninitialize();
  return code;
}

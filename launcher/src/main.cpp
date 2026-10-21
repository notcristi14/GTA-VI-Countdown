#include "AppWindow.h"

#include <windows.h>

int APIENTRY wWinMain(
    _In_ HINSTANCE hInstance,
    _In_opt_ HINSTANCE hPrevInstance,
    _In_ LPWSTR lpCmdLine,
    _In_ int nCmdShow) {
  (void)hPrevInstance;
  (void)lpCmdLine;
  (void)nCmdShow;

  HRESULT hr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
  if (FAILED(hr))
    return 1;

  AppWindow app(hInstance);
  if (!app.Create()) {
    MessageBoxW(nullptr, L"Failed to create window.", AppWindow::kAppTitle, MB_OK | MB_ICONERROR);
    CoUninitialize();
    return 1;
  }

  int code = app.MessageLoop();
  CoUninitialize();
  return code;
}

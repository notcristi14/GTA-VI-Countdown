#pragma once

#include <windows.h>

#include <wrl/client.h>
#include <wrl/event.h>
#include <WebView2.h>

#include <string>

class AppWindow {
public:
  static const wchar_t kClassName[];
  static const wchar_t kAppTitle[];
  static const wchar_t kHomeUrl[];

  static const COLORREF kBgDeep;
  static const COLORREF kBorder;
  static const COLORREF kTitleBar;

  explicit AppWindow(HINSTANCE instance);
  ~AppWindow();

  bool Create();
  int MessageLoop();

private:
  static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  LRESULT HandleMessage(UINT msg, WPARAM wParam, LPARAM lParam);

  void OnSize();
  void LayoutWebView();
  void InitWebView();
  void NavigateHome();
  RECT ClientArea() const;

  HINSTANCE instance_;
  HWND hwnd_;

  Microsoft::WRL::ComPtr<ICoreWebView2Controller> controller_;
  Microsoft::WRL::ComPtr<ICoreWebView2> webview_;
};

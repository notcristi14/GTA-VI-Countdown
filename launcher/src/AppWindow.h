#pragma once

#include <windows.h>

#include <wrl/client.h>
#include <WebView2.h>

#include <string>

class AppWindow {
public:
  static const wchar_t kClassName[];
  static const wchar_t kAppTitle[];
  static const wchar_t kHomeUrl[];

  static const COLORREF kBgDeep;
  static const COLORREF kTitleBar;
  static const COLORREF kStatusBar;
  static const COLORREF kBorder;
  static const COLORREF kText;
  static const COLORREF kMuted;

  static const int kTitleH;
  static const int kStatusH;

  explicit AppWindow(HINSTANCE instance);
  ~AppWindow();

  bool Create();
  int MessageLoop();

private:
  static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  LRESULT HandleMessage(UINT msg, WPARAM wParam, LPARAM lParam);

  void OnPaint();
  void OnSize();
  void LayoutWebView();
  void InitWebView();
  void NavigateHome();
  void SetStatus(const std::wstring& text);
  RECT ContentRect() const;
  RECT TitleBarRect() const;
  RECT StatusBarRect() const;

  HINSTANCE instance_;
  HWND hwnd_;
  HFONT fontTitle_;
  HFONT fontStatus_;
  std::wstring status_;

  Microsoft::WRL::ComPtr<ICoreWebView2Controller> controller_;
  Microsoft::WRL::ComPtr<ICoreWebView2> webview_;
};

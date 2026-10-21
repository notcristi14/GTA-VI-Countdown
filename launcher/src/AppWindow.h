#pragma once

#ifndef NOMINMAX
#define NOMINMAX
#endif
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif

#include <windows.h>
#include <wrl.h>
#include <WebView2.h>

#include <string>

class AppWindow {
public:
  static constexpr const wchar_t* kClassName = L"GtaViCountdownWindow";
  static constexpr const wchar_t* kAppTitle  = L"GTA VI Countdown";
  static constexpr const wchar_t* kHomeUrl   =
      L"https://gta-vi-countdown.onrender.com/eastern-europe";

  static constexpr COLORREF kBgDeep    = RGB(0x1A, 0x0A, 0x2E);
  static constexpr COLORREF kTitleBar  = RGB(0x14, 0x0A, 0x28);
  static constexpr COLORREF kStatusBar = RGB(0x10, 0x08, 0x20);
  static constexpr COLORREF kBorder    = RGB(0xFF, 0x8C, 0xC8);
  static constexpr COLORREF kText      = RGB(0xE0, 0xB0, 0xFF);
  static constexpr COLORREF kMuted     = RGB(0xA0, 0x90, 0xB0);

  static constexpr int kTitleH  = 48;
  static constexpr int kStatusH = 28;

  explicit AppWindow(HINSTANCE instance);
  ~AppWindow();

  bool Create();
  int  MessageLoop();

private:
  static LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
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

  static HICON LoadAppIcon(HINSTANCE instance, int cx, int cy);

  HINSTANCE instance_ = nullptr;
  HWND hwnd_ = nullptr;
  HFONT fontTitle_ = nullptr;
  HFONT fontStatus_ = nullptr;
  std::wstring status_ = L"Connecting...";

  Microsoft::WRL::ComPtr<ICoreWebView2Controller> controller_;
  Microsoft::WRL::ComPtr<ICoreWebView2> webview_;
};

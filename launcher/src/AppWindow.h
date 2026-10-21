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
  static const COLORREF kToolbar;
  static const COLORREF kBorder;
  static const COLORREF kTitleBar;
  static const COLORREF kBtnFace;
  static const COLORREF kBtnFaceHot;
  static const COLORREF kBtnFaceDisabled;
  static const COLORREF kBtnText;
  static const COLORREF kBtnTextDisabled;

  static const int kToolbarH;

  explicit AppWindow(HINSTANCE instance);
  ~AppWindow();

  bool Create();
  int MessageLoop();

private:
  static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);
  LRESULT HandleMessage(UINT msg, WPARAM wParam, LPARAM lParam);

  void CreateToolbar();
  void LayoutControls();
  void OnSize();
  void LayoutWebView();
  void InitWebView();
  void NavigateHome();
  void GoBack();
  void GoForward();
  void Refresh();
  void UpdateNavButtons();
  void DrawToolbarButton(const DRAWITEMSTRUCT* dis);
  RECT WebViewRect() const;

  HINSTANCE instance_;
  HWND hwnd_;
  HWND btnBack_;
  HWND btnForward_;
  HWND btnHome_;
  HWND btnRefresh_;
  HFONT fontBtn_;

  Microsoft::WRL::ComPtr<ICoreWebView2Controller> controller_;
  Microsoft::WRL::ComPtr<ICoreWebView2> webview_;
};

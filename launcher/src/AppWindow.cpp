#include "AppWindow.h"
#include "resource.h"

#include <dwmapi.h>

#pragma comment(lib, "dwmapi.lib")

using Microsoft::WRL::Callback;
using Microsoft::WRL::ComPtr;

const wchar_t AppWindow::kClassName[] = L"GtaViCountdownWindow";
const wchar_t AppWindow::kAppTitle[]  = L"GTA VI Countdown";
const wchar_t AppWindow::kHomeUrl[]   =
    L"https://gta-vi-countdown.onrender.com/eastern-europe";

const COLORREF AppWindow::kBgDeep   = RGB(0x1A, 0x0A, 0x2E);
const COLORREF AppWindow::kBorder   = RGB(0xFF, 0x8C, 0xC8);
const COLORREF AppWindow::kTitleBar = RGB(0x14, 0x0A, 0x28);

AppWindow::AppWindow(HINSTANCE instance)
    : instance_(instance), hwnd_(nullptr) {}

AppWindow::~AppWindow() {}

bool AppWindow::Create() {
  WNDCLASSEXW wc;
  ZeroMemory(&wc, sizeof(wc));
  wc.cbSize        = sizeof(WNDCLASSEXW);
  wc.style         = CS_HREDRAW | CS_VREDRAW;
  wc.lpfnWndProc   = AppWindow::WndProc;
  wc.cbClsExtra    = 0;
  wc.cbWndExtra    = 0;
  wc.hInstance     = instance_;
  wc.hCursor       = LoadCursorW(nullptr, IDC_ARROW);
  wc.hbrBackground = CreateSolidBrush(kBgDeep);
  wc.lpszMenuName  = nullptr;
  wc.lpszClassName = kClassName;

  wc.hIcon = ::LoadIconW(instance_, MAKEINTRESOURCEW(IDI_APPICON));
  if (wc.hIcon == nullptr)
    wc.hIcon = ::LoadIconW(nullptr, IDI_APPLICATION);
  wc.hIconSm = ::LoadIconW(instance_, MAKEINTRESOURCEW(IDI_APPICON));
  if (wc.hIconSm == nullptr)
    wc.hIconSm = wc.hIcon;

  if (!RegisterClassExW(&wc))
    return false;

  hwnd_ = CreateWindowExW(
      WS_EX_APPWINDOW,
      kClassName,
      kAppTitle,
      WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT,
      CW_USEDEFAULT,
      1280,
      900,
      nullptr,
      nullptr,
      instance_,
      this);

  if (!hwnd_)
    return false;

  if (wc.hIcon)
    SendMessageW(hwnd_, WM_SETICON, ICON_BIG, (LPARAM)wc.hIcon);
  if (wc.hIconSm)
    SendMessageW(hwnd_, WM_SETICON, ICON_SMALL, (LPARAM)wc.hIconSm);

  BOOL dark = TRUE;
  DwmSetWindowAttribute(hwnd_, 20, &dark, sizeof(dark));
  COLORREF border = kBorder;
  DwmSetWindowAttribute(hwnd_, 34, &border, sizeof(border));
  COLORREF caption = kTitleBar;
  DwmSetWindowAttribute(hwnd_, 35, &caption, sizeof(caption));

  ShowWindow(hwnd_, SW_SHOW);
  UpdateWindow(hwnd_);
  InitWebView();
  return true;
}

int AppWindow::MessageLoop() {
  MSG msg;
  ZeroMemory(&msg, sizeof(msg));
  while (GetMessageW(&msg, nullptr, 0, 0) > 0) {
    TranslateMessage(&msg);
    DispatchMessageW(&msg);
  }
  return (int)msg.wParam;
}

LRESULT CALLBACK AppWindow::WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
  AppWindow* self = nullptr;
  if (msg == WM_NCCREATE) {
    CREATESTRUCTW* cs = (CREATESTRUCTW*)lParam;
    self = (AppWindow*)cs->lpCreateParams;
    self->hwnd_ = hwnd;
    SetWindowLongPtrW(hwnd, GWLP_USERDATA, (LONG_PTR)self);
  } else {
    self = (AppWindow*)GetWindowLongPtrW(hwnd, GWLP_USERDATA);
  }
  if (self)
    return self->HandleMessage(msg, wParam, lParam);
  return DefWindowProcW(hwnd, msg, wParam, lParam);
}

LRESULT AppWindow::HandleMessage(UINT msg, WPARAM wParam, LPARAM lParam) {
  switch (msg) {
    case WM_SIZE:
      OnSize();
      return 0;
    case WM_ERASEBKGND:
      return 1;
    case WM_KEYDOWN:
      if (webview_) {
        if (wParam == VK_F5) {
          webview_->Reload();
          return 0;
        }
        if (wParam == VK_LEFT && (GetKeyState(VK_MENU) & 0x8000)) {
          BOOL can = FALSE;
          webview_->get_CanGoBack(&can);
          if (can)
            webview_->GoBack();
          return 0;
        }
        if (wParam == VK_RIGHT && (GetKeyState(VK_MENU) & 0x8000)) {
          BOOL can = FALSE;
          webview_->get_CanGoForward(&can);
          if (can)
            webview_->GoForward();
          return 0;
        }
        if (wParam == VK_HOME && (GetKeyState(VK_MENU) & 0x8000)) {
          NavigateHome();
          return 0;
        }
      }
      break;
    case WM_DESTROY:
      PostQuitMessage(0);
      return 0;
  }
  return DefWindowProcW(hwnd_, msg, wParam, lParam);
}

RECT AppWindow::ClientArea() const {
  RECT rc;
  GetClientRect(hwnd_, &rc);
  return rc;
}

void AppWindow::OnSize() {
  LayoutWebView();
}

void AppWindow::LayoutWebView() {
  if (!controller_)
    return;
  RECT rc = ClientArea();
  controller_->put_Bounds(rc);
}

void AppWindow::NavigateHome() {
  if (webview_)
    webview_->Navigate(kHomeUrl);
}

void AppWindow::InitWebView() {
  HWND hwnd = hwnd_;

  CreateCoreWebView2EnvironmentWithOptions(
      nullptr,
      nullptr,
      nullptr,
      Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
          [this, hwnd](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
            if (FAILED(result) || !env) {
              MessageBoxW(
                  hwnd,
                  L"WebView2 failed to start.\n\nInstall:\n"
                  L"https://developer.microsoft.com/microsoft-edge/webview2/",
                  kAppTitle,
                  MB_OK | MB_ICONWARNING);
              return result;
            }

            env->CreateCoreWebView2Controller(
                hwnd,
                Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
                    [this](HRESULT result, ICoreWebView2Controller* controller) -> HRESULT {
                      if (FAILED(result) || !controller) {
                        MessageBoxW(
                            hwnd_,
                            L"WebView2 controller failed to start.",
                            kAppTitle,
                            MB_OK | MB_ICONWARNING);
                        return result;
                      }

                      controller_ = controller;
                      controller_->get_CoreWebView2(&webview_);

                      ComPtr<ICoreWebView2Settings> settings;
                      webview_->get_Settings(&settings);
                      if (settings) {
                        settings->put_IsScriptEnabled(TRUE);
                        settings->put_AreDefaultContextMenusEnabled(TRUE);
                        settings->put_IsStatusBarEnabled(FALSE);
                        settings->put_AreDevToolsEnabled(TRUE);
                        settings->put_IsZoomControlEnabled(TRUE);
                        settings->put_AreDefaultScriptDialogsEnabled(TRUE);
                      }

                      ComPtr<ICoreWebView2Controller2> c2;
                      if (SUCCEEDED(controller_->QueryInterface(IID_PPV_ARGS(&c2))) && c2) {
                        COREWEBVIEW2_COLOR bg;
                        bg.A = 255;
                        bg.R = 0x1A;
                        bg.G = 0x0A;
                        bg.B = 0x2E;
                        c2->put_DefaultBackgroundColor(bg);
                      }

                      // Keep target=_blank / window.open inside this app
                      webview_->add_NewWindowRequested(
                          Callback<ICoreWebView2NewWindowRequestedEventHandler>(
                              [this](ICoreWebView2*, ICoreWebView2NewWindowRequestedEventArgs* args) -> HRESULT {
                                args->put_Handled(TRUE);
                                LPWSTR uri = nullptr;
                                args->get_Uri(&uri);
                                if (uri && webview_) {
                                  webview_->Navigate(uri);
                                  CoTaskMemFree(uri);
                                } else if (uri) {
                                  CoTaskMemFree(uri);
                                }
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      // All navigations stay in this WebView (no external browser)
                      webview_->add_NavigationStarting(
                          Callback<ICoreWebView2NavigationStartingEventHandler>(
                              [](ICoreWebView2*, ICoreWebView2NavigationStartingEventArgs*) -> HRESULT {
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      webview_->add_DocumentTitleChanged(
                          Callback<ICoreWebView2DocumentTitleChangedEventHandler>(
                              [this](ICoreWebView2* sender, IUnknown*) -> HRESULT {
                                LPWSTR title = nullptr;
                                sender->get_DocumentTitle(&title);
                                if (title && title[0] != 0)
                                  SetWindowTextW(hwnd_, title);
                                else
                                  SetWindowTextW(hwnd_, kAppTitle);
                                if (title)
                                  CoTaskMemFree(title);
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      LayoutWebView();
                      NavigateHome();
                      return S_OK;
                    })
                    .Get());

            return S_OK;
          })
          .Get());
}

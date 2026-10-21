#include "AppWindow.h"
#include "resource.h"

#include <dwmapi.h>

#include <cstring>

#pragma comment(lib, "dwmapi.lib")

using Microsoft::WRL::Callback;
using Microsoft::WRL::ComPtr;

namespace {

void DrawRect(HDC hdc, const RECT& r, COLORREF fill, COLORREF border) {
  HBRUSH br = CreateSolidBrush(fill);
  HPEN pen = CreatePen(PS_SOLID, 1, border);
  HGDIOBJ oldBr = SelectObject(hdc, br);
  HGDIOBJ oldPen = SelectObject(hdc, pen);
  Rectangle(hdc, r.left, r.top, r.right, r.bottom);
  SelectObject(hdc, oldBr);
  SelectObject(hdc, oldPen);
  DeleteObject(br);
  DeleteObject(pen);
}

void DrawTextLine(HDC hdc, HFONT font, COLORREF color, int x, int y, const wchar_t* text) {
  SetBkMode(hdc, TRANSPARENT);
  SetTextColor(hdc, color);
  HGDIOBJ old = SelectObject(hdc, font);
  TextOutW(hdc, x, y, text, static_cast<int>(wcslen(text)));
  SelectObject(hdc, old);
}

}  // namespace

AppWindow::AppWindow(HINSTANCE instance) : instance_(instance) {}

AppWindow::~AppWindow() {
  if (fontTitle_) DeleteObject(fontTitle_);
  if (fontStatus_) DeleteObject(fontStatus_);
}

HICON AppWindow::LoadAppIcon(HINSTANCE instance, int cx, int cy) {
  HANDLE handle = LoadImageW(
      instance,
      MAKEINTRESOURCEW(IDI_APPICON),
      IMAGE_ICON,
      cx,
      cy,
      LR_DEFAULTCOLOR);
  if (handle)
    return static_cast<HICON>(handle);

  handle = LoadImageW(
      instance,
      MAKEINTRESOURCEW(IDI_APPICON),
      IMAGE_ICON,
      0,
      0,
      LR_DEFAULTCOLOR | LR_DEFAULTSIZE);
  if (handle)
    return static_cast<HICON>(handle);

  return static_cast<HICON>(LoadImageW(
      nullptr,
      IDI_APPLICATION,
      IMAGE_ICON,
      cx,
      cy,
      LR_SHARED));
}

bool AppWindow::Create() {
  WNDCLASSEXW wc;
  ZeroMemory(&wc, sizeof(wc));
  wc.cbSize = sizeof(wc);
  wc.style = CS_HREDRAW | CS_VREDRAW;
  wc.lpfnWndProc = AppWindow::WndProc;
  wc.hInstance = instance_;
  wc.hCursor = LoadCursorW(nullptr, IDC_ARROW);
  wc.hbrBackground = CreateSolidBrush(kBgDeep);
  wc.lpszClassName = kClassName;

  // GTA VI logo from embedded resource IDI_APPICON
  wc.hIcon = LoadAppIcon(instance_, 32, 32);
  wc.hIconSm = LoadAppIcon(instance_, GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON));
  if (!wc.hIconSm)
    wc.hIconSm = wc.hIcon;

  if (!RegisterClassExW(&wc))
    return false;

  fontTitle_ = CreateFontW(
      16, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
      DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
      CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
  fontStatus_ = CreateFontW(
      12, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE,
      DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
      CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");

  hwnd_ = CreateWindowExW(
      WS_EX_APPWINDOW,
      kClassName,
      kAppTitle,
      WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT, CW_USEDEFAULT, 1280, 900,
      nullptr, nullptr, instance_, this);

  if (!hwnd_)
    return false;

  // Taskbar / Alt+Tab icon
  HICON big = LoadAppIcon(instance_, 32, 32);
  HICON small = LoadAppIcon(instance_, GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON));
  if (big)
    SendMessageW(hwnd_, WM_SETICON, ICON_BIG, reinterpret_cast<LPARAM>(big));
  if (small)
    SendMessageW(hwnd_, WM_SETICON, ICON_SMALL, reinterpret_cast<LPARAM>(small));

  BOOL dark = TRUE;
  DwmSetWindowAttribute(hwnd_, 20 /* DWMWA_USE_IMMERSIVE_DARK_MODE */, &dark, sizeof(dark));
  COLORREF border = kBorder;
  DwmSetWindowAttribute(hwnd_, 34 /* DWMWA_BORDER_COLOR */, &border, sizeof(border));
  COLORREF caption = kTitleBar;
  DwmSetWindowAttribute(hwnd_, 35 /* DWMWA_CAPTION_COLOR */, &caption, sizeof(caption));

  ShowWindow(hwnd_, SW_SHOW);
  UpdateWindow(hwnd_);
  InitWebView();
  return true;
}

int AppWindow::MessageLoop() {
  MSG msg;
  ZeroMemory(&msg, sizeof(msg));
  while (GetMessageW(&msg, nullptr, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessageW(&msg);
  }
  return static_cast<int>(msg.wParam);
}

LRESULT CALLBACK AppWindow::WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
  AppWindow* self = nullptr;
  if (msg == WM_NCCREATE) {
    CREATESTRUCTW* cs = reinterpret_cast<CREATESTRUCTW*>(lParam);
    self = static_cast<AppWindow*>(cs->lpCreateParams);
    self->hwnd_ = hwnd;
    SetWindowLongPtrW(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(self));
  } else {
    self = reinterpret_cast<AppWindow*>(GetWindowLongPtrW(hwnd, GWLP_USERDATA));
  }
  if (self)
    return self->HandleMessage(msg, wParam, lParam);
  return DefWindowProcW(hwnd, msg, wParam, lParam);
}

LRESULT AppWindow::HandleMessage(UINT msg, WPARAM wParam, LPARAM lParam) {
  switch (msg) {
    case WM_PAINT:
      OnPaint();
      return 0;
    case WM_SIZE:
      OnSize();
      return 0;
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

RECT AppWindow::TitleBarRect() const {
  RECT rc;
  GetClientRect(hwnd_, &rc);
  rc.bottom = kTitleH;
  return rc;
}

RECT AppWindow::StatusBarRect() const {
  RECT rc;
  GetClientRect(hwnd_, &rc);
  rc.top = rc.bottom - kStatusH;
  return rc;
}

RECT AppWindow::ContentRect() const {
  RECT rc;
  GetClientRect(hwnd_, &rc);
  rc.top = kTitleH;
  rc.bottom -= kStatusH;
  if (rc.bottom < rc.top)
    rc.bottom = rc.top;
  return rc;
}

void AppWindow::OnPaint() {
  PAINTSTRUCT ps;
  ZeroMemory(&ps, sizeof(ps));
  HDC hdc = BeginPaint(hwnd_, &ps);

  RECT client;
  GetClientRect(hwnd_, &client);
  DrawRect(hdc, client, kBgDeep, kBorder);

  RECT title = TitleBarRect();
  DrawRect(hdc, title, kTitleBar, kBorder);
  DrawTextLine(hdc, fontTitle_, kText, 16, 14, L"GTA VI COUNTDOWN");
  DrawTextLine(hdc, fontStatus_, kMuted, 200, 16, L"Eastern Europe  |  Live");
  DrawTextLine(hdc, fontStatus_, kText, client.right - 220, 16, L"F5 Refresh   Alt+Home");

  RECT status = StatusBarRect();
  DrawRect(hdc, status, kStatusBar, kBorder);
  DrawTextLine(hdc, fontStatus_, kMuted, 12, status.top + 7, status_.c_str());
  DrawTextLine(hdc, fontStatus_, RGB(0x70, 0x60, 0x80), client.right - 360, status.top + 7,
               L"Fan-made - Not affiliated with Rockstar");

  EndPaint(hwnd_, &ps);
}

void AppWindow::OnSize() {
  LayoutWebView();
  InvalidateRect(hwnd_, nullptr, FALSE);
}

void AppWindow::LayoutWebView() {
  if (!controller_)
    return;
  RECT rc = ContentRect();
  controller_->put_Bounds(rc);
}

void AppWindow::SetStatus(const std::wstring& text) {
  status_ = text;
  RECT status = StatusBarRect();
  InvalidateRect(hwnd_, &status, FALSE);
}

void AppWindow::NavigateHome() {
  if (webview_)
    webview_->Navigate(kHomeUrl);
}

void AppWindow::InitWebView() {
  SetStatus(L"Initializing WebView2...");
  HWND hwnd = hwnd_;

  CreateCoreWebView2EnvironmentWithOptions(
      nullptr, nullptr, nullptr,
      Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
          [this, hwnd](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
            if (FAILED(result) || !env) {
              SetStatus(L"WebView2 failed - install the WebView2 Runtime");
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
                        SetStatus(L"WebView2 controller failed");
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
                      }

                      COREWEBVIEW2_COLOR bg;
                      bg.A = 255;
                      bg.R = 0x1A;
                      bg.G = 0x0A;
                      bg.B = 0x2E;
                      ComPtr<ICoreWebView2Controller2> c2;
                      if (SUCCEEDED(controller_->QueryInterface(IID_PPV_ARGS(&c2))) && c2) {
                        c2->put_DefaultBackgroundColor(bg);
                      }

                      webview_->add_NavigationStarting(
                          Callback<ICoreWebView2NavigationStartingEventHandler>(
                              [this](ICoreWebView2*, ICoreWebView2NavigationStartingEventArgs* args) -> HRESULT {
                                LPWSTR uri = nullptr;
                                args->get_Uri(&uri);
                                std::wstring s = L"Loading ";
                                if (uri) {
                                  s += uri;
                                  CoTaskMemFree(uri);
                                }
                                s += L"...";
                                SetStatus(s);
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      webview_->add_NavigationCompleted(
                          Callback<ICoreWebView2NavigationCompletedEventHandler>(
                              [this](ICoreWebView2*, ICoreWebView2NavigationCompletedEventArgs* args) -> HRESULT {
                                BOOL ok = FALSE;
                                args->get_IsSuccess(&ok);
                                if (ok) {
                                  LPWSTR src = nullptr;
                                  webview_->get_Source(&src);
                                  if (src) {
                                    SetStatus(src);
                                    CoTaskMemFree(src);
                                  } else {
                                    SetStatus(kHomeUrl);
                                  }
                                } else {
                                  SetStatus(L"Failed to load - check connection, then press F5");
                                }
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      webview_->add_DocumentTitleChanged(
                          Callback<ICoreWebView2DocumentTitleChangedEventHandler>(
                              [this](ICoreWebView2* sender, IUnknown*) -> HRESULT {
                                LPWSTR title = nullptr;
                                sender->get_DocumentTitle(&title);
                                if (title && title[0]) {
                                  std::wstring t = title;
                                  t += L" - Desktop";
                                  SetWindowTextW(hwnd_, t.c_str());
                                }
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

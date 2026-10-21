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

const COLORREF AppWindow::kBgDeep         = RGB(0x1A, 0x0A, 0x2E);
const COLORREF AppWindow::kToolbar        = RGB(0x14, 0x0A, 0x28);
const COLORREF AppWindow::kBorder         = RGB(0xFF, 0x8C, 0xC8);
const COLORREF AppWindow::kTitleBar       = RGB(0x14, 0x0A, 0x28);
const COLORREF AppWindow::kBtnFace        = RGB(0x2A, 0x14, 0x3E);
const COLORREF AppWindow::kBtnFaceHot     = RGB(0x3A, 0x1E, 0x52);
const COLORREF AppWindow::kBtnFaceDisabled= RGB(0x1E, 0x10, 0x2E);
const COLORREF AppWindow::kBtnText        = RGB(0xE0, 0xB0, 0xFF);
const COLORREF AppWindow::kBtnTextDisabled= RGB(0x70, 0x58, 0x88);

const int AppWindow::kToolbarH = 40;

AppWindow::AppWindow(HINSTANCE instance)
    : instance_(instance),
      hwnd_(nullptr),
      btnBack_(nullptr),
      btnForward_(nullptr),
      btnHome_(nullptr),
      btnRefresh_(nullptr),
      fontBtn_(nullptr) {}

AppWindow::~AppWindow() {
  if (fontBtn_)
    DeleteObject(fontBtn_);
}

bool AppWindow::Create() {
  WNDCLASSEXW wc;
  ZeroMemory(&wc, sizeof(wc));
  wc.cbSize        = sizeof(WNDCLASSEXW);
  wc.style         = CS_HREDRAW | CS_VREDRAW;
  wc.lpfnWndProc   = AppWindow::WndProc;
  wc.hInstance     = instance_;
  wc.hCursor       = LoadCursorW(nullptr, IDC_ARROW);
  wc.hbrBackground = CreateSolidBrush(kBgDeep);
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

  fontBtn_ = CreateFontW(
      15, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE,
      DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
      CLEARTYPE_QUALITY, DEFAULT_PITCH | FF_SWISS, L"Segoe UI");

  CreateToolbar();

  ShowWindow(hwnd_, SW_SHOW);
  UpdateWindow(hwnd_);
  InitWebView();
  return true;
}

void AppWindow::CreateToolbar() {
  /* BS_OWNERDRAW = flat custom paint, no system white border */
  const DWORD style = WS_CHILD | WS_VISIBLE | BS_OWNERDRAW;

  btnBack_ = CreateWindowW(
      L"BUTTON", L"<  Back",
      style, 0, 0, 0, 0, hwnd_, (HMENU)(INT_PTR)IDC_BTN_BACK, instance_, nullptr);
  btnForward_ = CreateWindowW(
      L"BUTTON", L"Forward  >",
      style, 0, 0, 0, 0, hwnd_, (HMENU)(INT_PTR)IDC_BTN_FORWARD, instance_, nullptr);
  btnHome_ = CreateWindowW(
      L"BUTTON", L"Home",
      style, 0, 0, 0, 0, hwnd_, (HMENU)(INT_PTR)IDC_BTN_HOME, instance_, nullptr);
  btnRefresh_ = CreateWindowW(
      L"BUTTON", L"Refresh",
      style, 0, 0, 0, 0, hwnd_, (HMENU)(INT_PTR)IDC_BTN_REFRESH, instance_, nullptr);

  LayoutControls();
  EnableWindow(btnBack_, FALSE);
  EnableWindow(btnForward_, FALSE);
}

void AppWindow::DrawToolbarButton(const DRAWITEMSTRUCT* dis) {
  if (!dis)
    return;

  const bool disabled = (dis->itemState & ODS_DISABLED) != 0;
  const bool pressed  = (dis->itemState & ODS_SELECTED) != 0;
  const bool focused  = (dis->itemState & ODS_FOCUS) != 0;

  COLORREF face = kBtnFace;
  COLORREF text = kBtnText;
  if (disabled) {
    face = kBtnFaceDisabled;
    text = kBtnTextDisabled;
  } else if (pressed) {
    face = kBtnFaceHot;
  }

  HBRUSH br = CreateSolidBrush(face);
  FillRect(dis->hDC, &dis->rcItem, br);
  DeleteObject(br);

  /* Soft pink edge only — no white system border */
  if (!disabled) {
    HPEN pen = CreatePen(PS_SOLID, 1, kBorder);
    HGDIOBJ oldPen = SelectObject(dis->hDC, pen);
    HGDIOBJ oldBr = SelectObject(dis->hDC, GetStockObject(NULL_BRUSH));
    Rectangle(dis->hDC, dis->rcItem.left, dis->rcItem.top,
              dis->rcItem.right, dis->rcItem.bottom);
    SelectObject(dis->hDC, oldBr);
    SelectObject(dis->hDC, oldPen);
    DeleteObject(pen);
  }

  wchar_t label[64];
  GetWindowTextW(dis->hwndItem, label, 64);

  SetBkMode(dis->hDC, TRANSPARENT);
  SetTextColor(dis->hDC, text);
  HFONT oldFont = nullptr;
  if (fontBtn_)
    oldFont = (HFONT)SelectObject(dis->hDC, fontBtn_);

  RECT tr = dis->rcItem;
  if (pressed) {
    OffsetRect(&tr, 1, 1);
  }
  DrawTextW(dis->hDC, label, -1, &tr, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

  if (oldFont)
    SelectObject(dis->hDC, oldFont);

  if (focused && !disabled) {
    RECT fr = dis->rcItem;
    InflateRect(&fr, -3, -3);
    DrawFocusRect(dis->hDC, &fr);
  }
}

void AppWindow::LayoutControls() {
  const int pad = 6;
  const int gap = 6;
  const int btnH = kToolbarH - pad * 2;
  const int btnW = 100;
  int x = pad;
  int y = pad;

  if (btnBack_) {
    MoveWindow(btnBack_, x, y, btnW, btnH, TRUE);
    x += btnW + gap;
  }
  if (btnForward_) {
    MoveWindow(btnForward_, x, y, btnW, btnH, TRUE);
    x += btnW + gap;
  }
  if (btnHome_) {
    MoveWindow(btnHome_, x, y, 80, btnH, TRUE);
    x += 80 + gap;
  }
  if (btnRefresh_) {
    MoveWindow(btnRefresh_, x, y, 90, btnH, TRUE);
  }
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
    case WM_DRAWITEM: {
      DRAWITEMSTRUCT* dis = (DRAWITEMSTRUCT*)lParam;
      if (dis && dis->CtlType == ODT_BUTTON) {
        DrawToolbarButton(dis);
        return TRUE;
      }
      break;
    }
    case WM_COMMAND:
      if (HIWORD(wParam) == BN_CLICKED || HIWORD(wParam) == 0) {
        switch (LOWORD(wParam)) {
          case IDC_BTN_BACK:
            GoBack();
            return 0;
          case IDC_BTN_FORWARD:
            GoForward();
            return 0;
          case IDC_BTN_HOME:
            NavigateHome();
            return 0;
          case IDC_BTN_REFRESH:
            Refresh();
            return 0;
        }
      }
      break;
    case WM_ERASEBKGND: {
      HDC hdc = (HDC)wParam;
      RECT rc;
      GetClientRect(hwnd_, &rc);
      HBRUSH bg = CreateSolidBrush(kBgDeep);
      FillRect(hdc, &rc, bg);
      DeleteObject(bg);
      RECT tb = rc;
      tb.bottom = kToolbarH;
      HBRUSH tbBrush = CreateSolidBrush(kToolbar);
      FillRect(hdc, &tb, tbBrush);
      DeleteObject(tbBrush);
      return 1;
    }
    case WM_SIZE:
      OnSize();
      return 0;
    case WM_KEYDOWN:
      if (webview_) {
        if (wParam == VK_F5) {
          Refresh();
          return 0;
        }
        if (wParam == VK_LEFT && (GetKeyState(VK_MENU) & 0x8000)) {
          GoBack();
          return 0;
        }
        if (wParam == VK_RIGHT && (GetKeyState(VK_MENU) & 0x8000)) {
          GoForward();
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

RECT AppWindow::WebViewRect() const {
  RECT rc;
  GetClientRect(hwnd_, &rc);
  rc.top = kToolbarH;
  if (rc.bottom < rc.top)
    rc.bottom = rc.top;
  return rc;
}

void AppWindow::OnSize() {
  LayoutControls();
  LayoutWebView();
}

void AppWindow::LayoutWebView() {
  if (!controller_)
    return;
  RECT rc = WebViewRect();
  controller_->put_Bounds(rc);
}

void AppWindow::NavigateHome() {
  if (webview_)
    webview_->Navigate(kHomeUrl);
}

void AppWindow::GoBack() {
  if (!webview_)
    return;
  BOOL can = FALSE;
  webview_->get_CanGoBack(&can);
  if (can)
    webview_->GoBack();
}

void AppWindow::GoForward() {
  if (!webview_)
    return;
  BOOL can = FALSE;
  webview_->get_CanGoForward(&can);
  if (can)
    webview_->GoForward();
}

void AppWindow::Refresh() {
  if (webview_)
    webview_->Reload();
}

void AppWindow::UpdateNavButtons() {
  if (!webview_)
    return;
  BOOL canBack = FALSE;
  BOOL canFwd = FALSE;
  webview_->get_CanGoBack(&canBack);
  webview_->get_CanGoForward(&canFwd);
  if (btnBack_)
    EnableWindow(btnBack_, canBack ? TRUE : FALSE);
  if (btnForward_)
    EnableWindow(btnForward_, canFwd ? TRUE : FALSE);
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

                      webview_->add_HistoryChanged(
                          Callback<ICoreWebView2HistoryChangedEventHandler>(
                              [this](ICoreWebView2*, IUnknown*) -> HRESULT {
                                UpdateNavButtons();
                                return S_OK;
                              })
                              .Get(),
                          nullptr);

                      webview_->add_NavigationCompleted(
                          Callback<ICoreWebView2NavigationCompletedEventHandler>(
                              [this](ICoreWebView2*, ICoreWebView2NavigationCompletedEventArgs*) -> HRESULT {
                                UpdateNavButtons();
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

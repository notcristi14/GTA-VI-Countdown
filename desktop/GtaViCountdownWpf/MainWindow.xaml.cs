using System;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace GtaViCountdownWpf
{
    public partial class MainWindow : Window
    {
        private const string HomeUrl = "https://gta-vi-countdown.onrender.com/eastern-europe";
        private const string SiteHost = "gta-vi-countdown.onrender.com";
        private bool _firstLoad = true;

        public MainWindow()
        {
            InitializeComponent();
        }

        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                StatusText.Text = "Initializing WebView2…";

                var env = await CoreWebView2Environment.CreateAsync();
                await WebView.EnsureCoreWebView2Async(env);

                var s = WebView.CoreWebView2.Settings;
                s.IsScriptEnabled = true;
                s.IsWebMessageEnabled = true;
                s.AreDefaultScriptDialogsEnabled = true;
                s.IsStatusBarEnabled = false;
                s.AreDevToolsEnabled = true;
                s.AreDefaultContextMenusEnabled = true;
                s.AreHostObjectsAllowed = true;
                s.IsZoomControlEnabled = true;
                s.IsSwipeNavigationEnabled = true;
                s.AreBrowserAcceleratorKeysEnabled = true;

                WebView.DefaultBackgroundColor = System.Drawing.Color.FromArgb(0x1A, 0x0A, 0x2E);

                WebView.CoreWebView2.NewWindowRequested += (_, args) =>
                {
                    args.Handled = true;
                    if (!string.IsNullOrEmpty(args.Uri))
                        WebView.CoreWebView2.Navigate(args.Uri);
                };

                WebView.CoreWebView2.NavigationStarting += (_, args) =>
                {
                    if (_firstLoad)
                        LoadingOverlay.Visibility = Visibility.Visible;
                    StatusText.Text = "Loading " + args.Uri + "…";
                    UpdateNavButtons();
                };

                WebView.CoreWebView2.NavigationCompleted += (_, args) =>
                {
                    _firstLoad = false;
                    LoadingOverlay.Visibility = Visibility.Collapsed;
                    LoadingOverlay.IsHitTestVisible = false;
                    if (args.IsSuccess)
                    {
                        StatusText.Text = WebView.CoreWebView2.Source ?? HomeUrl;
                        WebView.Focus();
                    }
                    else
                    {
                        StatusText.Text = "Failed to load — check your connection, then press ↻";
                    }
                    UpdateNavButtons();
                };

                WebView.CoreWebView2.HistoryChanged += (_, __) => UpdateNavButtons();

                WebView.CoreWebView2.DocumentTitleChanged += (_, __) =>
                {
                    var title = WebView.CoreWebView2.DocumentTitle;
                    if (!string.IsNullOrWhiteSpace(title))
                        Title = title + " — Desktop";
                };

                WebView.CoreWebView2.Navigate(HomeUrl);
            }
            catch (Exception ex)
            {
                LoadingOverlay.Visibility = Visibility.Collapsed;
                LoadingOverlay.IsHitTestVisible = false;
                StatusText.Text = "WebView2 error: " + ex.Message;
                MessageBox.Show(
                    "WebView2 failed to start.\n\nInstall the WebView2 Runtime:\nhttps://developer.microsoft.com/microsoft-edge/webview2/\n\n" + ex.Message,
                    "GTA VI Countdown",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning);
            }
        }

        private void UpdateNavButtons()
        {
            try
            {
                if (WebView?.CoreWebView2 == null) return;
                BtnBack.IsEnabled = WebView.CoreWebView2.CanGoBack;
                BtnForward.IsEnabled = WebView.CoreWebView2.CanGoForward;
            }
            catch { }
        }

        private void Back_Click(object sender, RoutedEventArgs e)
        {
            if (WebView.CoreWebView2?.CanGoBack == true)
                WebView.CoreWebView2.GoBack();
        }

        private void Forward_Click(object sender, RoutedEventArgs e)
        {
            if (WebView.CoreWebView2?.CanGoForward == true)
                WebView.CoreWebView2.GoForward();
        }

        private void Refresh_Click(object sender, RoutedEventArgs e) => WebView.CoreWebView2?.Reload();

        private void Home_Click(object sender, RoutedEventArgs e) => WebView.CoreWebView2?.Navigate(HomeUrl);

        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            if (WebView?.CoreWebView2 == null) return;
            if (e.Key == Key.F5) { WebView.CoreWebView2.Reload(); e.Handled = true; }
            else if (e.Key == Key.BrowserBack || (e.Key == Key.Left && Keyboard.Modifiers == ModifierKeys.Alt))
            { if (WebView.CoreWebView2.CanGoBack) WebView.CoreWebView2.GoBack(); e.Handled = true; }
            else if (e.Key == Key.BrowserForward || (e.Key == Key.Right && Keyboard.Modifiers == ModifierKeys.Alt))
            { if (WebView.CoreWebView2.CanGoForward) WebView.CoreWebView2.GoForward(); e.Handled = true; }
            else if (e.Key == Key.Home && Keyboard.Modifiers == ModifierKeys.Alt)
            { WebView.CoreWebView2.Navigate(HomeUrl); e.Handled = true; }
        }

        private void Minimize_Click(object sender, RoutedEventArgs e) => WindowState = WindowState.Minimized;

        private void Maximize_Click(object sender, RoutedEventArgs e)
            => WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;

        private void Close_Click(object sender, RoutedEventArgs e) => Close();
    }
}

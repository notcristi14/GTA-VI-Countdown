import SwiftUI
import WebKit

/// Home URL — Eastern Europe regional countdown on the live site.
private let homeURL = URL(string: "https://gta-vi-countdown.onrender.com/eastern-europe")!

struct ContentView: View {
    @StateObject private var model = WebViewModel()

    var body: some View {
        ZStack {
            Color(red: 0.10, green: 0.04, blue: 0.18)
                .ignoresSafeArea()

            WebView(model: model)
                .ignoresSafeArea(edges: .bottom)

            if model.isLoading {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(Color(red: 0.88, green: 0.69, blue: 1.0))
                    .scaleEffect(1.2)
            }
        }
        .statusBarHidden(false)
        .persistentSystemOverlays(.automatic)
    }
}

// MARK: - Model

@MainActor
final class WebViewModel: ObservableObject {
    @Published var isLoading = true
    weak var webView: WKWebView?

    func reload() {
        webView?.reload()
    }

    func goHome() {
        webView?.load(URLRequest(url: homeURL))
    }
}

// MARK: - WKWebView representable

struct WebView: UIViewRepresentable {
    @ObservedObject var model: WebViewModel

    func makeCoordinator() -> Coordinator {
        Coordinator(model: model)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        let prefs = WKWebpagePreferences()
        prefs.allowsContentJavaScript = true
        config.defaultWebpagePreferences = prefs

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .always
        webView.scrollView.backgroundColor = UIColor(red: 0.10, green: 0.04, blue: 0.18, alpha: 1)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.10, green: 0.04, blue: 0.18, alpha: 1)
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsLinkPreview = false

        if #available(iOS 16.4, *) {
            webView.isInspectable = false
        }

        model.webView = webView
        webView.load(URLRequest(url: homeURL, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 30))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let model: WebViewModel
        private let allowedHosts: Set<String> = [
            "gta-vi-countdown.onrender.com"
        ]

        init(model: WebViewModel) {
            self.model = model
        }

        private func isInternal(_ url: URL?) -> Bool {
            guard let host = url?.host?.lowercased() else { return false }
            return allowedHosts.contains(host)
        }

        private func openExternally(_ url: URL) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }

            let scheme = (url.scheme ?? "").lowercased()
            if scheme == "about" || scheme == "data" || scheme == "blob" {
                decisionHandler(.allow)
                return
            }

            if scheme != "http" && scheme != "https" {
                openExternally(url)
                decisionHandler(.cancel)
                return
            }

            if navigationAction.targetFrame?.isMainFrame != false {
                if !isInternal(url) {
                    openExternally(url)
                    decisionHandler(.cancel)
                    return
                }
            }

            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                if isInternal(url) {
                    webView.load(navigationAction.request)
                } else {
                    openExternally(url)
                }
            }
            return nil
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            model.isLoading = true
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            model.isLoading = false
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            model.isLoading = false
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            model.isLoading = false
        }
    }
}

#Preview {
    ContentView()
}

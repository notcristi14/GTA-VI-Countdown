import UIKit
import WebKit

/// Native WKWebView shell — same behavior as the Android app.
/// Home: site root; users choose a countdown region in the web UI.
/// Same-origin and official embeds stay in-app; other main-frame links open in Safari.
/// Iframe loads never open externally.
/// window.open / target=_blank (e.g. Latest update card) open in Safari.
final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    private let homeURL = URL(string: "https://gta-vi-countdown.onrender.com/")!
    private let allowedHost = "gta-vi-countdown.onrender.com"
    private let bgColor = UIColor(red: 26 / 255, green: 10 / 255, blue: 46 / 255, alpha: 1)

    private lazy var webView: WKWebView = {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
        wv.uiDelegate = self
        wv.backgroundColor = bgColor
        wv.isOpaque = false
        wv.scrollView.backgroundColor = bgColor
        wv.translatesAutoresizingMaskIntoConstraints = false
        return wv
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = bgColor

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        webView.load(URLRequest(url: homeURL))
    }

    // MARK: - Helpers

    private func isAllowedInApp(_ url: URL) -> Bool {
        let scheme = (url.scheme ?? "").lowercased()
        if scheme == "about" || scheme == "data" || scheme == "blob" { return true }
        if scheme != "http" && scheme != "https" { return false }

        let host = (url.host ?? "").lowercased()
        let path = url.path.lowercased()

        if host == allowedHost || host.hasSuffix(".\(allowedHost)") { return true }

        let isSpotifyEmbed = host == "open.spotify.com" && path.hasPrefix("/embed")
        let isYouTubeEmbed = (host == "www.youtube.com" || host == "youtube.com" || host == "www.youtube-nocookie.com" || host == "youtube-nocookie.com") && path.contains("/embed")
        return isSpotifyEmbed || isYouTubeEmbed
    }

    private func openExternal(_ url: URL) {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
    }

    // MARK: - WKNavigationDelegate

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        // Iframe / subframe loads stay inside the WebView (Spotify/YouTube embeds).
        if let frame = navigationAction.targetFrame, !frame.isMainFrame {
            decisionHandler(.allow)
            return
        }

        if isAllowedInApp(url) {
            decisionHandler(.allow)
            return
        }

        openExternal(url)
        decisionHandler(.cancel)
    }

    // MARK: - WKUIDelegate

    /// Handles window.open() and target="_blank" (Latest update card, social links, etc.).
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        guard let url = navigationAction.request.url else { return nil }

        if isAllowedInApp(url) {
            webView.load(URLRequest(url: url))
        } else {
            openExternal(url)
        }
        return nil
    }
}

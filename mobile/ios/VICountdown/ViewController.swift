import UIKit
import WebKit

/// Native WKWebView shell — same behavior as the Android app.
/// Home: Eastern Europe countdown; only the site host stays in-app; every other link opens externally.
final class ViewController: UIViewController, WKNavigationDelegate {

    private let homeURL = URL(string: "https://gta-vi-countdown.onrender.com/eastern-europe")!
    private let allowedHost = "gta-vi-countdown.onrender.com"
    private let bgColor = UIColor(red: 26 / 255, green: 10 / 255, blue: 46 / 255, alpha: 1)

    private lazy var webView: WKWebView = {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        let wv = WKWebView(frame: .zero, configuration: config)
        wv.navigationDelegate = self
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

        let scheme = (url.scheme ?? "").lowercased()
        if scheme == "about" || scheme == "data" || scheme == "blob" {
            decisionHandler(.allow)
            return
        }

        if scheme != "http" && scheme != "https" {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }

        let host = (url.host ?? "").lowercased()

        // Only the main site stays in-app. Every other link (embeds, social, etc.) opens in Safari.
        if host == allowedHost || host.hasSuffix(".\(allowedHost)") {
            decisionHandler(.allow)
            return
        }

        UIApplication.shared.open(url, options: [:], completionHandler: nil)
        decisionHandler(.cancel)
    }
}

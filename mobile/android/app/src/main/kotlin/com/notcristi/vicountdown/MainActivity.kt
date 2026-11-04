package com.notcristi.vicountdown

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

/**
 * Pure Android WebView shell — no Flutter.
 * Loads the Eastern Europe countdown; same-origin stays in-app; other links open externally.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    companion object {
        private const val HOME_URL = "https://gta-vi-countdown.onrender.com/eastern-europe"
        private const val ALLOWED_HOST = "gta-vi-countdown.onrender.com"
        private val BG = Color.parseColor("#1A0A2E")
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = BG
        window.navigationBarColor = BG

        webView = WebView(this).apply {
            setBackgroundColor(BG)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest
                ): Boolean {
                    val uri = request.url
                    val scheme = uri.scheme?.lowercase() ?: return true

                    if (scheme == "about" || scheme == "data" || scheme == "blob") {
                        return false
                    }
                    if (scheme != "http" && scheme != "https") {
                        openExternal(uri.toString())
                        return true
                    }

                    val host = uri.host?.lowercase() ?: return true
                    if (host == ALLOWED_HOST || host.endsWith(".$ALLOWED_HOST")) {
                        return false // stay in WebView
                    }

                    openExternal(uri.toString())
                    return true
                }
            }

            loadUrl(HOME_URL)
        }

        setContentView(
            webView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        )
    }

    private fun openExternal(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url)))
        } catch (_: Exception) {
            // no handler
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
}

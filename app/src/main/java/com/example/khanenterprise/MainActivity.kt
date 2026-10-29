package com.example.khanenterprise

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.webkit.WebViewAssetLoader
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : AppCompatActivity() {

    private lateinit var rootLayout: FrameLayout
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private var webView: WebView? = null
    private lateinit var assetLoader: WebViewAssetLoader

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        rootLayout = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        swipeRefreshLayout = SwipeRefreshLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setColorSchemeColors(0xFF064E3B.toInt(), 0xFF059669.toInt(), 0xFFD97706.toInt())
        }

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                8
            )
            max = 100
            progressDrawable.setColorFilter(
                0xFF059669.toInt(),
                android.graphics.PorterDuff.Mode.SRC_IN
            )
            visibility = View.GONE
        }

        rootLayout.addView(swipeRefreshLayout)
        rootLayout.addView(progressBar)
        setContentView(rootLayout)

        assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        initWebView()

        swipeRefreshLayout.setOnRefreshListener {
            webView?.reload()
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val wv = webView
                if (wv != null && wv.canGoBack()) {
                    wv.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initWebView() {
        val oldWv = webView
        if (oldWv != null) {
            swipeRefreshLayout.removeView(oldWv)
            oldWv.destroy()
        }

        val wv = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            // Software layer prevents Chromium GPU renderer crashes in headless emulator
            setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        }

        val s = wv.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.allowFileAccess = false // Security: assetLoader handles assets over HTTPS
        s.allowContentAccess = false
        s.useWideViewPort = true
        s.loadWithOverviewMode = true
        s.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        s.cacheMode = WebSettings.LOAD_DEFAULT

        wv.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                    swipeRefreshLayout.isRefreshing = false
                }
            }
        }

        wv.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("tel:")) {
                    try {
                        startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                    } catch (e: Exception) {
                        Log.w("MainActivity", "Cannot open dialer: $e")
                    }
                    return true
                }
                if (url.startsWith("https://wa.me/") || url.contains("whatsapp")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (e: Exception) {
                        Log.w("MainActivity", "Cannot open whatsapp: $e")
                    }
                    return true
                }
                return false
            }

            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val uri = request?.url ?: return null

                // 1. First, check if assetLoader can serve it from bundled assets
                val assetResponse = assetLoader.shouldInterceptRequest(uri)
                if (assetResponse != null) {
                    return assetResponse
                }

                // 2. If it's an API request, proxy to local dev server (10.0.2.2 or 127.0.0.1)
                val path = uri.path ?: ""
                if (path.startsWith("/api/")) {
                    return proxyApiRequest(request)
                }

                return null
            }

            override fun onRenderProcessGone(
                view: WebView?,
                detail: RenderProcessGoneDetail?
            ): Boolean {
                // CRITICAL: Handle renderer crash so the Android OS does not terminate the process!
                val didCrash = detail?.didCrash() == true
                Log.e("MainActivity", "Chromium render process gone. didCrash=$didCrash")
                runOnUiThread {
                    initWebView()
                }
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                if (request?.isForMainFrame == true) {
                    Log.w("MainActivity", "WebView main frame error: ${error?.description}")
                }
            }
        }

        swipeRefreshLayout.addView(wv)
        webView = wv

        // Load web app over virtual domain mapped to assets
        wv.loadUrl("https://appassets.androidplatform.net/index.html")
    }

    private fun proxyApiRequest(request: WebResourceRequest): WebResourceResponse? {
        return try {
            val path = request.url.path ?: return null
            val query = request.url.query
            val fullPath = if (query.isNullOrEmpty()) path else "$path?$query"
            // Try localhost:3000 or 10.0.2.2:3000
            val targetUrl = "http://127.0.0.1:3000$fullPath"
            val conn = URL(targetUrl).openConnection() as HttpURLConnection
            conn.requestMethod = request.method
            conn.connectTimeout = 3000
            conn.readTimeout = 5000

            for ((k, v) in request.requestHeaders) {
                conn.setRequestProperty(k, v)
            }

            val statusCode = conn.responseCode
            val message = conn.responseMessage ?: "OK"
            val mimeType = conn.contentType ?: "application/json"
            val isSuccess = statusCode in 200..299
            val stream: InputStream = if (isSuccess) conn.inputStream else (conn.errorStream ?: conn.inputStream)

            WebResourceResponse(mimeType, "utf-8", statusCode, message, emptyMap(), stream)
        } catch (e: Exception) {
            Log.w("MainActivity", "API proxy error: $e")
            null
        }
    }

    override fun onResume() {
        super.onResume()
        webView?.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView?.onPause()
    }

    override fun onDestroy() {
        webView?.destroy()
        webView = null
        super.onDestroy()
    }
}

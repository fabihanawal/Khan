package com.example.khanenterprise

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
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
            // Software layer prevents Chromium GPU renderer crashes in emulator
            setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        }

        val s = wv.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.allowFileAccess = false
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
                val path = uri.path ?: ""

                // 1. Intercept API requests BEFORE assetLoader to prevent FileNotFoundException in logs
                if (path.startsWith("/api/")) {
                    return handleApiRequest(request, path)
                }

                // 2. Safely handle favicon.ico requests
                if (path == "/favicon.ico") {
                    return try {
                        val stream = assets.open("favicon.ico")
                        WebResourceResponse("image/x-icon", "binary", 200, "OK", emptyMap(), stream)
                    } catch (e: Exception) {
                        WebResourceResponse("image/png", "binary", 200, "OK", emptyMap(), ByteArrayInputStream(ByteArray(0)))
                    }
                }

                // 3. For bundled web files (HTML, JS, CSS, fonts, images), use assetLoader
                return assetLoader.shouldInterceptRequest(uri)
            }

            override fun onRenderProcessGone(
                view: WebView?,
                detail: RenderProcessGoneDetail?
            ): Boolean {
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

        // Load web app over virtual secure domain mapped to assets
        wv.loadUrl("https://appassets.androidplatform.net/index.html")
    }

    private fun handleApiRequest(request: WebResourceRequest, path: String): WebResourceResponse {
        val query = request.url.query
        val fullPath = if (query.isNullOrEmpty()) path else "$path?$query"

        // Candidate URLs to query the local backend from emulator or container
        val candidateHosts = listOf(
            "http://10.0.2.2:3000",
            "http://127.0.0.1:3000",
            "http://10.0.2.2:8080",
            "http://127.0.0.1:8080"
        )

        for (host in candidateHosts) {
            try {
                val conn = URL("$host$fullPath").openConnection() as HttpURLConnection
                conn.requestMethod = request.method
                conn.connectTimeout = 800
                conn.readTimeout = 1500
                for ((k, v) in request.requestHeaders) {
                    conn.setRequestProperty(k, v)
                }
                val statusCode = conn.responseCode
                if (statusCode in 200..399) {
                    val stream: InputStream = conn.inputStream
                    val mimeType = conn.contentType ?: "application/json"
                    return WebResourceResponse(mimeType, "utf-8", statusCode, "OK", emptyMap(), stream)
                }
            } catch (ignored: Exception) {
                // Try next host
            }
        }

        // Fallback: If network connection to local dev server is unavailable, load bundled JSON asset
        val endpoint = path.removePrefix("/api/").substringBefore('/')
        val fallbackAsset = "api/$endpoint.json"
        return try {
            val stream = assets.open(fallbackAsset)
            WebResourceResponse("application/json", "utf-8", 200, "OK", emptyMap(), stream)
        } catch (e: Exception) {
            val emptyFallback = "{\"success\":true,\"data\":[]}"
            WebResourceResponse(
                "application/json",
                "utf-8",
                200,
                "OK",
                emptyMap(),
                ByteArrayInputStream(emptyFallback.toByteArray(Charsets.UTF_8))
            )
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

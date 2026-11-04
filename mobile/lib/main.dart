import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

const String kHomeUrl = 'https://gta-vi-countdown.onrender.com/eastern-europe';
const String kAllowedHost = 'gta-vi-countdown.onrender.com';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF1A0A2E),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const VICountdownApp());
}

class VICountdownApp extends StatelessWidget {
  const VICountdownApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VI Countdown',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE0B0FF),
          surface: Color(0xFF1A0A2E),
        ),
        scaffoldBackgroundColor: const Color(0xFF1A0A2E),
        useMaterial3: true,
      ),
      home: const CountdownWebView(),
    );
  }
}

class CountdownWebView extends StatefulWidget {
  const CountdownWebView({super.key});

  @override
  State<CountdownWebView> createState() => _CountdownWebViewState();
}

class _CountdownWebViewState extends State<CountdownWebView> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF1A0A2E))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _loading = true);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onWebResourceError: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onNavigationRequest: (NavigationRequest request) {
            final uri = Uri.tryParse(request.url);
            if (uri == null) return NavigationDecision.prevent;

            final scheme = uri.scheme.toLowerCase();
            if (scheme == 'about' || scheme == 'data' || scheme == 'blob') {
              return NavigationDecision.navigate;
            }

            if (scheme != 'http' && scheme != 'https') {
              _openExternal(uri);
              return NavigationDecision.prevent;
            }

            final host = uri.host.toLowerCase();
            if (host == kAllowedHost || host.endsWith('.$kAllowedHost')) {
              return NavigationDecision.navigate;
            }

            _openExternal(uri);
            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadRequest(Uri.parse(kHomeUrl));
  }

  Future<void> _openExternal(Uri uri) async {
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        top: false,
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_loading)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFE0B0FF),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

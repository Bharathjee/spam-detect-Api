from flask import Flask, request, jsonify, render_template_string, Response
import re

app = Flask(__name__)

# Spam keywords list
SPAM_KEYWORDS = [
    'free', 'winner', 'won', 'prize', 'claim', 'urgent', 'cash',
    'money', 'offer', 'discount', 'buy now', 'click here', 'limited',
    'congratulations', 'selected', 'reward', 'gift', 'lottery',
    'win', 'bonus', 'deal', 'cheap', 'earn', 'income', 'profit'
]

def detect_spam(message):
    message_lower = message.lower()
    found_keywords = []
    for keyword in SPAM_KEYWORDS:
        # word boundary check to avoid substring issues
        if re.search(r'\b' + re.escape(keyword) + r'\b', message_lower):
            found_keywords.append(keyword)
    if len(found_keywords) >= 2:
        return "SPAM 🚨", found_keywords
    elif len(found_keywords) == 1:
        return "SUSPICIOUS ⚠️", found_keywords
    else:
        return "NOT SPAM ✅", []


def parse_request_message(data):
    if not isinstance(data, dict):
        return ''
    return str(data.get('message', '') or '')

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#4CAF50" />
    <meta name="mobile-web-app-capable" content="yes" />
    <title>SMS Spam Detector - Bharath</title>
    <link rel="manifest" href="/manifest.json" />
    <style>
        body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            background: linear-gradient(180deg, #e8f5e9 0%, #ffffff 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
        }
        .card {
            width: 100%;
            max-width: 520px;
            background: #ffffff;
            border-radius: 24px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
            padding: 24px;
            box-sizing: border-box;
        }
        h1 {
            margin: 0 0 8px;
            font-size: 28px;
            text-align: center;
            color: #1f3f2f;
        }
        p.subtitle {
            margin: 0 0 20px;
            text-align: center;
            color: #4f5d50;
            font-size: 14px;
        }
        textarea {
            width: 100%;
            min-height: 180px;
            padding: 16px;
            font-size: 16px;
            border-radius: 16px;
            border: 1px solid #d0d6cc;
            resize: vertical;
            box-sizing: border-box;
            margin-bottom: 16px;
        }
        button {
            width: 100%;
            padding: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 18px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s ease;
        }
        button:hover {
            background: #43a047;
        }
        .result {
            margin-top: 18px;
            padding: 18px;
            border-radius: 18px;
            text-align: center;
            font-size: 18px;
            font-weight: 700;
            line-height: 1.4;
        }
        .spam {
            background: #ffebee;
            color: #b71c1c;
        }
        .suspicious {
            background: #fff8e1;
            color: #8a6d3b;
        }
        .notspam {
            background: #e8f5e9;
            color: #1b5e20;
        }
        @media (max-width: 480px) {
            .card {
                padding: 18px;
            }
            h1 {
                font-size: 24px;
            }
            textarea {
                min-height: 150px;
            }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>📱 SMS Spam Detector</h1>
        <p class="subtitle">Mobile-friendly keyword spam detection for SMS messages.</p>
        <textarea id="message" rows="5" placeholder="Enter SMS message here..."></textarea>
        <button onclick="checkSpam()">Check Message</button>
        <div id="result"></div>
    </div>
    <script>
        async function checkSpam() {
            const message = document.getElementById('message').value.trim();
            if (!message) {
                alert('Please enter a message!');
                return;
            }
            const response = await fetch('/api/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            const data = await response.json();
            const resultDiv = document.getElementById('result');
            let className = data.result.includes('SPAM 🚨') ? 'spam' :
                           data.result.includes('SUSPICIOUS') ? 'suspicious' : 'notspam';
            resultDiv.className = 'result ' + className;
            resultDiv.innerHTML = data.result + '<br><small>' +
                (data.keywords.length ? 'Keywords: ' + data.keywords.join(', ') : 'No spam keywords found') +
                '</small>';
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/service-worker.js')
                    .catch(function (error) {
                        console.warn('Service Worker registration failed:', error);
                    });
            });
        }
    </script>
</body>
</html>
'''

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/check', methods=['POST'])
def check():
    data = request.get_json(silent=True) or {}
    message = parse_request_message(data)
    result, keywords = detect_spam(message)
    return jsonify({'result': result, 'keywords': keywords})

@app.route('/api/detect', methods=['POST'])
def api_detect():
    data = request.get_json(silent=True) or {}
    message = parse_request_message(data)
    result, keywords = detect_spam(message)
    return jsonify({
        'message': message,
        'result': result,
        'keywords': keywords,
        'spam': result == "SPAM 🚨",
        'suspicious': result == "SUSPICIOUS ⚠️"
    })

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({'status': 'ok', 'service': 'sms-spam-detector'})

@app.route('/manifest.json')
def manifest():
    return jsonify({
        'name': 'SMS Spam Detector',
        'short_name': 'SpamDetect',
        'start_url': '/',
        'display': 'standalone',
        'background_color': '#ffffff',
        'theme_color': '#4CAF50',
        'description': 'Mobile-friendly SMS spam detection app'
    })

@app.route('/service-worker.js')
def service_worker():
    js = """
self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});
"""
    return Response(js, mimetype='application/javascript')

if __name__ == '__main__':
    # Listen on all interfaces so mobile devices on the same LAN can connect.
    app.run(host='0.0.0.0', port=5000, debug=False)
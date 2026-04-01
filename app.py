from flask import Flask, request, jsonify, render_template_string
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

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>SMS Spam Detector - Bharath</title>
    <style>
        body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; background: #f0f0f0; }
        h1 { color: #333; text-align: center; }
        textarea { width: 100%; padding: 10px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc; }
        button { width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 10px; }
        button:hover { background: #45a049; }
        .result { margin-top: 20px; padding: 15px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; }
        .spam { background: #ffcccc; color: #cc0000; }
        .suspicious { background: #fff3cd; color: #856404; }
        .notspam { background: #d4edda; color: #155724; }
    </style>
</head>
<body>
    <h1>📱 SMS Spam Detector</h1>
    <p style="text-align:center">Built by Bharath | Python Flask Project</p>
    <textarea id="message" rows="5" placeholder="Enter SMS message here..."></textarea>
    <button onclick="checkSpam()">Check Message</button>
    <div id="result"></div>
    <script>
        async function checkSpam() {
            const message = document.getElementById('message').value;
            if (!message) { alert('Please enter a message!'); return; }
            const response = await fetch('/check', {
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
    </script>
</body>
</html>
'''

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/check', methods=['POST'])
def check():
    data = request.get_json()
    message = data.get('message', '')
    result, keywords = detect_spam(message)
    return jsonify({'result': result, 'keywords': keywords})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
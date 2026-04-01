from app import app, detect_spam

def test_spam_message():
    result, keywords = detect_spam("You won a prize!")
    assert result == "SPAM 🚨"
    assert "won" in keywords
    assert "prize" in keywords

def test_suspicious_message():
    result, keywords = detect_spam("This is free")
    assert result == "SUSPICIOUS ⚠️"
    assert "free" in keywords

def test_not_spam_message():
    result, keywords = detect_spam("Meeting tomorrow at 10 AM")
    assert result == "NOT SPAM ✅"
    assert keywords == []


def test_api_detect_spam():
    client = app.test_client()
    response = client.post('/api/detect', json={'message': 'Claim your free prize now'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['spam'] is True
    assert data['result'] == 'SPAM 🚨'
    assert 'free' in data['keywords']


def test_api_detect_not_spam():
    client = app.test_client()
    response = client.post('/api/detect', json={'message': 'Lunch at noon'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['spam'] is False
    assert data['suspicious'] is False
    assert data['result'] == 'NOT SPAM ✅'
    assert data['keywords'] == []


def test_api_health():
    client = app.test_client()
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['service'] == 'sms-spam-detector'

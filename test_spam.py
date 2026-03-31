from app import detect_spam

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

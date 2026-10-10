from backend.services.risk_engine import calculate_risk_score


def test_risk_score_is_within_valid_range():
    score = calculate_risk_score("High", 80)

    assert 0 <= score <= 100


def test_higher_confidence_does_not_reduce_score():
    low_confidence_score = calculate_risk_score("High", 40)
    high_confidence_score = calculate_risk_score("High", 90)

    assert high_confidence_score >= low_confidence_score
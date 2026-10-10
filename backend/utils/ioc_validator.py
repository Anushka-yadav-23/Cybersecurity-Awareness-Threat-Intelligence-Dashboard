import ipaddress
import re
from urllib.parse import urlparse


def validate_ioc(ioc_type: str, value: str) -> bool:
    """Check IOC syntax only; this does not verify whether it is malicious."""
    if not isinstance(value, str) or not value.strip():
        return False

    value = value.strip()
    kind = ioc_type.strip().upper()

    if kind in {"IP", "IPV4", "IPV6"}:
        try:
            address = ipaddress.ip_address(value)
            if kind == "IPV4":
                return address.version == 4
            if kind == "IPV6":
                return address.version == 6
            return True
        except ValueError:
            return False

    if kind == "DOMAIN":
        if len(value) > 253 or value.endswith("."):
            return False
        labels = value.split(".")
        if len(labels) < 2:
            return False
        return all(
            1 <= len(label) <= 63
            and re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?", label)
            for label in labels
        )

    if kind == "URL":
        try:
            parsed = urlparse(value)
            return (
                parsed.scheme in {"http", "https"}
                and bool(parsed.hostname)
                and not any(ch.isspace() for ch in value)
            )
        except ValueError:
            return False

    if kind in {"MD5", "SHA1", "SHA256"}:
        lengths = {"MD5": 32, "SHA1": 40, "SHA256": 64}
        return bool(re.fullmatch(rf"[0-9a-fA-F]{{{lengths[kind]}}}", value))

    if kind == "CVE":
        return bool(re.fullmatch(r"CVE-\d{4}-\d{4,}", value, flags=re.IGNORECASE))

    return False


if __name__ == "__main__":
    examples = [
        ("IPv4", "192.0.2.10"),
        ("Domain", "example.org"),
        ("URL", "https://example.com/training-page"),
        ("SHA256", "a" * 64),
        ("CVE", "CVE-2024-12345"),
        ("IPv4", "999.999.999.999"),
    ]
    for kind, value in examples:
        print(f"{kind}: {value} -> syntax_valid={validate_ioc(kind, value)}")
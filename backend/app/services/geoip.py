import ipaddress
import json
import os
from typing import Optional, Dict, Any

try:
    from geoip2.database import Reader
except Exception:
    Reader = None

from app.core.database import redis_client

GEOIP_CITY_DB = os.getenv("GEOIP_CITY_DB", "")
GEOIP_ASN_DB = os.getenv("GEOIP_ASN_DB", "")
GEOIP_CACHE_TTL = int(os.getenv("GEOIP_CACHE_TTL", "604800"))
GEOIP_CACHE_VERSION = "v3" # Increase to force cache refresh

_city_reader = None
_asn_reader = None

if Reader and GEOIP_CITY_DB and os.path.exists(GEOIP_CITY_DB):
    _city_reader = Reader(GEOIP_CITY_DB)
if Reader and GEOIP_ASN_DB and os.path.exists(GEOIP_ASN_DB):
    _asn_reader = Reader(GEOIP_ASN_DB)


def is_public_ip(ip: str) -> bool:
    try:
        return ipaddress.ip_address(ip).is_global
    except Exception:
        return False


def lookup_geoip(ip: str) -> Optional[Dict[str, Any]]:
    if not ip:
        return None
        
    if not _city_reader or not is_public_ip(ip):
        # No more mock data. Return None to indicate no real GeoIP available.
        return None

    output: Dict[str, Any] = {
        "ip": ip,
        "country": {"iso_code": None, "name": None},
        "city": {"name": None},
        "region": [],
        "location": {
            "lat": None,
            "lon": None,
            "time_zone": None,
            "accuracy_radius_km": None,
            "accuracy_radius": None,
        },
        "postal": {"code": None},
        "asn": {"number": None, "org": None},
    }
    has_data = False

    try:
        city = _city_reader.city(ip)
        output["country"] = {
            "iso_code": city.country.iso_code,
            "name": city.country.name,
        }
        output["city"] = {"name": city.city.name}
        output["region"] = [
            {"name": subdivision.name, "iso_code": subdivision.iso_code}
            for subdivision in city.subdivisions
        ]
        output["location"] = {
            "lat": city.location.latitude,
            "lon": city.location.longitude,
            "time_zone": city.location.time_zone,
            "accuracy_radius_km": city.location.accuracy_radius,
            "accuracy_radius": city.location.accuracy_radius,
        }
        output["postal"] = {"code": city.postal.code}
        if output["country"]["iso_code"] or output["country"]["name"]:
            has_data = True
        if output["city"]["name"] or output["location"]["lat"] or output["location"]["lon"]:
            has_data = True
    except Exception:
        pass

    if _asn_reader:
        try:
            asn = _asn_reader.asn(ip)
            output["asn"] = {
                "number": asn.autonomous_system_number,
                "org": asn.autonomous_system_organization,
            }
            if output["asn"]["number"] or output["asn"]["org"]:
                has_data = True
        except Exception:
            pass

    return output if has_data else None


def get_geoip_cached(ip: str) -> Optional[Dict[str, Any]]:
    if not ip:
        return None

    cache_key = f"geoip:{GEOIP_CACHE_VERSION}:ip:{ip}"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                text = cached.decode()
                if text == "null":
                    return None
                return json.loads(text)
        except Exception:
            pass

    data = lookup_geoip(ip)

    if redis_client:
        try:
            if data is None:
                redis_client.setex(cache_key, GEOIP_CACHE_TTL, "null")
            else:
                redis_client.setex(cache_key, GEOIP_CACHE_TTL, json.dumps(data))
        except Exception:
            pass

    return data

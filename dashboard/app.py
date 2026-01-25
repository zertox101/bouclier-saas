import os
import json
import threading
import time
from collections import deque
from datetime import datetime

import pandas as pd
import requests
import streamlit as st

try:
    import pydeck as pdk
except Exception:
    pdk = None

API_URL = os.getenv("API_URL", "http://localhost:8005").rstrip("/")
FLOW_STREAM_URL = os.getenv("MAP_STREAM_URL", f"{API_URL}/map/stream")
MAP_STYLE = os.getenv("MAP_STYLE", "mapbox://styles/mapbox/dark-v10")

SEVERITY_ORDER = ["low", "medium", "high", "critical"]
SEVERITY_RANK = {name: idx + 1 for idx, name in enumerate(SEVERITY_ORDER)}
SEVERITY_COLOR = {
    "low": [76, 175, 80],
    "medium": [255, 193, 7],
    "high": [255, 87, 34],
    "critical": [244, 67, 54],
}
SEVERITY_WIDTH = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


def severity_color(severity: str) -> list[int]:
    color = SEVERITY_COLOR.get(severity, [120, 120, 120])
    if len(color) == 3:
        return color + [180]
    return color


def severity_width(severity: str) -> int:
    return SEVERITY_WIDTH.get(severity, 2)


def _flow_listener(
    stream_url: str,
    flows: deque,
    lock: threading.Lock,
    meta: dict,
    meta_lock: threading.Lock,
    stop_event: threading.Event,
) -> None:
    headers = {"Accept": "text/event-stream"}
    while not stop_event.is_set():
        try:
            with requests.get(
                stream_url,
                headers=headers,
                stream=True,
                timeout=(5, 60),
            ) as response:
                response.raise_for_status()
                with meta_lock:
                    meta["connected"] = True
                    meta["last_error"] = ""
                event_name = None
                data_lines: list[str] = []

                for raw_line in response.iter_lines(decode_unicode=True):
                    if stop_event.is_set():
                        break
                    if raw_line is None:
                        continue
                    line = raw_line.strip()
                    if not line:
                        if event_name == "flow" and data_lines:
                            payload = "\n".join(data_lines)
                            try:
                                flow = json.loads(payload)
                            except json.JSONDecodeError:
                                flow = None
                            if flow:
                                with meta_lock:
                                    if meta.get("paused"):
                                        flow = None
                                if flow:
                                    with lock:
                                        flows.append(flow)
                                    with meta_lock:
                                        meta["last_event_ts"] = time.time()
                                        meta["total_received"] += 1
                        event_name = None
                        data_lines = []
                        continue
                    if line.startswith(":"):
                        continue
                    if line.startswith("event:"):
                        event_name = line.split(":", 1)[1].strip()
                    elif line.startswith("data:"):
                        data_lines.append(line.split(":", 1)[1].strip())
        except Exception as exc:
            with meta_lock:
                meta["connected"] = False
                meta["last_error"] = str(exc)
            time.sleep(2)
        else:
            with meta_lock:
                meta["connected"] = False


def ensure_flow_stream() -> None:
    if "flows" not in st.session_state:
        st.session_state["flows"] = deque(maxlen=2000)
        st.session_state["flows_lock"] = threading.Lock()
        st.session_state["flow_meta_lock"] = threading.Lock()
        st.session_state["flow_meta"] = {
            "connected": False,
            "last_event_ts": None,
            "last_error": "",
            "total_received": 0,
            "paused": False,
        }
        st.session_state["flow_stop"] = threading.Event()

    thread = st.session_state.get("flow_thread")
    if thread and thread.is_alive():
        return

    stop_event = st.session_state["flow_stop"]
    stop_event.clear()
    thread = threading.Thread(
        target=_flow_listener,
        args=(
            FLOW_STREAM_URL,
            st.session_state["flows"],
            st.session_state["flows_lock"],
            st.session_state["flow_meta"],
            st.session_state["flow_meta_lock"],
            stop_event,
        ),
        daemon=True,
    )
    thread.start()
    st.session_state["flow_thread"] = thread


def build_flow_dataframe(flows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(flows)
    if df.empty:
        return df
    for col in ["src_lat", "src_lon", "dst_lat", "dst_lon", "timestamp_epoch"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "severity" not in df.columns:
        df["severity"] = "low"
    df["severity"] = df["severity"].fillna("low").astype(str).str.lower()
    df["severity_rank"] = df["severity"].map(SEVERITY_RANK).fillna(0).astype(int)
    df["arc_color"] = df["severity"].apply(severity_color)
    df["arc_width"] = df["severity"].apply(severity_width)
    if "rule_id" in df.columns:
        df["rule_id"] = df["rule_id"].fillna("unknown").astype(str)
    return df


def apply_filters(df: pd.DataFrame, filters: dict) -> pd.DataFrame:
    if df.empty:
        return df
    filtered = df.copy()

    min_rank = filters.get("min_rank", 0)
    max_rank = filters.get("max_rank", 4)
    filtered = filtered[
        (filtered["severity_rank"] >= min_rank) & (filtered["severity_rank"] <= max_rank)
    ]

    rule_ids = filters.get("rule_ids")
    if rule_ids:
        filtered = filtered[filtered["rule_id"].isin(rule_ids)]

    src_countries = filters.get("src_countries")
    if src_countries and "src_country_iso" in filtered.columns:
        filtered = filtered[filtered["src_country_iso"].isin(src_countries)]

    dst_countries = filters.get("dst_countries")
    if dst_countries and "dst_country_iso" in filtered.columns:
        filtered = filtered[filtered["dst_country_iso"].isin(dst_countries)]

    search = filters.get("search")
    if search:
        search_lower = search.lower()
        for col in ["src_ip", "dst_ip", "src_city", "dst_city", "rule_id"]:
            if col in filtered.columns:
                mask = filtered[col].fillna("").astype(str).str.lower().str.contains(search_lower)
                filtered = filtered[mask]
                break

    return filtered


def render_flow_map(df: pd.DataFrame) -> None:
    if df.empty:
        st.info("No flow data yet. Waiting for stream...")
        return

    df = df.dropna(subset=["src_lat", "src_lon", "dst_lat", "dst_lon"]).copy()
    if df.empty:
        st.info("No GeoIP coordinates available for flows.")
        return

    if not pdk:
        st.map(df[["src_lat", "src_lon"]].rename(columns={"src_lat": "lat", "src_lon": "lon"}))
        return

    center_lat = pd.concat([df["src_lat"], df["dst_lat"]]).mean()
    center_lon = pd.concat([df["src_lon"], df["dst_lon"]]).mean()

    view_state = pdk.ViewState(latitude=float(center_lat), longitude=float(center_lon), zoom=1.2, pitch=30)

    arc_layer = pdk.Layer(
        "ArcLayer",
        data=df,
        get_source_position="[src_lon, src_lat]",
        get_target_position="[dst_lon, dst_lat]",
        get_source_color="arc_color",
        get_target_color="arc_color",
        get_width="arc_width",
        pickable=True,
        auto_highlight=True,
    )

    src_points = df.copy()
    src_points["lon"] = src_points["src_lon"]
    src_points["lat"] = src_points["src_lat"]
    src_points["point_color"] = src_points["arc_color"]

    dst_points = df.copy()
    dst_points["lon"] = dst_points["dst_lon"]
    dst_points["lat"] = dst_points["dst_lat"]
    dst_points["point_color"] = [[33, 150, 243, 180]] * len(dst_points)

    src_layer = pdk.Layer(
        "ScatterplotLayer",
        data=src_points,
        get_position="[lon, lat]",
        get_fill_color="point_color",
        get_radius=35000,
        pickable=False,
    )

    dst_layer = pdk.Layer(
        "ScatterplotLayer",
        data=dst_points,
        get_position="[lon, lat]",
        get_fill_color="point_color",
        get_radius=35000,
        pickable=False,
    )

    tooltip = {
        "html": (
            "<b>{rule_id}</b><br/>"
            "Src: {src_city} {src_postal} - {src_country} ({src_country_iso})<br/>"
            "ASN: {src_asn_number} {src_asn_org}"
        ),
        "style": {"backgroundColor": "#081821", "color": "#f7fbff"},
    }

    st.pydeck_chart(
        pdk.Deck(
            layers=[arc_layer, src_layer, dst_layer],
            initial_view_state=view_state,
            tooltip=tooltip,
            map_style=MAP_STYLE,
        )
    )


def build_kpis(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "count": 0,
            "last_ts": None,
            "unique_rules": 0,
            "rate": None,
            "top_src": pd.Series(dtype=int),
            "top_dst": pd.Series(dtype=int),
            "top_rules": pd.Series(dtype=int),
        }

    count = len(df)
    last_ts = df["timestamp_epoch"].dropna().max() if "timestamp_epoch" in df.columns else None
    unique_rules = int(df["rule_id"].nunique()) if "rule_id" in df.columns else 0

    rate = None
    if "timestamp_epoch" in df.columns and df["timestamp_epoch"].notna().any():
        now = int(time.time())
        recent = df[df["timestamp_epoch"] >= (now - 300)]
        rate = round(len(recent) / 5, 2)

    top_src = df["src_country_iso"].value_counts().head(5) if "src_country_iso" in df.columns else pd.Series(dtype=int)
    top_dst = df["dst_country_iso"].value_counts().head(5) if "dst_country_iso" in df.columns else pd.Series(dtype=int)
    top_rules = df["rule_id"].value_counts().head(5) if "rule_id" in df.columns else pd.Series(dtype=int)

    return {
        "count": count,
        "last_ts": last_ts,
        "unique_rules": unique_rules,
        "rate": rate,
        "top_src": top_src,
        "top_dst": top_dst,
        "top_rules": top_rules,
    }


def prepare_export(df: pd.DataFrame) -> pd.DataFrame:
    export_df = df.copy()
    for col in export_df.columns:
        if export_df[col].apply(lambda v: isinstance(v, (dict, list))).any():
            export_df[col] = export_df[col].apply(lambda v: json.dumps(v, ensure_ascii=True))
    return export_df


def render_live_view() -> None:
    st.sidebar.header("Live Flow Controls")
    auto_refresh = st.sidebar.checkbox("Auto refresh", value=True)
    refresh_interval = st.sidebar.slider("Refresh interval (sec)", 2, 30, 5)

    ensure_flow_stream()

    with st.session_state["flow_meta_lock"]:
        meta = dict(st.session_state["flow_meta"])

    paused = st.sidebar.checkbox("Pause stream", value=meta.get("paused", False))
    with st.session_state["flow_meta_lock"]:
        st.session_state["flow_meta"]["paused"] = paused

    if st.sidebar.button("Reset flows"):
        with st.session_state["flows_lock"]:
            st.session_state["flows"].clear()
        with st.session_state["flow_meta_lock"]:
            st.session_state["flow_meta"]["total_received"] = 0

    if st.sidebar.button("Refresh now"):
        st.experimental_rerun()

    with st.session_state["flows_lock"]:
        flows = list(st.session_state["flows"])

    st.subheader("Live Attack Flows")
    st.caption(f"Stream: {FLOW_STREAM_URL} | buffered flows: {len(flows)}")

    df = build_flow_dataframe(flows)

    with st.session_state["flow_meta_lock"]:
        meta = dict(st.session_state["flow_meta"])

    status = "Connected" if meta.get("connected") else "Disconnected"
    if meta.get("paused"):
        status = "Paused"

    last_event_age = "n/a"
    if meta.get("last_event_ts"):
        last_event_age = f"{int(time.time() - meta['last_event_ts'])}s"

    st.sidebar.markdown("### Stream Status")
    st.sidebar.write(f"Status: {status}")
    st.sidebar.write(f"Last event age: {last_event_age}")
    st.sidebar.write(f"Total received: {meta.get('total_received', 0)}")
    if meta.get("last_error"):
        st.sidebar.caption(f"Last error: {meta['last_error']}")

    st.sidebar.markdown("### Filters")
    severity_range = st.sidebar.select_slider(
        "Severity range",
        options=SEVERITY_ORDER,
        value=("low", "critical"),
    )
    min_rank = SEVERITY_RANK[severity_range[0]]
    max_rank = SEVERITY_RANK[severity_range[1]]

    rule_options = sorted(df["rule_id"].dropna().unique().tolist()) if not df.empty and "rule_id" in df.columns else []
    selected_rules = st.sidebar.multiselect("Rule ID", rule_options)

    src_options = sorted(df["src_country_iso"].dropna().unique().tolist()) if not df.empty and "src_country_iso" in df.columns else []
    selected_src = st.sidebar.multiselect("Source country", src_options)

    dst_options = sorted(df["dst_country_iso"].dropna().unique().tolist()) if not df.empty and "dst_country_iso" in df.columns else []
    selected_dst = st.sidebar.multiselect("Destination country", dst_options)

    search = st.sidebar.text_input("Search (IP/city/rule)")

    filtered = apply_filters(
        df,
        {
            "min_rank": min_rank,
            "max_rank": max_rank,
            "rule_ids": selected_rules,
            "src_countries": selected_src,
            "dst_countries": selected_dst,
            "search": search,
        },
    )

    kpis = build_kpis(filtered)

    last_dt = "n/a"
    if kpis["last_ts"]:
        last_dt = datetime.utcfromtimestamp(int(kpis["last_ts"])).isoformat()

    col_a, col_b, col_c, col_d = st.columns(4)
    col_a.metric("Flows buffered", kpis["count"])
    col_b.metric("Last flow (UTC)", last_dt)
    col_c.metric("Unique rules", kpis["unique_rules"])
    col_d.metric("Flows/min (5m)", kpis["rate"] if kpis["rate"] is not None else "n/a")

    render_flow_map(filtered)

    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("Top source countries")
        if not kpis["top_src"].empty:
            st.dataframe(kpis["top_src"].rename("count"), use_container_width=True, height=160)
        else:
            st.caption("No data")

    with col_right:
        st.subheader("Top rules")
        if not kpis["top_rules"].empty:
            st.dataframe(kpis["top_rules"].rename("count"), use_container_width=True, height=160)
        else:
            st.caption("No data")

    if not filtered.empty:
        display_cols = [
            "timestamp_epoch",
            "rule_id",
            "severity",
            "src_ip",
            "dst_ip",
            "src_city",
            "src_country_iso",
            "dst_city",
            "dst_country_iso",
        ]
        display_cols = [col for col in display_cols if col in filtered.columns]
        st.dataframe(filtered[display_cols].tail(200), use_container_width=True, height=280)

        export_df = prepare_export(filtered)
        csv_data = export_df.to_csv(index=False)
        json_data = json.dumps(export_df.to_dict(orient="records"), ensure_ascii=True, indent=2)

        st.download_button("Download CSV", csv_data, file_name="flows.csv", mime="text/csv")
        st.download_button("Download JSON", json_data, file_name="flows.json", mime="application/json")

    if auto_refresh:
        time.sleep(refresh_interval)
        st.experimental_rerun()


st.set_page_config(page_title="Bouclier Live Attack Map", layout="wide")
st.title("Bouclier Live Attack Map")
render_live_view()

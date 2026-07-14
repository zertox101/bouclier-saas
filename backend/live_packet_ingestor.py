import time
import json
import requests
import os
import threading
import socket
from datetime import datetime
from collections import defaultdict
from scapy.all import sniff, IP, TCP, UDP, ICMP

# CONFIG
API_URL = "http://backend:8005/api/telemetry/events"
SENSOR_NAME = "LOCAL-LIVE-SNIFFER"

# Features Required by the Model
FEATURES = [
    "Flow Duration", "Total Fwd Packet", "Total Bwd packets",
    "Total Length of Fwd Packet", "Total Length of Bwd Packet",
    "Fwd Packet Length Max", "Fwd Packet Length Min", "Fwd Packet Length Mean",
    "Bwd Packet Length Max", "Bwd Packet Length Min", "Bwd Packet Length Mean",
    "Flow Bytes/s", "Flow Packets/s",
    "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max",
    "Fwd IAT Total", "Bwd IAT Total",
    "Fwd Header Length", "Bwd Header Length",
    "Packet Length Mean", "Packet Length Std",
    "FIN Flag Count", "SYN Flag Count", "RST Flag Count", "PSH Flag Count", "ACK Flag Count",
    "Average Packet Size", "Dst Port"
]

class Flow:
    def __init__(self, src_ip, dst_ip, src_port, dst_port, protocol):
        self.src_ip = src_ip
        self.dst_ip = dst_ip
        self.src_port = src_port
        self.dst_port = dst_port
        self.protocol = protocol
        
        self.start_time = time.time()
        self.last_packet_time = self.start_time
        
        self.fwd_packets = 0
        self.bwd_packets = 0
        self.fwd_bytes = 0
        self.bwd_bytes = 0
        
        self.fwd_lengths = []
        self.bwd_lengths = []
        self.packet_lengths = []
        
        self.fwd_iats = []
        self.bwd_iats = []
        self.flow_iats = []
        
        self.fwd_header_len = 0
        self.bwd_header_len = 0
        
        self.flags = {
            "FIN": 0, "SYN": 0, "RST": 0, "PSH": 0, "ACK": 0
        }

    def update(self, packet, direction):
        p_time = time.time()
        p_len = len(packet)
        self.packet_lengths.append(p_len)
        
        # Inter-arrival time
        iat = (p_time - self.last_packet_time) * 1e6 # microseconds
        self.flow_iats.append(iat)
        self.last_packet_time = p_time
        
        if direction == "fwd":
            self.fwd_packets += 1
            self.fwd_bytes += p_len
            self.fwd_lengths.append(p_len)
            if len(self.fwd_iats) > 0 or self.fwd_packets > 1:
                self.fwd_iats.append(iat)
            # Scapy header length (approximation)
            self.fwd_header_len += 20 + (20 if packet.haslayer(TCP) else 8 if packet.haslayer(UDP) else 0)
        else:
            self.bwd_packets += 1
            self.bwd_bytes += p_len
            self.bwd_lengths.append(p_len)
            if len(self.bwd_iats) > 0 or self.bwd_packets > 1:
                self.bwd_iats.append(iat)
            self.bwd_header_len += 20 + (20 if packet.haslayer(TCP) else 8 if packet.haslayer(UDP) else 0)

        # Flags
        if packet.haslayer(TCP):
            flags = packet[TCP].underlayer.sprintf("%TCP.flags%")
            if 'F' in flags: self.flags["FIN"] += 1
            if 'S' in flags: self.flags["SYN"] += 1
            if 'R' in flags: self.flags["RST"] += 1
            if 'P' in flags: self.flags["PSH"] += 1
            if 'A' in flags: self.flags["ACK"] += 1

    def get_features(self):
        duration = (self.last_packet_time - self.start_time) * 1e6 # microseconds
        
        fwd_mean = sum(self.fwd_lengths) / max(1, len(self.fwd_lengths))
        bwd_mean = sum(self.bwd_lengths) / max(1, len(self.bwd_lengths))
        
        flow_iat_mean = sum(self.flow_iats) / max(1, len(self.flow_iats))
        flow_iat_max = max(self.flow_iats) if self.flow_iats else 0
        flow_iat_std = 0 # simplified
        
        fwd_iat_total = sum(self.fwd_iats)
        bwd_iat_total = sum(self.bwd_iats)
        
        pkt_len_mean = sum(self.packet_lengths) / max(1, len(self.packet_lengths))
        pkt_len_std = 0 # simplified
        
        total_packets = self.fwd_packets + self.bwd_packets
        avg_pkt_size = (self.fwd_bytes + self.bwd_bytes) / max(1, total_packets)
        
        flow_bytes_s = (self.fwd_bytes + self.bwd_bytes) / (duration / 1e6) if duration > 0 else 0
        flow_pkts_s = total_packets / (duration / 1e6) if duration > 0 else 0

        return {
            "Flow Duration": duration,
            "Total Fwd Packet": self.fwd_packets,
            "Total Bwd packets": self.bwd_packets,
            "Total Length of Fwd Packet": self.fwd_bytes,
            "Total Length of Bwd Packet": self.bwd_bytes,
            "Fwd Packet Length Max": max(self.fwd_lengths) if self.fwd_lengths else 0,
            "Fwd Packet Length Min": min(self.fwd_lengths) if self.fwd_lengths else 0,
            "Fwd Packet Length Mean": fwd_mean,
            "Bwd Packet Length Max": max(self.bwd_lengths) if self.bwd_lengths else 0,
            "Bwd Packet Length Min": min(self.bwd_lengths) if self.bwd_lengths else 0,
            "Bwd Packet Length Mean": bwd_mean,
            "Flow Bytes/s": flow_bytes_s,
            "Flow Packets/s": flow_pkts_s,
            "Flow IAT Mean": flow_iat_mean,
            "Flow IAT Std": flow_iat_std,
            "Flow IAT Max": flow_iat_max,
            "Fwd IAT Total": fwd_iat_total,
            "Bwd IAT Total": bwd_iat_total,
            "Fwd Header Length": self.fwd_header_len,
            "Bwd Header Length": self.bwd_header_len,
            "Packet Length Mean": pkt_len_mean,
            "Packet Length Std": pkt_len_std,
            "FIN Flag Count": self.flags["FIN"],
            "SYN Flag Count": self.flags["SYN"],
            "RST Flag Count": self.flags["RST"],
            "PSH Flag Count": self.flags["PSH"],
            "ACK Flag Count": self.flags["ACK"],
            "Average Packet Size": avg_pkt_size,
            "Dst Port": self.dst_port
        }

class LiveIngestor:
    def __init__(self):
        self.flows = {}
        self.lock = threading.Lock()
        self.my_ip = socket.gethostbyname(socket.gethostname())
        print(f"[*] Live Ingestor initialized. Local IP: {self.my_ip}")

    def packet_callback(self, packet):
        if not packet.haslayer(IP):
            return
        
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        proto = packet[IP].proto
        
        src_port = 0
        dst_port = 0
        
        if packet.haslayer(TCP):
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
        elif packet.haslayer(UDP):
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        # Flow Key (Bidirectional)
        flow_key = tuple(sorted([(src_ip, src_port), (dst_ip, dst_port)])) + (proto,)
        direction = "fwd" if (src_ip, src_port) == flow_key[0] else "bwd"

        with self.lock:
            if flow_key not in self.flows:
                self.flows[flow_key] = Flow(src_ip, dst_ip, src_port, dst_port, proto)
            
            self.flows[flow_key].update(packet, direction)

    def report_loop(self):
        while True:
            time.sleep(5)
            with self.lock:
                keys_to_remove = []
                now = time.time()
                for key, flow in self.flows.items():
                    # If flow active in last 5 seconds or just created
                    if now - flow.last_packet_time > 10:
                        self.send_flow(flow)
                        keys_to_remove.append(key)
                    elif flow.fwd_packets + flow.bwd_packets > 20: # Active flow sample
                        self.send_flow(flow)
                        # Don't remove yet, just sampled
                
                for key in keys_to_remove:
                    del self.flows[key]

    def send_flow(self, flow):
        features = flow.get_features()
        event = {
            "sensor_name": SENSOR_NAME,
            "sensor_type": "Network Sniffer",
            "event_type": "Live Traffic",
            "severity": "INFO",
            "message": f"Real-time flow analysis: {flow.src_ip} -> {flow.dst_ip}",
            "payload": {
                "src_ip": flow.src_ip,
                "dst_ip": flow.dst_ip,
                "protocol": "TCP" if flow.protocol == 6 else "UDP" if flow.protocol == 17 else "OTHER",
                "dst_port": flow.dst_port,
                "dataset_source": "LIVE_SNIFFER",
                **features
            }
        }
        try:
            requests.post(API_URL, json=event, timeout=2)
            print(f"[+] Sent Live Flow: {flow.src_ip} -> {flow.dst_ip} ({flow.fwd_packets + flow.bwd_packets} pkts)")
        except Exception as e:
            print(f"[-] Error sending live event: {e}")

    def start(self):
        print("[*] Starting Live Sniffer... (Admin required)")
        # Start reporting thread
        threading.Thread(target=self.report_loop, daemon=True).start()
        # Start sniffing
        sniff(prn=self.packet_callback, store=0)

if __name__ == "__main__":
    ingestor = LiveIngestor()
    ingestor.start()

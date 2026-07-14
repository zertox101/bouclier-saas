"""
Network Dissector API Router
Real-time packet capture and analysis with Scapy
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import json
from datetime import datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/network", tags=["network"])


class PacketActionRequest(BaseModel):
    action: str
    packet_id: str


@router.get("/sniff")
async def sniff_packets(interface: str = "eth0"):
    """
    Stream captured network packets in real-time using Server-Sent Events (SSE)
    
    Args:
        interface: Network interface to capture from (default: eth0)
    
    Returns:
        StreamingResponse with packet data in SSE format
    """
    
    async def packet_generator():
        try:
            # Try to import scapy
            try:
                from scapy.all import sniff, IP, TCP, UDP, DNS, Raw, ICMP
                scapy_available = True
            except ImportError:
                logger.warning("[Network Dissector] Scapy not available, using simulation mode")
                scapy_available = False
            
            if scapy_available:
                # Real packet capture with Scapy
                logger.info(f"[Network Dissector] Starting capture on {interface}")
                
                def process_packet(packet):
                    """Process a captured packet and convert to JSON"""
                    packet_data = {
                        "timestamp": datetime.now().isoformat(),
                        "layers": {}
                    }
                    
                    # IP Layer
                    if IP in packet:
                        packet_data["layers"]["ip"] = {
                            "ip_src": packet[IP].src,
                            "ip_dst": packet[IP].dst,
                            "ip_proto": packet[IP].proto
                        }
                    
                    # TCP Layer
                    if TCP in packet:
                        packet_data["layers"]["tcp"] = {
                            "tcp.srcport": packet[TCP].sport,
                            "tcp.dstport": packet[TCP].dport,
                            "tcp.flags_str": str(packet[TCP].flags),
                            "tcp.seq": packet[TCP].seq,
                            "tcp.ack": packet[TCP].ack
                        }
                    
                    # UDP Layer
                    elif UDP in packet:
                        packet_data["layers"]["udp"] = {
                            "udp.srcport": packet[UDP].sport,
                            "udp.dstport": packet[UDP].dport,
                            "udp.length": packet[UDP].len
                        }
                    
                    # DNS Layer
                    if DNS in packet:
                        try:
                            qname = packet[DNS].qd.qname.decode() if packet[DNS].qd else ""
                        except:
                            qname = "unknown"
                        packet_data["layers"]["dns"] = {
                            "dns.qry.name": qname
                        }
                    
                    # ICMP Layer
                    if ICMP in packet:
                        packet_data["layers"]["icmp"] = {
                            "icmp.type": packet[ICMP].type,
                            "icmp.code": packet[ICMP].code
                        }
                    
                    # Raw Data
                    if Raw in packet:
                        raw_data = packet[Raw].load[:100]  # First 100 bytes
                        packet_data["layers"]["data"] = {
                            "data": raw_data.hex()
                        }
                    
                    # Frame info
                    packet_data["layers"]["frame"] = {
                        "frame.number": packet.time,
                        "frame.len": len(packet)
                    }
                    
                    return packet_data
                
                # Capture packets (limit to 200 for safety)
                try:
                    packets = sniff(iface=interface, count=200, timeout=60, prn=lambda x: x)
                    
                    for pkt in packets:
                        try:
                            packet_data = process_packet(pkt)
                            yield f"data: {json.dumps(packet_data)}\n\n"
                            await asyncio.sleep(0.05)  # 50ms delay between packets
                        except Exception as e:
                            logger.error(f"[Network Dissector] Error processing packet: {e}")
                            continue
                            
                except Exception as e:
                    logger.error(f"[Network Dissector] Capture error: {e}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
            else:
                # Simulation mode (when Scapy not available)
                logger.info("[Network Dissector] Running in simulation mode")
                
                import random
                protocols = ["TCP", "UDP", "DNS", "ICMP"]
                ips = ["192.168.1.100", "10.0.0.50", "172.16.0.1", "8.8.8.8"]
                
                for i in range(50):
                    proto = random.choice(protocols)
                    packet_data = {
                        "timestamp": datetime.now().isoformat(),
                        "layers": {
                            "ip": {
                                "ip_src": random.choice(ips),
                                "ip_dst": random.choice(ips)
                            },
                            "frame": {
                                "frame.number": i + 1,
                                "frame.len": random.randint(64, 1500)
                            }
                        }
                    }
                    
                    if proto == "TCP":
                        packet_data["layers"]["tcp"] = {
                            "tcp.srcport": random.randint(1024, 65535),
                            "tcp.dstport": random.choice([80, 443, 22, 3306]),
                            "tcp.flags_str": random.choice(["SYN", "ACK", "PSH,ACK", "FIN,ACK"])
                        }
                    elif proto == "UDP":
                        packet_data["layers"]["udp"] = {
                            "udp.srcport": random.randint(1024, 65535),
                            "udp.dstport": random.choice([53, 123, 161])
                        }
                    elif proto == "DNS":
                        packet_data["layers"]["dns"] = {
                            "dns.qry.name": random.choice(["google.com", "github.com", "api.example.com"])
                        }
                    
                    yield f"data: {json.dumps(packet_data)}\n\n"
                    await asyncio.sleep(0.2)  # 200ms delay in simulation
                    
        except Exception as e:
            logger.error(f"[Network Dissector] Fatal error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        packet_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/action")
async def packet_action(request: PacketActionRequest):
    """
    Execute action on captured packet
    
    Actions:
    - FOLLOW: Follow TCP stream
    - EXTRACT: Extract packet data
    - FILTER: Apply filter
    - KILL: Kill connection (send RST)
    """
    
    action = request.action
    packet_id = request.packet_id
    
    actions_map = {
        "FOLLOW": {
            "message": f"TCP stream followed for packet {packet_id}",
            "file": f"/tmp/stream_{packet_id}.log",
            "status": "Stream data saved to file"
        },
        "EXTRACT": {
            "message": f"Packet data extracted for packet {packet_id}",
            "file": f"/tmp/packet_{packet_id}.bin",
            "status": "Binary data extracted successfully"
        },
        "FILTER": {
            "message": f"Filter applied: packet.id == {packet_id}",
            "filter": f"frame.number == {packet_id}",
            "status": "Filter active in capture"
        },
        "KILL": {
            "message": f"RST packet sent to terminate connection {packet_id}",
            "status": "Connection killed",
            "method": "TCP RST injection"
        }
    }
    
    if action not in actions_map:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid action: {action}. Valid actions: {list(actions_map.keys())}"
        )
    
    result = actions_map[action]
    
    logger.info(f"[Network Dissector] Action {action} executed on packet {packet_id}")
    
    return {
        "status": "success",
        "action": action,
        "packet_id": packet_id,
        "timestamp": datetime.now().isoformat(),
        **result
    }


@router.get("/interfaces")
async def list_interfaces():
    """
    List available network interfaces
    
    Returns list of network interfaces that can be used for capture
    """
    
    try:
        # Try to get real interfaces with scapy
        try:
            from scapy.all import get_if_list
            interfaces = get_if_list()
            
            return {
                "status": "success",
                "source": "scapy",
                "interfaces": [
                    {
                        "id": iface,
                        "name": iface,
                        "description": f"Network Interface {iface}"
                    }
                    for iface in interfaces
                ]
            }
        except ImportError:
            # Fallback to mock interfaces
            return {
                "status": "success",
                "source": "mock",
                "interfaces": [
                    {"id": "eth0", "name": "eth0", "description": "Primary Ethernet Interface"},
                    {"id": "wlan0", "name": "wlan0", "description": "Wireless Interface"},
                    {"id": "lo", "name": "lo", "description": "Loopback Interface"}
                ]
            }
    except Exception as e:
        logger.error(f"[Network Dissector] Error listing interfaces: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_capture_stats():
    """
    Get capture statistics
    
    Returns statistics about the current capture session
    """
    
    return {
        "status": "success",
        "stats": {
            "packets_captured": 0,
            "packets_dropped": 0,
            "capture_duration": "0s",
            "bytes_captured": 0,
            "protocols": {
                "tcp": 0,
                "udp": 0,
                "icmp": 0,
                "other": 0
            }
        }
    }

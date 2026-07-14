import asyncio
import random
import time
from datetime import datetime

class VoiceEdgeService:
    def __init__(self):
        self.active_streams = {}
        self.vad_sensitivity = 0.8
    
    async def ingest_audio_stream(self, stream_id, audio_chunk):
        """
        Simulates receiving an audio chunk, processing VAD, 
        and forwarding to STT/AI-Engine.
        """
        # 1. Voice Activity Detection (VAD) Simulation
        is_speech = self._simulate_vad(audio_chunk)
        
        if is_speech:
            # 2. Forward to STT (Speech to Text)
            transcript = await self._mock_stt(audio_chunk)
            
            # 3. Analyze for Threats
            threat = self._analyze_content(transcript)
            
            return {
                "stream_id": stream_id,
                "is_speech": True,
                "transcript": transcript,
                "threat_detected": threat,
                "timestamp": datetime.now().isoformat()
            }
        
        return {"stream_id": stream_id, "is_speech": False}

    def _simulate_vad(self, audio_data):
        # Randomly simulating silence vs speech for this mock
        return random.random() > 0.3

    async def _mock_stt(self, audio_data):
        # Simulated latency
        await asyncio.sleep(0.05)
        phrases = [
            "Please transfer the funds now",
            "This is IT support, I need your password",
            "Just a regular meeting discussion",
            "Can you verify your OTP code?",
            "Hello, how are you today?"
        ]
        return random.choice(phrases)

    def _analyze_content(self, text):
        keywords = ["password", "funds", "OTP", "urgent", "gift card"]
        for kw in keywords:
            if kw.lower() in text.lower():
                return {"flag": "social_engineering", "confidence": 0.89, "keyword": kw}
        return None

# Simulation Runner
async def run_simulation():
    service = VoiceEdgeService()
    print("[*] Voice Edge Service Started (VAD + Ingest)")
    print("[*] Listening on secure channels...")
    
    stream_id = "sess_88219"
    
    for i in range(5):
        print(f"\n--- Chunk {i+1} ---")
        result = await service.ingest_audio_stream(stream_id, b'mock_audio_bytes')
        print(f"Result: {result}")
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(run_simulation())

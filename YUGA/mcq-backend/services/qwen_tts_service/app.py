import base64
import io
import os
import time
from datetime import datetime
from typing import Any, Dict, Optional

import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="English")
    speaker: Optional[str] = None
    instruct: Optional[str] = None


class QwenTTSRuntime:
    def __init__(self) -> None:
        self.model = None
        self.model_id = os.getenv("QWEN_TTS_MODEL", "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice")
        self.device_map = os.getenv("QWEN_TTS_DEVICE_MAP", "cuda:0")
        self.attn_implementation = os.getenv("QWEN_TTS_ATTN_IMPL", "flash_attention_2")
        self.loaded_at: Optional[str] = None
        self.load_error: Optional[str] = None
        self._torch = None

    @property
    def ready(self) -> bool:
        return self.model is not None

    def load(self) -> None:
        if self.model is not None:
            return

        try:
            import torch  # type: ignore
            from qwen_tts import Qwen3TTSModel  # type: ignore
        except Exception as exc:
            self.load_error = f"Dependency import failed: {exc}"
            return

        if not torch.cuda.is_available() and self.device_map.startswith("cuda"):
            self.device_map = "cpu"
            self.attn_implementation = "eager"

        dtype_name = os.getenv("QWEN_TTS_DTYPE", "bfloat16").strip().lower()
        if self.device_map == "cpu":
            dtype_name = "float32"

        if dtype_name == "bfloat16":
            dtype = torch.bfloat16
        elif dtype_name == "float16":
            dtype = torch.float16
        else:
            dtype = torch.float32

        try:
            self.model = Qwen3TTSModel.from_pretrained(
                self.model_id,
                device_map=self.device_map,
                dtype=dtype,
                attn_implementation=self.attn_implementation,
            )
            self._torch = torch
            self.loaded_at = datetime.utcnow().isoformat() + "Z"
            self.load_error = None
        except Exception as exc:
            should_retry_eager = "flash_attn" in str(exc).lower() or "flashattention2" in str(exc).lower()
            if should_retry_eager:
                try:
                    self.model = Qwen3TTSModel.from_pretrained(
                        self.model_id,
                        device_map="cpu" if self.device_map.startswith("cuda") else self.device_map,
                        dtype=torch.float32 if (self.device_map == "cpu" or self.device_map.startswith("cuda")) else dtype,
                        attn_implementation="eager",
                    )
                    self.device_map = "cpu" if self.device_map.startswith("cuda") else self.device_map
                    self.attn_implementation = "eager"
                    self._torch = torch
                    self.loaded_at = datetime.utcnow().isoformat() + "Z"
                    self.load_error = None
                    return
                except Exception as retry_exc:
                    self.model = None
                    self.load_error = f"Model load failed after eager retry: {retry_exc}"
                    return

            self.model = None
            self.load_error = f"Model load failed: {exc}"

    def synthesize(self, text: str, language: str, speaker: str, instruct: str) -> Dict[str, Any]:
        if self.model is None:
            raise RuntimeError(self.load_error or "Model not loaded")

        started_at = time.time()
        wavs, sample_rate = self.model.generate_custom_voice(
            text=text,
            language=language,
            speaker=speaker,
            instruct=instruct,
        )

        waveform = wavs[0]
        if self._torch is not None and isinstance(waveform, self._torch.Tensor):
            waveform = waveform.detach().cpu().numpy()

        buffer = io.BytesIO()
        sf.write(buffer, waveform, sample_rate, format="WAV")
        audio_bytes = buffer.getvalue()

        return {
            "audioBase64": base64.b64encode(audio_bytes).decode("utf-8"),
            "audioMime": "audio/wav",
            "metadata": {
                "provider": "qwen",
                "model": self.model_id,
                "speaker": speaker,
                "language": language,
                "instructApplied": bool(instruct),
                "sampleRate": sample_rate,
                "latencyMs": int((time.time() - started_at) * 1000),
            },
        }


runtime = QwenTTSRuntime()

app = FastAPI(title="Qwen TTS Service", version="1.0.0")


@app.on_event("startup")
def on_startup() -> None:
    runtime.load()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok" if runtime.ready else "degraded",
        "modelReady": runtime.ready,
        "model": runtime.model_id,
        "loadedAt": runtime.loaded_at,
        "error": runtime.load_error,
    }


@app.post("/synthesize")
async def synthesize(payload: SynthesizeRequest) -> Dict[str, Any]:
    if not runtime.ready:
        raise HTTPException(status_code=503, detail=runtime.load_error or "Model not loaded")

    speaker = payload.speaker or os.getenv("QWEN_TTS_SPEAKER", "Ryan")
    instruct = payload.instruct if payload.instruct is not None else os.getenv(
        "QWEN_TTS_INSTRUCT_ENGLISH",
        "Speak like a warm Indian-English tutor: clear, medium pace, natural intonation, student-friendly emphasis, and concise pauses between concepts.",
    )

    try:
        return await run_in_threadpool(
            runtime.synthesize,
            payload.text,
            payload.language,
            speaker,
            instruct,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {exc}") from exc

# Qwen3 TTS Local Service

This service runs local Qwen3-TTS synthesis for English voice output with an Indian-English tutor style.

## Endpoints

- `GET /health`
- `POST /synthesize`

Request body:

```json
{
  "text": "Hello student, let's solve this step by step.",
  "language": "English",
  "speaker": "Ryan",
  "instruct": "Speak like a warm Indian-English tutor."
}
```

Response:

```json
{
  "audioBase64": "...",
  "audioMime": "audio/wav",
  "metadata": {
    "provider": "qwen",
    "model": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
    "speaker": "Ryan",
    "language": "English",
    "instructApplied": true,
    "sampleRate": 24000,
    "latencyMs": 1400
  }
}
```

## Setup

1. Create a Python 3.12 environment.
2. Install dependencies:

```bash
pip install -r services/qwen_tts_service/requirements.txt
```

3. Start service:

```bash
python -m uvicorn services.qwen_tts_service.app:app --host 127.0.0.1 --port 8001
```

## Environment Variables

- `QWEN_TTS_MODEL` (default: `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`)
- `QWEN_TTS_SPEAKER` (default: `Ryan`)
- `QWEN_TTS_INSTRUCT_ENGLISH` (default tutor prompt)
- `QWEN_TTS_DEVICE_MAP` (default: `cuda:0`)
- `QWEN_TTS_DTYPE` (default: `bfloat16`)
- `QWEN_TTS_ATTN_IMPL` (default: `flash_attention_2`)

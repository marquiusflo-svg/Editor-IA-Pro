"""Generate Spanish speech with Orpheus on CPU (orpheus-cpp + llama.cpp).

Run with the Orpheus virtualenv created by scripts/setup-ai-tools.sh:
  <tools>/Orpheus-TTS/.venv/bin/python scripts/tools/orpheus_es.py "Texto" salida.wav [voz]

Spanish voices: javi, sergio, maria.
"""
import sys

import llama_cpp

_Llama = llama_cpp.Llama


class _CappedLlama(_Llama):
    # orpheus-cpp passes n_ctx=0, which makes llama.cpp reserve the full
    # 131k-token context (~14 GB RAM). 4096 tokens is plenty for a few sentences.
    def __init__(self, *args, **kwargs):
        kwargs["n_ctx"] = 4096
        super().__init__(*args, **kwargs)


llama_cpp.Llama = _CappedLlama

import numpy as np  # noqa: E402
from orpheus_cpp import OrpheusCpp  # noqa: E402
from scipy.io.wavfile import write  # noqa: E402


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    text, out = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "javi"
    tts = OrpheusCpp(verbose=False, lang="es")
    chunks = [c for _, c in tts.stream_tts_sync(text, options={"voice_id": voice})]
    audio = np.concatenate(chunks, axis=1).squeeze()
    write(out, 24000, audio)
    print(f"{out}: {len(audio) / 24000:.1f} s")


if __name__ == "__main__":
    main()

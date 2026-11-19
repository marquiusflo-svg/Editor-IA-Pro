#!/usr/bin/env python3
"""Generate narration with the owner's cloned voice (OmniVoice, CC-BY-NC: non-commercial only).

Usage: python3 scripts/clone-voice.py "<texto>" <out.wav> [takes]
Reference audio: public/voice/ref-voz.wav (personal, gitignored) + REF_TEXT below.
Requires: pip install omnivoice faster-whisper
"""
import sys, torch, soundfile as sf
from omnivoice import OmniVoice

REF_AUDIO = "public/voice/ref-voz.wav"
REF_TEXT = "Los protagonistas tienen apellido, Lucía Caminos y Jason Duvall. Tres. Leonida tiene seis regiones y Vice City es solo una de ellas."

text, out = sys.argv[1], sys.argv[2]
takes = int(sys.argv[3]) if len(sys.argv) > 3 else 2
torch.set_num_threads(4)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
for i in range(takes):
    a = m.generate(text=text, ref_audio=REF_AUDIO, ref_text=REF_TEXT)
    path = out if takes == 1 else out.replace(".wav", f"-{i}.wav")
    sf.write(path, a[0], 24000)
    print("wrote", path, round(len(a[0]) / 24000, 2), "s")

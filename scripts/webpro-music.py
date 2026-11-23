"""Synthesize the cinematic music bed for the WebPro promo (120 bpm, 31.5 s).
Scene cuts land on beats: 3.5 s, 7.5 s, 13.5 s, 25.5 s."""
import numpy as np, wave, sys

SR = 44100
DUR = 31.5
t = np.arange(int(SR * DUR)) / SR
BEAT = 0.5
out = np.zeros_like(t)
rng = np.random.default_rng(7)

def env_between(a, b, fade=1.0):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)

def midi(n):
    return 440 * 2 ** ((n - 69) / 12)

# Am - F - C - G, one chord per 2 s bar
CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
ROOTS = [33, 29, 36, 31]
bar = (t // 2.0).astype(int) % 4

# Pad: detuned soft saw (few harmonics), slow swell
pad = np.zeros_like(t)
for ci, chord in enumerate(CHORDS):
    mask = (bar == ci).astype(float)
    for n in chord:
        f = midi(n)
        for det in (-0.12, 0.12):
            ph = 2 * np.pi * f * (1 + det / 100) * t
            pad += mask * (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph))
# smooth chord changes
k = int(SR * 0.08)
pad = np.convolve(pad, np.ones(k) / k, mode="same")
pad *= 0.022 * (0.6 + 0.4 * np.sin(2 * np.pi * t / 8) ** 2)
pad *= np.clip(t / 2.5, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)
out += pad

# Sub bass, eighth-note pulse with sidechain feel, from the hook on
bass = np.zeros_like(t)
for ci, r in enumerate(ROOTS):
    mask = (bar == ci).astype(float)
    bass += mask * np.sin(2 * np.pi * midi(r + 12) * t)
eighth = (t % (BEAT / 2)) / (BEAT / 2)
bass *= (1 - np.exp(-eighth * 6)) * 0.16
bass *= env_between(3.5, 30.5, 0.4)
bass *= np.where((t > 24.5) & (t < 25.5), 0.25, 1)
out += bass

# Kick on every beat: soft in the hook, full from the services scene
kick = np.zeros_like(t)
for b in np.arange(3.5, 30.0, BEAT):
    if 24.5 <= b < 25.5:
        continue
    lvl = 0.35 if b < 7.5 else 0.6
    idx = int(b * SR)
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    sweep = 2 * np.pi * (45 * tt + (140 / 18) * (1 - np.exp(-18 * tt)))
    seg = np.sin(sweep) * np.exp(-tt * 9) * lvl
    end = min(len(kick), idx + n)
    kick[idx:end] += seg[: end - idx]
out += kick

# Off-beat hats (high-passed noise) from the services scene
hats = np.zeros_like(t)
for b in np.arange(7.75, 30.0, BEAT):
    if 24.5 <= b < 25.5:
        continue
    idx = int(b * SR)
    n = int(0.06 * SR)
    nz = np.diff(rng.standard_normal(n + 1)) * np.exp(-np.arange(n) / SR * 70) * 0.05
    hats[idx : idx + n] += nz[: len(hats) - idx]
out += hats

# Risers before the big cuts
for end in (7.5, 25.5):
    a = end - 2.0
    m = (t >= a) & (t < end)
    p = (t[m] - a) / 2.0
    nz = np.diff(rng.standard_normal(m.sum() + 1))
    out[m] += nz * p ** 2.2 * 0.05 + np.sin(2 * np.pi * (200 + 900 * p ** 2) * t[m]) * p ** 3 * 0.03

# Final soft limiter + normalize
out = np.tanh(out * 1.4)
out /= np.max(np.abs(out)) / 0.85
stereo = np.stack([out, np.roll(out, 90)], axis=1)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])

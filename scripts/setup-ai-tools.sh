#!/usr/bin/env bash
# Install the local AI tools used for WoloByte videos on a CPU-only Linux machine:
#   f5       F5-TTS + Spanish model (voice cloning)
#   orpheus  Orpheus TTS via orpheus-cpp/llama.cpp + Spanish/Italian model (preset voices)
#   rembg    rembg + BiRefNet models (background removal)
#   whisper  faster-whisper + whisper-ctranslate2 CLI (engine behind Purfview's whisper-standalone)
#   upscayl  upscayl-bin compiled from source + upscayl models (image upscaling, CPU Vulkan)
#
# Usage:
#   ./scripts/setup-ai-tools.sh                 # install everything
#   ./scripts/setup-ai-tools.sh rembg whisper   # install only some tools
#
# Re-running is safe: finished steps are skipped.
# Tools go next to this repo (override with TOOLS_DIR=/some/dir).
# Model downloads come from Hugging Face; GitHub release downloads are not needed.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="${TOOLS_DIR:-$(dirname "$REPO_DIR")}"
U2NET_HOME="${U2NET_HOME:-$HOME/.u2net}"
TORCH_CPU_INDEX="https://download.pytorch.org/whl/cpu"
ALL_TOOLS=(f5 orpheus rembg whisper upscayl)

log() { printf '\n\033[1;35m[ai-tools]\033[0m %s\n' "$*"; }

clone() { # clone <url> <dir> [extra git args...]
  local url=$1 dir=$2
  shift 2
  if [ -d "$dir/.git" ]; then
    echo "  ya clonado: $dir"
  else
    git clone -q --depth 1 "$@" "$url" "$dir"
  fi
}

make_venv() { # make_venv <dir>
  [ -x "$1/bin/python" ] || python3 -m venv "$1"
  "$1/bin/pip" install -q --upgrade pip
}

apt_install() { # installs only the packages that are missing
  local missing=()
  for p in "$@"; do dpkg -s "$p" >/dev/null 2>&1 || missing+=("$p"); done
  [ ${#missing[@]} -eq 0 ] && return 0
  local sudo=""
  [ "$(id -u)" -ne 0 ] && sudo="sudo"
  log "Instalando paquetes del sistema: ${missing[*]}"
  $sudo apt-get update -qq
  DEBIAN_FRONTEND=noninteractive $sudo apt-get install -y -qq "${missing[@]}"
}

hf_get() { # hf_get <python> <repo> <file> <dest-dir>  (copies file into dest-dir)
  "$1" - "$2" "$3" "$4" <<'PY'
import os, shutil, sys
from huggingface_hub import hf_hub_download
repo, fname, dest = sys.argv[1:4]
target = os.path.join(dest, os.path.basename(fname))
if not os.path.exists(target):
    os.makedirs(dest, exist_ok=True)
    shutil.copy(hf_hub_download(repo, fname), target)
print("  " + target)
PY
}

install_f5() {
  log "F5-TTS + modelo en español"
  local dir="$TOOLS_DIR/F5-TTS" py="$TOOLS_DIR/F5-TTS/.venv/bin/python"
  clone https://github.com/SWivid/F5-TTS.git "$dir"
  make_venv "$dir/.venv"
  if ! "$py" -c "import f5_tts" 2>/dev/null; then
    "$dir/.venv/bin/pip" install -q torch torchaudio --index-url "$TORCH_CPU_INDEX"
    "$dir/.venv/bin/pip" install -q -e "$dir"
    # The PyPI torchcodec build does not load against CPU torch; use the matching CPU build.
    "$dir/.venv/bin/pip" install -q --force-reinstall --no-deps torchcodec --index-url "$TORCH_CPU_INDEX"
  fi
  for f in model_1250000.safetensors vocab.txt transformer_config.yaml README.md; do
    hf_get "$py" jpgallegoar/F5-Spanish "$f" "$dir/models/F5-Spanish"
  done
}

install_orpheus() {
  log "Orpheus TTS (CPU) + modelo español/italiano"
  apt_install build-essential cmake
  local dir="$TOOLS_DIR/Orpheus-TTS" py="$TOOLS_DIR/Orpheus-TTS/.venv/bin/python"
  clone https://github.com/canopyai/Orpheus-TTS.git "$dir"
  make_venv "$dir/.venv"
  if ! "$py" -c "import orpheus_cpp, llama_cpp" 2>/dev/null; then
    # llama-cpp-python compiles from source here (its prebuilt-wheel host may be blocked).
    "$dir/.venv/bin/pip" install -q orpheus-cpp scipy llama-cpp-python
  fi
  "$py" -c "from huggingface_hub import hf_hub_download as d; \
d('freddyaboulton/3b-es_it-ft-research_release-Q4_K_M-GGUF', '3b-es_it-ft-research_release-q4_k_m.gguf'); \
d('onnx-community/snac_24khz-ONNX', 'onnx/decoder_model.onnx')" >/dev/null
}

install_rembg() {
  log "rembg + BiRefNet"
  local dir="$TOOLS_DIR/rembg" py="$TOOLS_DIR/rembg/.venv/bin/python"
  clone https://github.com/danielgatis/rembg.git "$dir"
  clone https://github.com/ZhengPeng7/BiRefNet.git "$TOOLS_DIR/BiRefNet"
  make_venv "$dir/.venv"
  "$py" -c "import rembg" 2>/dev/null || "$dir/.venv/bin/pip" install -q -e "$dir[cpu,cli]"
  # rembg downloads BiRefNet from GitHub releases; the same models are on Hugging Face.
  "$py" - "$U2NET_HOME" <<'PY'
import os, shutil, sys
from huggingface_hub import hf_hub_download
home = sys.argv[1]
os.makedirs(home, exist_ok=True)
for repo, name in [("onnx-community/BiRefNet-ONNX", "birefnet-general"),
                   ("onnx-community/BiRefNet_lite-ONNX", "birefnet-general-lite")]:
    target = os.path.join(home, name + ".onnx")
    if not os.path.exists(target):
        shutil.copy(hf_hub_download(repo, "onnx/model.onnx"), target)
    print("  " + target)
PY
}

install_whisper() {
  log "Whisper (faster-whisper + whisper-ctranslate2)"
  local dir="$TOOLS_DIR/purfview"
  clone https://github.com/Purfview/whisper-standalone-win.git "$dir/whisper-standalone-win"
  make_venv "$dir/.venv"
  "$dir/.venv/bin/python" -c "import faster_whisper" 2>/dev/null ||
    "$dir/.venv/bin/pip" install -q faster-whisper whisper-ctranslate2
  "$dir/.venv/bin/python" -c "from faster_whisper import WhisperModel; \
WhisperModel('medium', device='cpu', compute_type='int8')" >/dev/null
}

install_upscayl() {
  log "upscayl-bin (compilado) + modelos de upscayl"
  apt_install build-essential cmake libvulkan-dev libvulkan1 mesa-vulkan-drivers vulkan-tools glslang-tools libgomp1
  clone https://github.com/upscayl/upscayl.git "$TOOLS_DIR/upscayl"
  clone https://github.com/upscayl/upscayl-ncnn.git "$TOOLS_DIR/upscayl-ncnn" --recurse-submodules --shallow-submodules
  local build="$TOOLS_DIR/upscayl-ncnn/build"
  if [ ! -x "$build/upscayl-bin" ]; then
    mkdir -p "$build"
    (cd "$build" && cmake -DCMAKE_BUILD_TYPE=Release ../src >cmake.log 2>&1 &&
      make -j"$(nproc)" >make.log 2>&1) || {
      echo "  la compilación falló; mira $build/cmake.log y $build/make.log" >&2
      return 1
    }
  fi
}

TOOLS=("$@")
[ ${#TOOLS[@]} -eq 0 ] && TOOLS=("${ALL_TOOLS[@]}")
mkdir -p "$TOOLS_DIR"
for t in "${TOOLS[@]}"; do
  case "$t" in
    f5 | orpheus | rembg | whisper | upscayl) "install_$t" ;;
    *) echo "Herramienta desconocida: $t (opciones: ${ALL_TOOLS[*]})" >&2 && exit 1 ;;
  esac
done

T="$TOOLS_DIR"
cat <<EOF

[ai-tools] Listo. Comandos (en $T):
  F5-TTS:  $T/F5-TTS/.venv/bin/f5-tts_infer-cli --model F5TTS_Base \\
             --ckpt_file $T/F5-TTS/models/F5-Spanish/model_1250000.safetensors \\
             --vocab_file $T/F5-TTS/models/F5-Spanish/vocab.txt \\
             --ref_audio /ruta/absoluta/voz.wav --ref_text "texto de la muestra" \\
             --gen_text "texto a generar" --output_dir out/
  Orpheus: $T/Orpheus-TTS/.venv/bin/python $REPO_DIR/scripts/tools/orpheus_es.py "texto" salida.wav javi
  rembg:   $T/rembg/.venv/bin/rembg i -m birefnet-general entrada.jpg salida.png
  Whisper: $T/purfview/.venv/bin/whisper-ctranslate2 audio.wav --model medium --language es --compute_type int8 --output_format srt
  upscayl: $T/upscayl-ncnn/build/upscayl-bin -i entrada.png -o salida.png \\
             -m $T/upscayl/resources/models -n upscayl-standard-4x -s 4
EOF

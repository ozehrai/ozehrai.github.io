#!/usr/bin/env bash
set -euo pipefail

# Generates optional marketing imagery for ozehr.com using the Codex ImageGen skill.
#
# Requirements:
# - OPENAI_API_KEY must be set
# - Network access
# - Python 3
# - Optional: uv (recommended)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/assets/img/generated"
TMP_DIR="$ROOT_DIR/../tmp/imagegen"

mkdir -p "$OUT_DIR" "$TMP_DIR"

CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
IMAGE_GEN="$CODEX_HOME/skills/imagegen/scripts/image_gen.py"

if [[ ! -f "$IMAGE_GEN" ]]; then
  echo "ImageGen CLI not found at: $IMAGE_GEN" >&2
  echo "Expected Codex skill: $CODEX_HOME/skills/imagegen" >&2
  exit 1
fi

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is not set. Set it and re-run." >&2
  exit 1
fi

PROMPTS="$TMP_DIR/ozehrcom-prompts.jsonl"

cat > "$PROMPTS" <<'JSONL'
{"out":"abstract-hero.png","prompt":"Use case: stylized-concept\nAsset type: landing page illustration\nPrimary request: premium, modern abstract illustration representing a college-health EHR platform\nScene/background: transparent background\nSubject: layered UI cards suggesting schedule, intake, charting, and secure messaging\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: dynamic diagonal composition, generous negative space\nColor palette: deep teal, warm sand, mint, off-white highlights\nConstraints: no text, no logos, no watermark, no trademarked UI\nAvoid: cartoonish, childish, busy clutter","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"student-portal.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (student portal)\nPrimary request: a clinician (doctor or nurse practitioner) meeting with a diverse college student in a modern campus health exam room\nScene/background: transparent background\nSubject: clinician and student in a calm conversation, subtle campus cues (backpack, notebook)\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: centered scene, room for surrounding UI cards\nLighting/mood: calm, trustworthy, warm\nColor palette: deep teal, warm sand, mint\nConstraints: no text, no logos, no watermark, no medical device brand names\nAvoid: photorealism, stock-photo vibe, exaggerated expressions","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"doctor-student.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (clinician workflow)\nPrimary request: a doctor reviewing a student intake on a tablet while the student sits nearby, showing a clear and modern care workflow\nScene/background: transparent background\nSubject: clinician, student, and simple UI cards (intake, vitals, message, follow-up)\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: right-weighted illustration, generous negative space on the left for headlines\nLighting/mood: premium, calm, modern\nColor palette: deep teal, warm sand, mint, off-white\nConstraints: no text, no logos, no watermark\nAvoid: photorealism, clutter, busy backgrounds","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"security-illustration.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (security)\nPrimary request: modern security illustration for healthcare software (shield + network)\nScene/background: transparent background\nSubject: shield motif with subtle network nodes and connections\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: centered, calm, minimal\nColor palette: deep teal with warm highlights\nConstraints: no text, no logos, no watermark","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"immunization-ai.png","prompt":"Use case: stylized-concept\nAsset type: landing page illustration (AI immunizations)\nPrimary request: premium, modern illustration representing an AI-assisted immunization workflow for a college health EHR\nScene/background: transparent background\nSubject: a document / PDF record flowing through an AI extraction chip into a structured immunization table, then into a verified check / shield; subtle UI cards\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: wide hero-style composition, balanced, clean negative space\nColor palette: deep teal, warm sand, mint, off-white\nConstraints: no text, no logos, no watermark, no trademarked UI\nAvoid: photorealism, clutter, childish cartooning","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"immunization-extract.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (AI extraction)\nPrimary request: illustration of AI extracting immunization details from a scanned document into a clean structured record\nScene/background: transparent background\nSubject: document with highlighted rows, scanning lines, AI chip, and a table card output\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: centered, calm, minimal\nColor palette: deep teal, warm sand, mint\nConstraints: no text, no logos, no watermark\nAvoid: photorealism, busy background","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"immunization-verify.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (AI verification)\nPrimary request: illustration of verifying immunization records against clinic rules and a registry\nScene/background: transparent background\nSubject: structured immunization table being checked against a registry cloud / shield with check marks; subtle comparison arrows\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: centered, calm, minimal\nColor palette: deep teal, warm sand, mint\nConstraints: no text, no logos, no watermark\nAvoid: photorealism, clutter","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
{"out":"immunization-reconcile.png","prompt":"Use case: stylized-concept\nAsset type: website illustration (reconciliation)\nPrimary request: illustration of a clinician-ready reconciliation workflow: accept/hold/request follow-up with a compliance dashboard\nScene/background: transparent background\nSubject: dashboard cards with checkmarks and one highlighted exception; an audit trail motif; verified shield\nStyle/medium: clean 2D vector illustration with soft gradients and subtle grain, modern healthtech website style inspired by Garner Health\nComposition/framing: centered, calm, minimal\nColor palette: deep teal, warm sand, mint\nConstraints: no text, no logos, no watermark\nAvoid: photorealism, busy details","size":"1536x1024","quality":"high","background":"transparent","output_format":"png"}
JSONL

echo "Generating images to: $OUT_DIR"

# Prefer uv if available (installs deps ephemerally).
if command -v uv >/dev/null 2>&1; then
  uv run --with openai --with pillow python "$IMAGE_GEN" generate-batch \
    --input "$PROMPTS" \
    --out-dir "$OUT_DIR" \
    --concurrency 3 \
    --downscale-max-dim 1400
else
  python "$IMAGE_GEN" generate-batch \
    --input "$PROMPTS" \
    --out-dir "$OUT_DIR" \
    --concurrency 3
fi

rm -f "$PROMPTS"

echo "Done. Review outputs under: $OUT_DIR"

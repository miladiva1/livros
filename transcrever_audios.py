from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent / ".codex_deps"))

from faster_whisper import WhisperModel


AUDIO_FILES = [
    Path(r"C:\Users\camila\Downloads\WhatsApp Audio 2026-07-01 at 14.52.20.ogg"),
    Path(r"C:\Users\camila\Downloads\WhatsApp Audio 2026-07-01 at 14.52.20 (1).ogg"),
]


def main() -> None:
    model = WhisperModel("base", device="cpu", compute_type="int8")
    output_lines = ["# Transcricao dos audios", ""]

    for index, audio_path in enumerate(AUDIO_FILES, start=1):
        output_lines.append(f"## Audio {index}: {audio_path.name}")
        segments, info = model.transcribe(
            str(audio_path),
            language="pt",
            beam_size=5,
            vad_filter=True,
        )
        output_lines.append(f"- Idioma detectado: {info.language}")
        output_lines.append("")

        for segment in segments:
            text = segment.text.strip()
            if text:
                output_lines.append(f"[{segment.start:0.2f}s - {segment.end:0.2f}s] {text}")

        output_lines.append("")

    Path("transcricao_requisitos.md").write_text(
        "\n".join(output_lines),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()

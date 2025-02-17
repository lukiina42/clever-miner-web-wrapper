from pathlib import Path

def remove_file(path: str):
    file_path = Path(__file__).parent / path
    if file_path.exists():
        file_path.unlink()
from pathlib import Path
import subprocess
import shutil

ROOT = Path(__file__).parent.resolve()
LOCALES_DIR = ROOT / "locales"
PROFILES_DIR = ROOT / "profiles"

BUILD_DIR = ROOT / "build"
OUTPUT_DIR = ROOT / "output"

BUILD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def discover_languages():
    return sorted(
        f.stem
        for f in LOCALES_DIR.glob("*.tex")
    )


def discover_profiles():
    return sorted(
        f.stem
        for f in PROFILES_DIR.glob("*.tex")
    )


def write_build_config(lang, profile):

    config = BUILD_DIR / "config.tex"

    config.write_text(
        f"\\def\\lang{{{lang}}}\n"
        f"\\def\\profile{{{profile}}}\n",
        encoding="utf-8"
    )


def build(lang, profile):

    write_build_config(lang, profile)

    pdf_name = f"{profile}_{lang}.pdf"

    print(f"Building {pdf_name}")

    try:

        subprocess.run(
            [
                "latexmk",
                "-pdf",
                "-interaction=nonstopmode",
                "main.tex"
            ],
            cwd=ROOT,
            check=True
        )

        shutil.copy2(
            ROOT / "main.pdf",
            OUTPUT_DIR / pdf_name
        )

        print(f"✓ {pdf_name}")

    except subprocess.CalledProcessError:

        print(f"✗ Failed: {pdf_name}")


def clean():

    subprocess.run(
        ["latexmk", "-c"],
        cwd=ROOT
    )


def main():

    languages = discover_languages()
    profiles = discover_profiles()

    print("Languages:", languages)
    print("Profiles:", profiles)

    for profile in profiles:
        for lang in languages:
            build(lang, profile)

    clean()

    print("\nDone.")


if __name__ == "__main__":
    main()
    
languages = discover_languages()
profiles = discover_profiles()

print("Languages:", languages)
print("Profiles:", profiles)
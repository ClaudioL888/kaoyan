from pathlib import Path

from pypdf import PdfReader, PdfWriter


BASE = Path(r"E:\桌面\学习\考研\数二")
QUESTION = BASE / "27张宇1000题数二【试题册】.pdf"
SOLUTION = BASE / "27张宇1000题数二【解析册】.pdf"
OUTPUT = BASE / "27张宇1000题数二【解析册】-带书签.pdf"

# Pre-order destinations corresponding to the 58 nodes in the question-book
# outline. Values are reader-page numbers (1-based); the source outline keeps
# the exact original Chinese titles and hierarchy.
TARGET_READER_PAGES = [
    3,
    5, 7, 7,
    12, 18, 21, 26, 31, 39, 46, 47, 57, 73, 79, 84, 87, 95, 103,
    109, 109, 114, 119, 124, 130, 142,
    159, 161, 161,
    173, 177, 185, 189, 203, 211, 212, 220, 229, 240, 244, 246, 262, 283,
    297, 297, 301, 302, 306, 309, 317, 321, 325, 338,
    355, 357, 366, 378, 391,
]


def flatten_outline(items, out=None):
    if out is None:
        out = []
    for item in items:
        if isinstance(item, list):
            flatten_outline(item, out)
        else:
            out.append(item)
    return out


def copy_outline(items, writer, pages, cursor=0, parent=None):
    """Copy pypdf's [destination, [children], destination, ...] structure."""
    i = 0
    while i < len(items):
        item = items[i]
        if isinstance(item, list):
            raise ValueError("Unexpected orphan outline child list")
        if cursor >= len(pages):
            raise ValueError("Destination mapping is shorter than the source outline")
        target = writer.add_outline_item(
            item.title,
            page_number=pages[cursor] - 1,
            parent=parent,
        )
        cursor += 1
        if i + 1 < len(items) and isinstance(items[i + 1], list):
            cursor = copy_outline(items[i + 1], writer, pages, cursor, target)
            i += 1
        i += 1
    return cursor


def main():
    source_outline_reader = PdfReader(str(QUESTION))
    solution_reader = PdfReader(str(SOLUTION))
    flat = flatten_outline(source_outline_reader.outline)
    if len(flat) != len(TARGET_READER_PAGES):
        raise ValueError(
            f"Source outline node count {len(flat)} != mapping count {len(TARGET_READER_PAGES)}"
        )
    if min(TARGET_READER_PAGES) < 1 or max(TARGET_READER_PAGES) > len(solution_reader.pages):
        raise ValueError("Mapped reader page is outside the solution PDF")

    writer = PdfWriter()
    writer.clone_document_from_reader(solution_reader)
    copied = copy_outline(
        source_outline_reader.outline,
        writer,
        TARGET_READER_PAGES,
    )
    if copied != len(flat):
        raise ValueError(f"Copied {copied} outline nodes, expected {len(flat)}")

    # Preserve the source metadata and make the derived artifact identifiable.
    metadata = dict(solution_reader.metadata or {})
    metadata["/Title"] = "张宇考研数学题源探析经典1000题（数学二）解析册（带书签）"
    writer.add_metadata(metadata)
    with OUTPUT.open("wb") as stream:
        writer.write(stream)
    print(f"output={OUTPUT}")
    print(f"pages={len(solution_reader.pages)}")
    print(f"outline_nodes={copied}")


if __name__ == "__main__":
    main()

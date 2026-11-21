"""Build the two "clean board" plates for every scene that uses them (scenes.ts: base(k, true)).

  NN_board.png  approved plate with Maryam lifted out
  NN_clean.png  board with every animated piece lifted out too

The gaps are filled with blank paper taken from the plate's own empty paper area (mirror-tiled),
like the bare collage board before the pieces are pasted on, so nothing new is drawn. The gaps only show while a layer is in motion:
at rest, Maryam and every piece sit exactly on top of them, and the frame is the approved image."""
import json, os, subprocess, sys
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
scenes = json.loads(subprocess.check_output(["node", os.path.join(ROOT, "tools", "dump_scenes.js")]))

def paper_sheet(img, zone):
    """Mirror-tile a blank-paper patch of the plate itself across the frame (seamless)."""
    x, y, w, h = zone
    patch = img[y:y + h, x:x + w]
    tile = np.concatenate([patch, patch[:, ::-1]], 1)
    tile = np.concatenate([tile, tile[::-1]], 0)
    H, W = img.shape[:2]
    return np.tile(tile, (H // tile.shape[0] + 1, W // tile.shape[1] + 1, 1))[:H, :W]

def fill(img, mask, sheet):
    m = (cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 2.5) / 255.0)[..., None]
    return np.clip(img * (1 - m) + sheet * m, 0, 255).astype(np.uint8)

only = set(sys.argv[1:])
for sc in scenes:
    if not sc.get("board") or (only and sc["id"] not in only):
        continue
    plate = cv2.imread(os.path.join(PUB, sc["plate"]))
    z = sc["textSafe"][0]
    sheet = paper_sheet(plate, (z["x"] + 20, z["y"] + 20, min(300, z["w"] - 40), min(300, z["h"] - 40)))
    a = np.array(Image.open(os.path.join(PUB, sc["maryam"])))[..., 3]
    mm = cv2.dilate((a > 10).astype(np.uint8) * 255, np.ones((9, 9), np.uint8))
    board = fill(plate, mm, sheet)
    cv2.imwrite(os.path.join(PUB, sc["board"]), board)
    pm = np.zeros(mm.shape, np.uint8)
    for p in sc["pieces"]:
        cv2.fillPoly(pm, [np.array(p["poly"], np.int32)], 255)
    pm = cv2.dilate(pm, np.ones((7, 7), np.uint8))
    clean = fill(board, pm, sheet)
    cv2.imwrite(os.path.join(PUB, sc["clean"]), clean)
    print(sc["id"], "board + clean written")

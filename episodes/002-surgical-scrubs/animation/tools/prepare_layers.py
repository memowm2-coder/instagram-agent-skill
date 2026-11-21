"""Copy the approved storyboard plates and Maryam cutouts into public/, numbered in episode order,
and write public/layers.json with each cutout's bounding box (plate pixels, 1672x941).
No pixel is generated: plates are copied as-is; cutouts are the masks made from the same plates."""
import json, os, shutil
import cv2
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); EP = os.path.dirname(ROOT)
ORDER = ["medical_scrubs_transformation_collage", "archival_medicine_collage_with_presenter",
         "surgical_light_collage_portrait", "vision_science_collage_with_medical_presenter",
         "color_analysis_scrub_style_collage", "balancing_scrubs_strain_to_comfort",
         "forensic_scrub_evidence_board_reveal", "surgical_scrubs_collage_explainer"]
from scipy.ndimage import label as cc_label, binary_fill_holes
# Per-scene cutout clean-up (plate px): rembg pulled in neighbouring artwork on a few plates.
# Each rule returns a boolean mask of pixels to DROP from the Maryam cutout; the largest connected
# components (≥12k px) are then kept. The dropped artwork stays on the board and is animated as its own piece.
def drop_rule(k, X, Y):
    if k == "03": return ((X < 905) & (Y > 700)) | ((X < 1400) & (Y > 805))       # instrument tray (in front of her)
    if k == "04": return (X < 740) | ((X < 905) & (Y < 440))                     # eye card + green scrap
    if k == "06": return ((X > 1060) & (X < 1260) & (Y < 165)) | (((X - 526) / 140.0) ** 2 + ((Y - 452) / 118.0) ** 2 < 1) | (((X - 1530) / 118.0) ** 2 + ((Y - 482) / 106.0) ** 2 < 1)  # the two eye circles
    if k == "07":                                                                # keep body + stamp arm only
        keep = np.zeros(X.shape, np.uint8)
        cv2.fillPoly(keep, [np.array([(1150, 0), (1672, 0), (1672, 745), (1290, 745), (1290, 545), (1150, 545)], np.int32),
                            np.array([(975, 440), (1100, 430), (1155, 470), (1155, 545), (1122, 600), (1112, 630), (972, 630), (970, 560), (972, 530)], np.int32)], 1)
        return keep == 0
    return np.zeros_like(X, bool)

meta = {}
for i, n in enumerate(ORDER, 1):
    k = f"{i:02d}"
    shutil.copy(f"{EP}/storyboard/{n}.png", f"{ROOT}/public/plates/{k}_{n}.png")
    im = np.array(Image.open(f"{EP}/layers/{n}__maryam.png").convert("RGBA"))
    H, W = im.shape[:2]; Y, X = np.mgrid[0:H, 0:W]
    im[drop_rule(k, X, Y), 3] = 0
    lab, nlab = cc_label(im[..., 3] > 20)
    if nlab > 1:
        sizes = np.bincount(lab.ravel()); sizes[0] = 0
        keep = np.isin(lab, np.nonzero(sizes >= 12000)[0])  # Maryam can come in several large parts (arm, hijab tail)
        im[~keep, 3] = 0
    # close every hole enclosed by her silhouette with the plate's own pixels, so nothing of her stays on the board
    plate_px = np.array(Image.open(f"{EP}/storyboard/{n}.png").convert("RGB"))
    holes = binary_fill_holes(im[..., 3] > 20) & (im[..., 3] <= 20)
    im[holes, :3] = plate_px[holes]; im[holes, 3] = 255
    Image.fromarray(im).save(f"{ROOT}/public/layers/{k}_maryam.png")
    a = im[..., 3]
    ys, xs = np.nonzero(a > 20)
    meta[k] = {"name": n, "plate": f"plates/{k}_{n}.png", "maryam": f"layers/{k}_maryam.png",
               "maryamBox": [int(xs.min()), int(ys.min()), int(xs.max() - xs.min()), int(ys.max() - ys.min())]}
json.dump(meta, open(f"{ROOT}/src/layers.json", "w"), indent=1)
print(json.dumps({k: v["maryamBox"] for k, v in meta.items()}))

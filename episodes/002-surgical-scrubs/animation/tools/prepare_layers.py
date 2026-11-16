"""Copy the approved storyboard plates and Maryam cutouts into public/, numbered in episode order,
and write public/layers.json with each cutout's bounding box (plate pixels, 1672x941).
No pixel is generated: plates are copied as-is; cutouts are the masks made from the same plates."""
import json, os, shutil
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); EP = os.path.dirname(ROOT)
ORDER = ["medical_scrubs_transformation_collage", "archival_medicine_collage_with_presenter",
         "surgical_light_collage_portrait", "vision_science_collage_with_medical_presenter",
         "color_analysis_scrub_style_collage", "balancing_scrubs_strain_to_comfort",
         "forensic_scrub_evidence_board_reveal", "surgical_scrubs_collage_explainer"]
meta = {}
for i, n in enumerate(ORDER, 1):
    k = f"{i:02d}"
    shutil.copy(f"{EP}/storyboard/{n}.png", f"{ROOT}/public/plates/{k}_{n}.png")
    shutil.copy(f"{EP}/layers/{n}__maryam.png", f"{ROOT}/public/layers/{k}_maryam.png")
    a = np.array(Image.open(f"{EP}/layers/{n}__maryam.png"))[..., 3]
    ys, xs = np.nonzero(a > 20)
    meta[k] = {"name": n, "plate": f"plates/{k}_{n}.png", "maryam": f"layers/{k}_maryam.png",
               "maryamBox": [int(xs.min()), int(ys.min()), int(xs.max() - xs.min()), int(ys.max() - ys.min())]}
json.dump(meta, open(f"{ROOT}/src/layers.json", "w"), indent=1)
print(json.dumps({k: v["maryamBox"] for k, v in meta.items()}))

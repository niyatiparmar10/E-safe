# E-Safe Dataset A — EDA and Preprocessing Decision Log

Purpose

This file records the EDA findings, limitations, label mappings, and preprocessing decisions made while building Dataset A (item recognition). It should be updated whenever a new source dataset is inspected, so that the final preprocessing stage does not lose important decisions made earlier.

Dataset A target classes

1. battery_powerbank
2. mobile_phone
3. laptop_small_device
4. charger_adapter
5. pcb
6. cable_plug

General Dataset A rule

Dataset A is only for identifying the item. Hazard labels such as swelling, burn damage, corrosion/leak cue, cracked casing, and exposed conductor belong to Dataset B. Do not manually guess hazard labels while preparing Dataset A.

Raw data must remain untouched. Cleaning, relabeling, cropping, deduplication, splitting, resizing, and augmentation will happen later in a separate clean/processed dataset.

---

# SOURCE / CLASS 1 — RecyBat24 → battery_powerbank

Source use

Original RecyBat24 non-augmented archive is being used. The large pre-augmented archive was intentionally not downloaded because augmentation should be controlled by us after the final train/validation/test split.

Original labels

- cylindric / cylindrical
- pouch
- prismatic

E-Safe mapping

All three original battery types will map to:

battery_powerbank

The original label should still be preserved in metadata even though Model 1 will use the broader E-Safe label.

EDA findings

- Total original images inspected: 2,828
- Original train split: 1,421
- Original validation split: 1,407
- All inspected images were 640 × 640.
- Corrupt images found: 0.
- Images generally contain one clearly visible battery.
- Background clutter is low.
- Backgrounds are visually quite similar.
- Batteries are often small relative to the full image.
- Average annotated battery area was approximately 7.57% of the image.
- Minimum annotated area was approximately 1.32%.
- Maximum annotated area was approximately 32.06%.
- Pouch, prismatic, and cylindrical batteries are visually different, but distinguishing them is not required for Dataset A because all map to battery_powerbank.
- Damage status should not be guessed from these images. RecyBat24 is being used here for item recognition, not hazard detection.
- COCO-style annotation JSON files provide category labels and bounding boxes.
- Bounding boxes are generally useful but can be tight around object edges.

Main risk

The model may learn dataset/background shortcuts because the battery occupies a small part of many images and the surrounding visual style is relatively consistent.

Planned preprocessing strategy

- Keep the raw archive unchanged.
- Preserve original battery type in the manifest.
- Map all three battery types to battery_powerbank in the cleaned Dataset A.
- Do not use the authors' pre-augmented archive.
- Consider using the provided bounding boxes to create padded object crops.
- If cropping is used, add approximately 10–20% margin around the annotation so object edges are not cut off.
- Do not crop so tightly that battery edges, deformation, casing boundaries, or useful context disappear.
- Compare padded-crop behaviour with full-image behaviour before locking the final classifier input strategy.
- Add more visual diversity through other sources and the real-world validation set so the model does not associate one background with battery_powerbank.
- Perform our own augmentation only after the final split.

---

# SOURCE / CLASS 2 — Custom Bangladeshi E-Waste Dataset → mobile_phone

Dataset source characteristics

The downloaded Roboflow export contains 2,157 images across 12 classes. For Dataset A, Mobile is class ID 6.

Target count

- mobile_phone images/annotations: 151
- train: 99
- valid: 26
- test: 26

EDA findings

- All 151 target annotations correspond to 151 target images.
- All inspected target images are 640 × 640.
- Corrupt target images found: 0.
- Target phone is generally clearly visible.
- Some photos contain other physical objects even though only the target phone is annotated.
- Some target items overlap or sit near other e-waste.
- Background is heavily dominated by the same green cloth.
- Lighting variation is limited.
- The same source object/photo appears in multiple transformed variants.
- No byte-for-byte exact duplicate files were detected, but this does NOT mean the samples are independent.
- The dataset README confirms that Roboflow created 3 versions of each source image using augmentation.
- Provided preprocessing: EXIF auto-orientation, resize to 640 × 640 using stretch, and auto-contrast.
- Provided augmentation: horizontal flip, vertical flip, rotation ±15°, shear ±15°, and brightness ±15%.
- Mixed annotation representations are present. Some rows use normal YOLO bounding boxes and others use polygon/segmentation coordinates.
- Image and label stems were checked: 0 labels without matching images and 0 images without matching labels in train, valid, and test.
- A unified visualizer/parser correctly handles both bounding-box and polygon annotations.
- Current corrected average object area ratio for mobile_phone is approximately 9.96%.
- Minimum object area ratio is approximately 2.50%.
- Maximum object area ratio is approximately 31.83%.

Conclusion

This dataset is useful as a supplementary mobile_phone source, but it should NOT be the only phone source because it has only 151 target images and very strong green-background / lighting bias.

Planned preprocessing strategy

- Keep raw files untouched.
- Retain only Mobile rows for the mobile_phone class.
- Preserve original class ID and source information in metadata.
- Treat Roboflow-derived variants from the same original source image as one group.
- Do not allow variants of one source image to appear across different final train/validation/test splits.
- Preferred approach for the final clean base dataset: keep one representative per original source image when practical, then perform our own augmentation after splitting.
- If multiple variants are retained, they must remain inside the same training group and must not artificially inflate validation/test evidence.
- Use the existing annotation to derive a padded object crop when appropriate, especially for cluttered scenes.
- Supplement with another phone dataset containing different backgrounds, lighting, camera conditions, and devices.
- Do not use augmentation to compensate for a fundamentally small or biased source dataset.

---

# SOURCE / CLASS 3 — Custom Bangladeshi E-Waste Dataset → pcb

Dataset source characteristics

PCB is class ID 9 in the same Custom Bangladeshi E-Waste dataset.

Target count

- pcb images/annotations: 205
- train: 144
- valid: 30
- test: 31

EDA findings

- All 205 target annotations correspond to 205 target images.
- All inspected target images are 640 × 640.
- Corrupt target images found: 0.
- PCB is generally clearly visible.
- Some scenes contain multiple physical electronic items or multiple boards, even when only one target region is annotated.
- This means annotation count cannot be interpreted as a visual count of every object present in the photograph.
- Background is again dominated by green cloth.
- Lighting variation is limited.
- Many source objects/photos appear in transformed variants.
- Mixed annotation representations are present: normal YOLO bounding boxes and segmentation polygons.
- The corrected hybrid parser/visualizer shows that the annotations generally align with the intended target region.
- In cluttered images, the annotation may correctly identify one PCB while other visible boards remain unannotated.
- Current corrected average object area ratio for PCB is approximately 25.54%.
- Minimum object area ratio is approximately 1.37%.
- Maximum object area ratio is approximately 66.82%.

Conclusion

This dataset is useful as a supplementary PCB source, but it should NOT be the sole PCB source because of strong source/background bias, limited lighting variation, repeated augmented variants, and only 205 target samples.

Planned preprocessing strategy

- Keep raw files untouched.
- Retain PCB rows for the pcb E-Safe class.
- Use the unified annotation parser for both box and polygon rows.
- Convert both annotation types into a common crop rectangle for later preprocessing.
- Add approximately 10–20% padding around crops instead of cutting exactly on the annotation boundary.
- Group all augmented relatives from the same original source image before splitting.
- Prefer one representative per original source image in the clean base dataset when practical, then create our own augmentation later.
- Supplement PCB with another source, such as an appropriately licensed PCB/electronic-component dataset, to add different backgrounds and visual conditions.

---

# IMPORTANT — capture_group_id

What it means

capture_group_id is NOT a model feature.

It is metadata used to identify files that came from the same original source image/capture.

Example:

IMG_20250803_220022_jpg.rf.hashA.jpg
IMG_20250803_220022_jpg.rf.hashB.jpg
IMG_20250803_220022_jpg.rf.hashC.jpg

These are three Roboflow variants of the same source image, so all should share:

capture_group_id = IMG_20250803_220022

Why it matters

If one augmented version goes into training and another version of the same original image goes into testing, the model has effectively already seen the test object. The test score would look better than real-world performance.

Therefore the final split must be group-aware:

same capture_group_id -> same final split

Important correction to the current grouping logic

The grouping ID should preserve source suffixes such as \_1 when they identify a distinct original source filename.

For example:

IMG_20250819_235833
IMG_20250819_235833_1

should not automatically be collapsed into one group merely because they share the same timestamp.

A safer grouping rule is to remove the Roboflow .rf.<hash> suffix and exported extension marker while preserving the original source basename.

Recommended helper:

```python
from pathlib import Path
import re

def get_capture_group(filename):
    stem = Path(filename).stem
    base = stem.split(".rf.")[0]
    base = re.sub(r"_(jpg|jpeg|png|webp)$", "", base, flags=re.IGNORECASE)
    return base
```

After changing this function, regenerate bangladesh_ewaste_manifest.csv.

Then check whether any capture_group_id appears across more than one original split.

```python
group_splits = (
    bangladesh_df
    .groupby("capture_group_id")["original_split"]
    .agg(lambda x: sorted(set(x)))
)

cross_split_groups = group_splits[group_splits.apply(len) > 1]

print("Capture groups appearing in multiple splits:", len(cross_split_groups))
print(cross_split_groups.head(20))
```

Even if the source dataset already provides train/valid/test folders, the final combined E-Safe Dataset A should later be split using our own group-aware logic after all sources are collected.

---

# CROSS-DATASET RISKS IDENTIFIED SO FAR

1. Background shortcut learning

RecyBat24 has relatively consistent backgrounds and the Bangladeshi dataset is strongly dominated by green cloth. If one E-Safe class comes mostly from one dataset, the network may learn background/source style instead of the item.

Action:

- use multiple sources per class where possible;
- add different backgrounds and lighting;
- avoid letting one class correspond to one website/dataset style;
- use the 100–300 real-world phone-photo validation set as an important final domain-shift test.

2. Class imbalance

Current raw counts are already very different:

- battery_powerbank source: 2,828 images
- mobile_phone source: 151 target images
- pcb source: 205 target images

Do not automatically train on all available battery images simply because they exist.

Action after all six classes are collected:

- inspect final usable counts;
- add more sources to weak classes;
- cap/downsample an excessive class if necessary while preserving diversity;
- use class weights only when appropriate;
- do not try to solve poor data diversity only through augmentation.

3. Near-duplicate leakage

Roboflow provides multiple transformed variants of the same source image. Other datasets may contain the same physical object photographed from multiple angles.

Action:

- create source/capture/device grouping metadata;
- split groups, not individual files;
- never allow closely related views of the same source item across train and test.

4. Object size and irrelevant background

RecyBat batteries occupy only about 7.57% of the image on average. Mobile objects in the Bangladeshi target set occupy about 9.96% on average. PCB objects occupy about 25.54% on average.

Action:

- use provided localization annotations where available;
- test padded crops;
- retain enough surrounding margin to keep the whole item visible;
- support this in the deployed app with a camera framing guide.

5. User-image distribution mismatch

Public datasets may look very different from photos captured by informal e-waste workers.

Action:

- first version should explicitly ask for ONE main item per image;
- camera UI should ask the user to place the complete item inside a guide, fill most of the frame, leave some margin around the item, use sufficient lighting, and retake blurred images;
- final evaluation must include 100–300 real/staged phone photos with clutter, varied lighting, angles, cameras, and backgrounds.

---

# FINAL DATASET A PREPROCESSING PLAN — AFTER ALL SOURCES ARE COLLECTED

Do not execute the full preprocessing pipeline yet. First collect and inspect enough sources for all six E-Safe classes.

Planned order:

1. Freeze source list and class mapping.
2. Keep every raw source untouched.
3. Verify source licence/usage information.
4. Merge source-level and image-level manifests.
5. Standardise all source labels into the six E-Safe classes.
6. Remove corrupt, unusable, mislabeled, or extremely ambiguous images.
7. Detect exact duplicates.
8. Detect near-duplicates / repeated source objects / augmentation families.
9. Assign group IDs so related images stay together.
10. Review class counts and source counts.
11. Reduce source/class imbalance while preserving visual diversity.
12. For annotated sources, derive crop coordinates from box or polygon annotations.
13. When cropping, use approximately 10–20% padding and keep the entire item visible.
14. Compare or validate padded-crop versus full-image strategy before locking the final classifier input.
15. Build the final group-aware train/validation/test split BEFORE creating new augmentation.
16. Resize according to the chosen pretrained image backbone, likely around 224 × 224 for common classifiers.
17. Apply the pretrained model's required normalization.
18. Apply augmentation only to the training set: mild rotation, crop, brightness changes, blur/noise, and mild occlusion.
19. Never use unrealistic augmentation that changes the identity or invents damage.
20. Keep validation and test sets unaugmented.
21. Keep the 100–300 real-world phone-photo set as a separate final validation/domain-shift test.
22. Recheck class balance, source balance, background diversity, and near-duplicate leakage before training.

---

# CURRENT DATASET A STATUS

Completed / inspected:

- battery_powerbank — RecyBat24
- mobile_phone — Custom Bangladeshi E-Waste Dataset
- pcb — Custom Bangladeshi E-Waste Dataset

Still need additional data:

- another PCB source with different backgrounds
- laptop_small_device
- charger_adapter
- cable_plug

Current decision

RecyBat24 is a strong starting battery source but has object-size/background concerns.

The Bangladeshi dataset is worth keeping, but only as a supplementary source for mobile_phone and pcb because of limited target counts, strong green-background bias, and Roboflow-generated variants.

Do not start final preprocessing yet. Continue collecting and inspecting the remaining Dataset A sources first.

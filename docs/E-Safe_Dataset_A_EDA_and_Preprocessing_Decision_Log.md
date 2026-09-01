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

### Planned Cleaning and Preprocessing — UNU Mobile

The raw UNU-KEY dataset will remain completely unchanged. Cleaning will be performed only when the final Dataset A preprocessing pipeline is created.

The preprocessing order for UNU Mobile is:

1. Retain only:
   - Bar-Phone (class ID 2)
   - Smartphone (class ID 61)

   Both classes will map to the E-Safe class:

   mobile_phone

2. Work at IMAGE level before generating crops.

   An image containing multiple phones must not initially be treated as several independent samples for splitting or duplicate detection.

   Example:

   one source image
   -> phone annotation 1
   -> phone annotation 2
   -> phone annotation 3

   All three annotations originate from the same image and must remain together.

3. Remove exact duplicate images before final train/validation/test splitting.

   Exact duplicates will be detected using image hashes such as MD5.

   For each exact-duplicate group:
   - retain one representative image;
   - retain its valid phone annotations;
   - compare annotations if duplicate files contain inconsistent labels;
   - manually review the group if annotation information differs.

   The original UNU train/valid/test assignment will not determine which copy is retained.

4. Detect and group related source images.

   source_group_id will be used to associate files derived from or strongly related to the same original source image.

   Multiple related images are not automatically deleted if they contain genuinely useful differences, but they must remain inside the same final split.

5. Perform cross-source near-duplicate detection later.

   After UNU is combined with the other Dataset A sources, perceptual/near-duplicate detection will also be performed so that the same internet image appearing in two different datasets cannot leak across training and testing.

6. Ignore the original UNU train/valid/test split for final E-Safe training.

   Significant duplicate/source-group leakage was found across the provided splits.

   Therefore all retained UNU samples will later be pooled and Dataset A will receive a new group-aware split after all six E-Safe classes and their sources have been combined.

7. Review very small phone annotations.

   bbox_area_ratio < 2%:
   flag for manual review

   Small phones will NOT automatically be removed.

   If the phone is still visually identifiable after annotation-based cropping:
   keep

   If the crop contains too little actual phone detail or is ambiguous:
   discard from the cleaned dataset

   Extremely small annotations are therefore handled through visual quality review rather than a blind numerical threshold.

8. Review extremely large phone annotations.

   bbox_area_ratio > 80%:
   flag for manual review

   If the phone is simply a valid close-up and remains recognisable:
   keep

   If a large portion of the actual phone lies outside the image or only a small fragment of the device is visible:
   discard

9. Handle multiple-phone images using individual annotations.

   After duplicate removal and final group/split assignment, each retained phone bounding box may generate one classifier sample.

   Example:

   image with 3 annotated phones
   -> crop phone 1
   -> crop phone 2
   -> crop phone 3

   All crops generated from the same original image must inherit the same group ID and the same final train/validation/test split.

10. Generate padded object crops.

    The COCO bounding box will be used to locate each phone.

    Initial crop strategy:
    bounding box + approximately 15% surrounding padding

    The crop must be clamped to the image boundary.

    Padding is required so that the classifier sees the complete device and a small amount of realistic surrounding context rather than an unnaturally tight crop.

11. Retain moderate real-world occlusion.

    Examples such as:
    - a phone being held by a hand;
    - small portions of the phone hidden;
    - phones lying near other electronics

    should normally be retained because they represent realistic usage.

    Severe occlusion where the object is no longer reliably identifiable should be excluded.

12. Reduce irrelevant scene clutter through cropping.

    UNU contains phones in bedrooms, offices, desks, hands, product photographs and scenes containing other electronics.

    This diversity should be preserved.

    However, large amounts of irrelevant scene content should not dominate the classifier input. Annotation-based padded crops will therefore be prepared.

13. Handle Roboflow black padding carefully.

    UNU images were resized to 640 x 640 using Fit, creating black borders in some images.

    Padded object cropping should remove most of this artificial border.

    The model should not be encouraged to associate UNU-specific black borders with the mobile_phone class.

14. Do not perform new augmentation before final splitting.

    New augmentation will only be applied to the final training split.

    Validation and test samples must remain unaugmented.

15. Do not use augmentation as a substitute for genuine diversity.

    UNU already provides useful variation in:
    - background;
    - lighting;
    - device orientation;
    - scale;
    - hands/occlusion;
    - indoor scenes;
    - product photographs.

16. Combine UNU Mobile with the Bangladeshi Mobile source only after both source manifests are complete.

    Source identity must remain stored in the combined manifest.

    Final preprocessing must check:
    - class balance;
    - source balance;
    - duplicate leakage;
    - near-duplicate leakage;
    - background diversity;
    - object-size distribution.

17. Preserve the original full image and annotation metadata.

    The cleaned classifier crop is a derived sample.

    Raw images, original COCO annotations, source information, original labels, hashes, source_group_id and bounding boxes must remain recoverable.

18. Before training, manually audit random cleaned samples.

    Random samples should be checked from:
    - UNU Smartphone
    - UNU Bar-Phone
    - Bangladeshi Mobile

    This audit should verify that cropping, deduplication and filtering have not introduced obvious mistakes.

19. Final training/test data must match the intended E-Safe workflow.

    The deployed interface should ask the worker to:
    - photograph one main item;
    - keep the complete item visible;
    - place it inside the camera guide;
    - make the item occupy a meaningful portion of the frame;
    - use sufficient lighting.

    This makes real user images closer to the cleaned classifier inputs.

20. Final real-world validation will remain separate.

    Real/staged phone-camera photographs used for final domain-shift evaluation must never be included in training.

# Planned Cleaning and Preprocessing — UNU Laptop

The general UNU-KEY preprocessing rules documented under UNU Mobile also apply to Laptop, including:

- keeping the raw UNU dataset unchanged;
- removing exact duplicates before final splitting;
- grouping related source images;
- ignoring UNU's original train/validation/test split;
- creating a new group-aware Dataset A split;
- retaining original annotations and metadata;
- handling Roboflow black padding;
- creating padded COCO bounding-box crops;
- performing augmentation only after final splitting.

The following decisions are specific to the Laptop class.

## 1. Final class mapping

Retain only:

Laptop — original class ID 39

Map to:

laptop

Do NOT include:

- Tablet
- Desktop-PC
- Power-Adapter
- Monitor
- Keyboard
- SSD
- HDD
- Router
- other small IT equipment

Tablet was inspected but excluded because only 11 examples were available.

---

## 2. Perform cleaning at image level before crop generation

An image may contain several annotated laptops.

Example:

one classroom image
→ 13 Laptop annotations

Before generating individual Laptop crops:

- identify the original image;
- calculate its image hash;
- assign its source_group_id;
- perform exact duplicate handling;
- determine its final train/validation/test group.

Only after these steps should individual Laptop crops be generated.

All crops derived from one original image must inherit the same final split.

---

## 3. Remove exact duplicate images

Exact duplicate image files will be detected using MD5 or another content hash.

The initial Laptop + Tablet EDA found:

- 23 exact duplicate groups
- 46 files inside those groups
- 23 removable exact duplicate copies

These values will be recomputed after filtering to Laptop-only.

For each duplicate group:

- keep one representative image;
- preserve its valid Laptop annotations;
- compare annotation information where necessary;
- remove redundant identical copies from the cleaned dataset.

The files will NOT be deleted from raw/.

---

## 4. Group related images

source_group_id will be used to associate images that appear to originate from the same underlying source image.

Related images are different from exact duplicates.

Example:

same original photograph
→ slightly different exported copy
→ different file/hash name

If related images contain genuinely useful differences they may be retained.

However:

same source_group_id
→ same final train/validation/test split

This prevents near-identical scenes from leaking between training and evaluation.

---

## 5. Ignore UNU's original data split

The initial EDA found source groups appearing across UNU's supplied train/validation/test folders.

Therefore the original split will NOT be used for E-Safe training.

All accepted Laptop samples will later be pooled and included in the new Dataset A group-aware split.

---

## 6. Generate one classifier candidate per valid Laptop annotation

After image-level cleaning:

one image with 3 Laptop annotations
→ candidate crop 1
→ candidate crop 2
→ candidate crop 3

Each annotation is treated separately for crop-quality evaluation.

A scene containing 13 Laptop annotations therefore does not automatically contribute 13 final training examples.

Each crop must independently pass quality checks.

---

## 7. Small-object review policy

Laptop bounding boxes will be divided into review buckets.

bbox_area_ratio < 2%

    → mandatory review

These examples include laptops that may be extremely distant in large rooms.

Keep only if the padded crop still contains enough original visual information to clearly identify the Laptop.

If the Laptop remains extremely low-resolution or difficult for a human to identify:

    → remove from clean dataset

bbox_area_ratio between 2% and 5%

    → normally create padded crop
    → inspect questionable examples

bbox_area_ratio > 5%

    → normally keep unless another quality issue is present

These thresholds are review rules rather than automatic class-quality definitions.

---

## 8. Large-object review policy

bbox_area_ratio > 80%

    → review

Keep:

- clear close-up laptop
- full or mostly visible device
- recognizable keyboard/screen/body structure

Remove:

- tiny visible fragment despite large annotation
- severely clipped Laptop
- image where only a small part of a keyboard/body is visible
- annotation that does not provide enough device information

---

## 9. Handle partial visibility

Moderate partial visibility should be retained where realistic.

Examples:

- part of Laptop hidden behind another object
- user interaction
- mild obstruction
- Laptop partially outside scene but still clearly identifiable

Remove samples where the visible region is insufficient for reliable Laptop recognition.

The goal is not to create an unrealistically perfect dataset.

---

## 10. Handle multi-Laptop scenes

Multi-Laptop scenes are useful because they provide realistic environments such as classrooms and offices.

Do not discard the original image merely because several laptops are present.

Instead:

original scene
↓
use each valid annotation separately
↓
create individual padded crops

Extremely small Laptop instances inside the same scene may be removed individually while larger valid instances are retained.

---

## 11. Generate padded Laptop crops

Use the COCO Laptop bounding box.

Initial crop strategy:

bbox + approximately 15% padding

The padding should be calculated relative to the bounding-box dimensions.

The crop must be clamped to the image boundary.

Purpose:

- remove large amounts of irrelevant room/background;
- retain the complete Laptop;
- retain a small amount of natural context;
- avoid unnaturally tight crops.

---

## 12. Do not remove all scene diversity

Cropping should reduce irrelevant background, not eliminate every environmental cue.

UNU Laptop contains valuable diversity such as:

- classrooms
- desks
- homes
- offices
- conference rooms
- different lighting
- different orientations
- open and closed devices

The cleaned dataset should preserve this diversity.

---

## 13. Handle black padding

UNU images were previously resized using Fit and some contain artificial black borders.

Padded Laptop crops should remove most of the black border automatically.

If substantial artificial padding remains in a crop:

    → remove/crop it where practical

The classifier should not learn:

black border → laptop

as a dataset shortcut.

---

## 14. Automatic review buckets

The cleaning script should initially divide Laptop candidates into:

AUTO_KEEP

Typical conditions:

- valid annotation
- no duplicate issue
- reasonable object size
- Laptop clearly represented
- normal crop geometry

REVIEW

Typical reasons:

- bbox_area_ratio < 2%
- bbox_area_ratio > 80%
- severe clipping
- unusual aspect ratio
- duplicate/source-group ambiguity
- questionable crop
- extremely low visual detail

REMOVE

Examples:

- redundant exact duplicate copy
- incorrect annotation
- visually unidentifiable Laptop
- extremely tiny low-resolution crop
- severe fragment-only image
- corrupt file

Only the REVIEW bucket needs concentrated manual inspection.

---

## 15. Preserve sample relationships in metadata

Every cleaned Laptop crop should retain metadata connecting it back to:

- source dataset
- original file name
- original image ID
- original annotation ID
- source_group_id
- exact image hash
- original COCO bbox
- bbox area ratio
- preprocessing decision
- final split

This allows preprocessing mistakes to be traced without recollecting the dataset.

---

## 16. Final Laptop quantity

UNU contains enough Laptop data that no additional Laptop dataset is currently required.

The final number of Laptop training samples does not need to equal the original 1502 annotations.

Quality and diversity are more important than retaining every sample.

It is acceptable for preprocessing to substantially reduce the count if poor, tiny, duplicated or severely clipped samples are removed.

---

## 17. Final Dataset A balancing

After every Dataset A class has been cleaned, the Laptop count will be compared with:

- battery_powerbank
- mobile_phone
- charger_adapter
- pcb
- cable_plug

If Laptop remains much larger than another class, a diverse subset may be selected rather than blindly using all available Laptop crops.

Downsampling should preserve variation in:

- backgrounds
- Laptop models
- open/closed state
- angles
- lighting
- scene type

---

## 18. Augmentation

Do not augment Laptop samples yet.

After the final Dataset A train/validation/test split:

Training only may use mild:

- rotation
- brightness variation
- blur/noise
- crop/scale variation
- mild occlusion

Validation and test images remain unaugmented.

Augmentation must not create unrealistic device shapes or artificial damage.

---

## 19. Final cleaned-data audit

Before Model 1 training:

randomly inspect cleaned Laptop crops across:

- small objects
- normal objects
- large objects
- classroom scenes
- product-style scenes
- closed laptops
- open laptops
- cluttered scenes

Confirm that:

- Laptop is actually visible;
- crop contains enough information;
- no major border/background shortcut is obvious;
- bad fragments were removed;
- duplicate leakage is controlled.

---

## 20. Deployment alignment

The E-Safe camera interface should ask the worker to photograph one main item and keep it reasonably large and fully visible inside the guide.

Therefore the final training dataset should favour Laptop crops where the device is meaningfully visible while still retaining some real-world partial-visibility and clutter examples.

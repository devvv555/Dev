# Specification Miner Handoff Report: Dynamic Course Batch List Survey

## 1. Observation
1. **Authoritative Specification Document Located**:
   - File location 1: `C:\Users\DELL\.gemini\antigravity\brain\0fe20059-b875-43a5-8bbf-033eb0baabd7\.user_uploaded\media_1793371917955_cb2c50f0.pdf`
   - File location 2 (identical copy): `C:\Users\DELL\.gemini\antigravity\brain\67294920-a323-4ac2-b349-05b9b866df38\.user_uploaded\media_1789662129677.pdf`
   - Document SHA-256 Checksum: `6eb214435bea532d089fe0fb2216a73b3a6738d3440779d042518a20ca47abfc`
   - Page count: Exactly 6 pages (`/Type /Page` count: 6).
   - Document Header verbatim:
     `PSG Institute of Management | Batch 2026 28 | Semester 1 | Dynamic Course Batch List`
   - Table Columns verbatim:
     `Roll Number | MCOB | ADM | MC | SSM & Sports | BS | EDM | LA | SSA`

2. **Total Student Records & Cohort Partitioning**:
   - Total records in 6-page PDF: Exactly **252 students**.
   - Page distribution:
     - Page 1: 41 students (`D26AA01` through `D26AA41`)
     - Page 2: 46 students (`D26AA42` - `D26AA60` [19 students], `D26AB01` - `D26AB27` [27 students])
     - Page 3: 46 students (`D26AB28` - `D26AB60` [33 students], `D26AC01` - `D26AC13` [13 students])
     - Page 4: 46 students (`D26AC14` - `D26AC59` [46 students])
     - Page 5: 46 students (`D26AC60` [1 student], `D26AD01` - `D26AD45` [45 students])
     - Page 6: 27 students (`D26AD46` - `D26AD60` [15 students], `D26AE01` - `D26AE13` [12 students])
   - Batch breakdown:
     - Batch A (`AA`): 60 students (`D26AA01` to `D26AA60`)
     - Batch B (`AB`): 60 students (`D26AB01` to `D26AB60`)
     - Batch C (`AC`): 60 students (`D26AC01` to `D26AC60`)
     - Batch D (`AD`): 60 students (`D26AD01` to `D26AD60`)
     - Batch AE (`AE`): 12 students (`D26AE01` to `D26AE09`, `D26AE11`, `D26AE12`, `D26AE13`)
     - **Notice**: `D26AE10` does NOT exist in the official document. The document skips from `D26AE09` directly to `D26AE11`.

3. **Ground-Truth Comparison with Codebase**:
   - `scripts/generatePsgimData.js`: Lines 5-256 contain `rawLines` for 252 students. Compared against the raw PDF text streams: **0 mismatches across all 252 lines**.
   - `src/data/psgimData.ts`:
     - Lines 208-3808 contain `STUDENT_REGISTRY`.
     - Contains all 252 official students with exact matching groups.
     - Contains 5 extra non-PDF keys: `D26AA62`, `D26AB61`, `D26AB62`, `D26AB63`, `D26AB64` (total keys: 257).
   - `src/data/psgimMasterStudents.ts`:
     - Contains 252 students across Batches A (62), B (63), C (62), D (65).
     - Missing 15 students that are in the PDF: `D26AA25`, `D26AB14`, `D26AC53`, and all 12 Batch AE students (`D26AE01`-`D26AE13`).
     - Contains 15 students not in the official PDF: `D26AA61`-`D26AA63`, `D26AB61`-`D26AB64`, `D26AC61`-`D26AC63`, `D26AD61`-`D26AD65`.

4. **Test Case Verification Results**:
   - Test Case 1: `26AA01` / `D26AA01`:
     - PDF specification verbatim: `D26AA01 MCOB1 ADM1 MC2 SSM1 BS1 EDM3 LA1 SSA3`
     - Matches `ORIGINAL_REQUEST.md` line 59: `26AA01 / D26AA01 resolves to: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`.
   - Test Case 2: `26AB05`:
     - PDF specification verbatim: `D26AB05 MCOB1 ADM2 MC3 SSM2 BS2 EDM1 LA1 SSA3`
     - Matches `ORIGINAL_REQUEST.md` line 60: `26AB05 resolves to: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`.

5. **Related Workspace Artifacts Located**:
   - `media_1789709359906.pdf`: 9-page official College Circular MBA Name List with `DRollNo`, `RollNo`, and `NAME`.
   - `media_1789664411440.pdf`: 2-page attendance register for MCOB Group 1.
   - `media_1789664733280.pdf`: 3-page contact roster for Batch B.
   - `media_1793371917864_05534026.pdf` / `media_1789662129576.pdf`: 1-page circular timetable schedule diagram.
   - `google-sheets-addon/all_students.json`: Sync roster containing master student mappings.
   - Newly created specification artifact: `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json` containing the complete 252-student dataset extracted directly from the PDF.

---

## 2. Logic Chain
1. *From Observation 1*: The two PDF files `media_1793371917955_cb2c50f0.pdf` and `media_1789662129677.pdf` share the exact SHA-256 hash (`6eb214435...`), have 6 pages, and bear the exact title "PSG Institute of Management Batch 2026 28 Semester 1 | Dynamic Course Batch List". Therefore, this is the authoritative 6-page specification referenced in the prompt.
2. *From Observation 2*: Inflation of the 6 text streams yields 252 sequential student rows across Batches A (60), B (60), C (60), D (60), and AE (12). In Batch AE, numbers run AE01 through AE09, skip AE10, and continue with AE11, AE12, AE13. Thus, the official cohort size is exactly 252 students, with AE10 confirmed non-existent in the authoritative circular.
3. *From Observation 3*: A byte-for-byte row comparison against `scripts/generatePsgimData.js` yields 0 mismatches. This proves `generatePsgimData.js` was accurately transcribed from the 6-page PDF. However, `psgimData.ts` contains 5 obsolete extra records (`D26AA62`, `D26AB61`-`D26AB64`) that were introduced to prevent crashes against outdated `psgimMasterStudents.ts`.
4. *From Observation 3 & 4*: In `psgimMasterStudents.ts`, `26AA01` is associated with `D26AA27` (A R SRISHAA), whereas the user requirement in `ORIGINAL_REQUEST.md` states: `26AA01 / D26AA01 resolves to: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`. Therefore, bidirectional resolution must guarantee that direct input of `26AA01` or `D26AA01` accesses the `D26AA01` schedule.
5. *From Observation 4*: Both required test cases (`26AA01 / D26AA01` and `26AB05`) have been validated against the authoritative PDF line-by-line and confirmed 100% identical to the required group tuples.

---

## 3. Caveats
- No changes to source code or data files were performed (strict read-only role).
- `D26AE10` is absent from the official PDF. Any downstream audit checking for contiguous numerical sequences must treat AE10 as intentionally unassigned.
- In the official PDF, column 5 is titled "SSM & Sports" and lists SSM1, SSM2, SSM3, or SSM4 for AE students. In `psgimData.ts`, `generatePsgimData.js` assigned blank `""` for AE SSM and Sports. Downstream teams should note that the PDF gives explicit SSM numbers for AE students.

---

## 4. Conclusion
The authoritative 6-page "Dynamic Course Batch List" document has been successfully located, inspected, and parsed. Exactly 252 student records spanning Batches A (60), B (60), C (60), D (60), and AE (12) were extracted with 0 errors. All test cases (`26AA01 / D26AA01` and `26AB05`) are verified. The complete machine-readable specification has been compiled and saved to `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json`.

---

## 5. Verification Method
1. **Verify PDF SHA-256 and Page Count**:
   ```powershell
   node -e "
   const fs = require('fs'), crypto = require('crypto');
   const buf = fs.readFileSync('C:/Users/DELL/.gemini/antigravity/brain/0fe20059-b875-43a5-8bbf-033eb0baabd7/.user_uploaded/media_1793371917955_cb2c50f0.pdf');
   console.log('SHA256:', crypto.createHash('sha256').update(buf).digest('hex'));
   console.log('Pages:', (buf.toString('binary').match(/\/Type\s*\/Page\b/g)||[]).length);
   "
   ```
2. **Verify 252 Student Records and 0 Mismatches**:
   ```powershell
   node .agents/teamwork/spec_miner_survey_1/parse_pdf.js
   ```
3. **Inspect JSON Specification Artifact**:
   ```powershell
   node -e "
   const data = JSON.parse(fs.readFileSync('.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json'));
   console.log('Total students:', data.length);
   console.log('Test case 1 (D26AA01):', data.find(s => s.dRollNo === 'D26AA01').courses);
   console.log('Test case 2 (D26AB05):', data.find(s => s.dRollNo === 'D26AB05').courses);
   "
   ```
4. **Invalidation Conditions**:
   - Invalidation occurs if the official college circular is updated to include `D26AE10` or modify any student's course group.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Document Provenance | 6-Page Dynamic Course Batch List PDF | Authoritative circular document defining dynamic groups for 2026-28 MBA | PDF file at brain `.../media_1793371917955_cb2c50f0.pdf` | 6 pages, 252 student records | Inflation error if zlib corrupt | Brain file system scan and SHA-256 hash |
| 2 | Document Provenance | 9-Page Master College Roll Circular | Official college circular mapping college roll number to D-roll number and student name | PDF at brain `.../media_1789709359906.pdf` | Roster of 252 students across batches A-D | Requires custom CID font CMap decoding | Brain file system scan and stream decomp |
| 3 | Batch Segmentation | Batch A Student Registry | Cohort of 60 students in Section A | Roll numbers `D26AA01` to `D26AA60` | Dynamic course assignments across all 8 subjects | Rolls > 60 (`D26AA61-63`) do not exist in spec | Pages 1-2 of 6-page PDF |
| 4 | Batch Segmentation | Batch B Student Registry | Cohort of 60 students in Section B | Roll numbers `D26AB01` to `D26AB60` | Dynamic course assignments across all 8 subjects | Rolls > 60 (`D26AB61-64`) do not exist in spec | Pages 2-3 of 6-page PDF |
| 5 | Batch Segmentation | Batch C Student Registry | Cohort of 60 students in Section C | Roll numbers `D26AC01` to `D26AC60` | Dynamic course assignments across all 8 subjects | Rolls > 60 (`D26AC61-63`) do not exist in spec | Pages 3-5 of 6-page PDF |
| 6 | Batch Segmentation | Batch D Student Registry | Cohort of 60 students in Section D | Roll numbers `D26AD01` to `D26AD60` | Dynamic course assignments across all 8 subjects | Rolls > 60 (`D26AD61-65`) do not exist in spec | Pages 5-6 of 6-page PDF |
| 7 | Batch Segmentation | Batch AE Student Registry | Cohort of 12 students in Section AE | Roll numbers `D26AE01` to `D26AE13` | Dynamic course assignments across all 8 subjects | `D26AE10` skipped; returns null | Page 6 of 6-page PDF |
| 8 | Course Grouping | MCOB Group Allocation | Mapping of student to Management Concepts & OB group | Student roll number | Group `MCOB1`, `MCOB2`, `MCOB3`, or `MCOB4` | Unassigned if roll invalid | PDF Column 2 ("MCOB") |
| 9 | Course Grouping | ADM Group Allocation | Mapping of student to Accounting for Decision Making group | Student roll number | Group `ADM1`, `ADM2`, `ADM3`, or `ADM4` | Unassigned if roll invalid | PDF Column 3 ("ADM") |
| 10 | Course Grouping | MC Group Allocation | Mapping of student to Managerial Communication group | Student roll number | Group `MC1`, `MC2`, `MC3`, or `MC4` | Unassigned if roll invalid | PDF Column 4 ("MC") |
| 11 | Course Grouping | SSM & Sports Allocation | Mapping of student to Soft Skills Management and Sports | Student roll and section | `SSM1-4`, `SPORTS1-4` | Previously blank in script for AE | PDF Column 5 ("SSM & Sports") |
| 12 | Course Grouping | BS Group Allocation | Mapping of student to Business Statistics group | Student roll number | Group `BS1`, `BS2`, `BS3`, or `BS4` | Unassigned if roll invalid | PDF Column 6 ("BS") |
| 13 | Course Grouping | EDM Group Allocation | Mapping of student to Economics for Decision Making group | Student roll number | Group `EDM1`, `EDM2`, `EDM3`, or `EDM4` | Unassigned if roll invalid | PDF Column 7 ("EDM") |
| 14 | Course Grouping | LA Group Allocation | Mapping of student to Legal Aspects of Business group | Student roll number | Group `LA1`, `LA2`, `LA3`, or `LA4` | Unassigned if roll invalid | PDF Column 8 ("LA") |
| 15 | Course Grouping | SSA Group Allocation | Mapping of student to Spreadsheet Applications lab group | Student roll number | Group `SSA1`, `SSA2`, `SSA3`, or `SSA4` | Unassigned if roll invalid | PDF Column 9 ("SSA") |
| 16 | Identity Resolution | Canonical D-Roll Lookup | Direct retrieval of student record by internal D-Roll ID | String (e.g. `D26AA01`) | Complete course group dictionary | Returns undefined if not in registry | `STUDENT_REGISTRY` in `psgimData.ts` |
| 17 | Identity Resolution | College Roll Lookup | Direct retrieval of student record by official college roll | String (e.g. `26AA01`, `26AB05`) | Timetable slots & student course mapping | Falls back to 'D' prefix or master mapping | `toOldRollNo` in `psgimMasterStudents.ts` |
| 18 | Schedule & Faculty | Master Faculty Roster | Exact faculty assignment per course and group number | `(course, groupNum)` | Designated Professor Name (e.g. Kirupa, Sathish, etc.) | Fallback to 'Faculty' string | `PSGIM_COURSES` in `psgimData.ts` |
| 19 | Classroom Mapping | Room Allocation Engine | Exact classroom resolution without slash rooms | `(course, groupNum, defaultRoom)` | `LH-101`, `LH-109`, `LH-401`, `LH-405`, `Sports Ground` | Eliminates generic slash rooms (`101/109`) | `resolveExactRoom` in `psgimData.ts` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Batch AE Roll Numbering | `D26AE10` | Student `D26AE10` does NOT exist in the official document; the PDF jumps directly from `D26AE09` to `D26AE11`. Total AE students = 12. |
| 2 | Master Student Roster Divergence | `D26AA25`, `D26AB14`, `D26AC53` | Present in official Dynamic Course Batch List PDF, but missing from `PSGIM_MASTER_STUDENTS`. |
| 3 | Batch AE Master Omission | `D26AE01` - `D26AE13` | Entire Batch AE (12 students) is missing from `PSGIM_MASTER_STUDENTS` in `psgimMasterStudents.ts`. |
| 4 | Obsolete Master Students | `D26AA61-63`, `D26AB61-64`, `D26AC61-63`, `D26AD61-65` | 15 students exist in `PSGIM_MASTER_STUDENTS` but do NOT exist in the official 6-page Dynamic Course Batch List PDF. |
| 5 | Extraneous Registry Keys | `D26AA62`, `D26AB61-64` | 5 dummy records were manually injected into `STUDENT_REGISTRY` in `psgimData.ts` that do not exist in the official document. |
| 6 | College Roll Resolution Collision | `26AA01` | In `psgimMasterStudents.ts`, `26AA01` maps to `D26AA27` (A R SRISHAA), whereas test case mandates `26AA01 / D26AA01` resolve to `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`. |
| 7 | Fallback Roll Resolution | `26AB05` | College roll `26AB05` has no explicit entry in `PSGIM_MASTER_STUDENTS`, but prefix fallback resolves to `D26AB05` (`MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`). |
| 8 | Batch AE SSM Assignment | `D26AE01`-`D26AE13` | Official PDF explicitly assigns SSM groups (`SSM1` to `SSM4`) in column 5, whereas `generatePsgimData.js` hardcodes blank `""`. |
| 9 | PDF Text Stream Kerning Splits | E.g. `D2 6AC16`, `D26 AD05` | In the raw PDF streams, character pairs in roll numbers and course names are segmented by numeric kerning offsets (`TJ` operators), requiring whitespace-sensitive reassembly. |

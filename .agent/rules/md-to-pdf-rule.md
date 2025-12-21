---
trigger: always_on
---

# Rule: Robust Markdown to PDF Conversion with `md-to-pdf` NPM CLI tool.

**Scope:** Applies to all AI Agents performing Markdown to PDF conversion tasks.

## 1. Tool Selection Policy

When asked to convert a Markdown file to PDF, you **MUST** prioritize using the NPM CLI tool `md-to-pdf` over MCP-based converters (like `markdown2-pdf`), unless specific constraints prevent it **and explicitly instructed to use another tool**.

**Why?** The CLI tool handles local asset resolution (especially images) more reliably when executed in the correct context.

## 2. Image Path Strategy (CRITICAL)

The most common failure mode in PDF conversion is broken images due to path format incompatibilities.

**Requirement:**

- You **MUST** ensure all image paths in the Markdown file are **RELATIVE PATHS** (e.g., `image.png` or `./images/chart.png`).
- **FORBIDDEN Formats** for this tool:
  - Absolute local paths (e.g., `C:/Users/Name/project/img.png`)
  - File URI schemes (e.g., `file:///C:/Users/Name/project/img.png`)
  - Root-relative paths (e.g., `/img.png`)

**Pre-computation Step:**
Before running the conversion command, you **MUST**:

1.  Read the Markdown file.
2.  Identify any absolute image paths.
3.  **Duplicate the markdown file** (e.g., `filename_temp.md`).
4.  **Edit the duplicate file** to replace absolute paths with simple filenames (assuming images are collocated) or relative paths.

## 3. Execution Standard Operating Procedure (SOP)

Execute the following workflow for every conversion task:

### Step 1: Prepare the File

Ensure the Markdown file and its referenced images are in the same directory (or strictly relative). Create the temporary duplicate with fixed paths as per Section 2.

### Step 2: Set the Context

When calling `run_command`, you **MUST** set the `Cwd` (Current Working Directory) to the **directory containing the Markdown file**. This allows the tool to resolve the relative image paths defined in Step 2.

### Step 3: Execute Command

Run the command using `npx` on the **duplicate file**.

```powershell
npx md-to-pdf "filename_temp.md"
```

_Note: Do not pass the full path to the file if you have correctly set the CWD. Pass the filename only._

### Step 4: Finalize

After successful generation (exit code 0), move the resulting PDF to the user's requested destination if it differs from the source directory. Rename it to the original intended output name if necessary.

### Step 5: Cleanup

**Delete** the duplicate temporary markdown file (`filename_temp.md`) created in the Pre-computation Step.

## 4. Troubleshooting

If the PDF generates but images are missing:

1.  Verify `Cwd` matches the file location.
2.  Verify paths in the _duplicate_ file are strictly relative (no leading `/` or drive letters).
3.  Retry the conversion.

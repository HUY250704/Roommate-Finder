---
name: create-pull-request
description: Automate the end-to-end pull request workflow with safety checks, linting/testing, conventional commits, and GitHub PR creation via gh CLI.
metadata:
  short-description: Safe automated git commit and pull request creator
---

# Create Pull Request

Use this skill to inspect git changes, guard against secret leaks, validate project health, commit changes using Conventional Commits, push feature branches safely, and open GitHub Pull Requests using the `gh` CLI.

## Workflow

Follow these steps in sequence:

### 1. Pre-flight & Branch Validation
1. Run `git status` and `git branch --show-current` to verify current repository state.
2. Check the branch name:
   - **Never push directly to `main` or `master`**.
   - If currently on `main` or `master`, stop and prompt the user to switch to a feature branch (e.g. `feat/...`, `fix/...`, `chore/...`), or create one if explicitly instructed.
3. Ensure there are actual changes (staged or unstaged) or new commits to create a PR for. If the working tree and branch are clean with no unpushed commits compared to upstream/base, stop and inform the user.

### 2. Diff & Secret Inspection
1. Run `git diff` (and `git diff --cached` if files are staged) to review all modified lines.
2. Check for sensitive files and patterns:
   - Ensure `.env`, `.env.local`, `*.pem`, `*.key`, or credential files are not being staged or committed.
   - Scan diffs for leaked secrets (API keys, private tokens, database passwords, JWT secrets).
   - If sensitive changes or secrets are detected: **halt immediately**, alert the user with the file path and reason, and do not commit or push.
3. Verify that only relevant files belonging to the task/feature are included. Exclude temporary, cache, or unrelated files.

### 3. Validation & Quality Checks
Run appropriate test, lint, or build scripts if configured in the project:
- For Node.js / JavaScript / TypeScript projects: check `package.json` for scripts like `lint`, `test`, or `build` and run them (or sub-workspace scripts if relevant).
- If any check fails, abort and report the failure logs clearly so the issue can be fixed before committing.

### 4. Conventional Commit
1. Stage only the intended, safe files using `git add <files>`.
2. Generate a Conventional Commit message following the format:
   - `type(scope): concise description`
   - Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
   - Keep the summary informative and based strictly on the actual changes.
3. Execute the commit: `git commit -m "..."`.

### 5. Push Branch
1. Push the current branch to origin setting upstream if not yet set:
   ```bash
   git push -u origin <current-branch>
   ```
2. If authentication fails, push is rejected, or remote permissions are missing, stop immediately and report the error details to the user.

### 6. Create GitHub Pull Request
1. Check that GitHub CLI (`gh`) is installed and authenticated (`gh auth status`).
   - If `gh` is not installed or not authenticated, stop and inform the user with instructions to install/authenticate (`winget install GitHub.cli` / `gh auth login`).
2. Generate a concise PR title and a structured description based on the diff:
   - **Summary**: Key changes introduced in this PR.
   - **Details / Motivation**: Problem solved or feature added.
   - **Testing / Verification**: How changes were verified.
3. Open the PR using the `gh` CLI:
   ```bash
   gh pr create --title "<PR Title>" --body "<PR Description>"
   ```
   (Or use `--base <target-branch>` if the target branch is not the repository default).
4. **Do not merge the PR.** Return the created PR URL and summary to the user.

## Safety & Invariant Rules
- **No Direct Push to Main/Master**: Always require a dedicated feature/bugfix branch.
- **No Secret Leaks**: Stop immediately on detecting credentials or environment variable files.
- **No Merging**: Only create the pull request; do not run `gh pr merge` or automated merges.
- **Graceful Error Handling**: If any command (`git`, `gh`, test, lint) fails, stop execution and provide clear actionable diagnostic output.

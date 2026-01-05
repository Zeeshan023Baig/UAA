# How to Push Code to GitHub

Here is the standard workflow to save your changes and upload them to GitHub.

## 1. Check Status
See which files have been changed.
```powershell
git status
```
*Red files* = Changed but not staged.
*Green files* = Staged and ready to commit.

## 2. Add Changes
Stage all your changes (prepare them to be saved).
```powershell
git add .
```
*(The `.` means "all files in the current directory")*

## 3. Commit Changes
Save your changes with a message describing what you did.
```powershell
git commit -m "Describe your changes here"
```
*Example: `git commit -m "Fixed login button color"`*

## 4. Push to GitHub
Upload your commits to the cloud.
```powershell
git push
```

---

### Quick One-Liner
You can combine them into one command if you are in a hurry:
```powershell
git add . ; git commit -m "Update" ; git push
```

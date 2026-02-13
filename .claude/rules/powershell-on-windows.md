# Shell Commands by Operating System

## Detection

Use the appropriate shell commands based on the development environment:

**Windows (PowerShell):**
- Workspace shows: `Cwd: C:\...` or `E:\...` (Windows drive letters)
- Terminal shows: `Terminal: pwsh`
- Use: PowerShell cmdlets

**Linux/macOS (Bash/Zsh):**
- Workspace shows: `Cwd: /home/...` or `/Users/...` (Unix paths)
- Terminal shows: `Terminal: bash` or similar
- Use: Standard Linux shell commands

## Windows (PowerShell) Commands

### Requirement
Windows development environment uses **PowerShell as the native shell**. All terminal commands must use PowerShell cmdlets, NOT Linux shell syntax.

### Why
- Linux commands (like `head`, `tail`, `grep`, `cat`) don't work natively in PowerShell
- This prevents command execution failures and confusing errors
- Keeps the development experience consistent and predictable

### Command Reference

#### File & Text Operations

| Task | PowerShell Cmdlet |
|------|-------------------|
| Read file | `Get-Content file.txt` |
| Read first N lines | `Get-Content file.txt \| Select-Object -First 20` |
| Read last N lines | `Get-Content file.txt \| Select-Object -Last 20` |
| Search in file | `Get-Content file.txt \| Select-String "pattern"` |
| Write/echo output | `Write-Host "text"` |
| List files | `Get-ChildItem` or `ls` (in PS7+) |
| List files recursively | `Get-ChildItem -Recurse` |
| Redirect output to file | `command > file.txt` or `command \| Out-File file.txt` |

#### Piping & Filtering

| Linux | PowerShell |
|-------|-----------|
| `command \| grep "pattern"` | `command \| Select-String "pattern"` |
| `command \| head -20` | `command \| Select-Object -First 20` |
| `command \| tail -5` | `command \| Select-Object -Last 5` |
| `which program` | `Get-Command program` |

#### Examples

❌ **DON'T DO THIS:**
```powershell
npm test -- --no-coverage 2>&1 | head -50
npm test -- --no-coverage 2>&1 | tail -20
cat file.txt | grep "error"
```

✅ **DO THIS INSTEAD:**
```powershell
npm test -- --no-coverage 2>&1 | Select-Object -First 50
npm test -- --no-coverage 2>&1 | Select-Object -Last 20
Get-Content file.txt | Select-String "error"
```

## Linux/macOS (Bash) Commands

### Standard Shell Commands
Use standard Unix/Linux shell utilities:

| Task | Bash Command |
|------|--------------|
| Read file | `cat file.txt` |
| Read first N lines | `head -n 20 file.txt` |
| Read last N lines | `tail -n 20 file.txt` |
| Search in file | `cat file.txt \| grep "pattern"` or `grep "pattern" file.txt` |
| Write/echo output | `echo "text"` |
| List files | `ls` or `ls -la` |
| List files recursively | `ls -R` or `find .` |
| Redirect output | `command > file.txt` |

✅ **DO THIS ON LINUX/MAC:**
```bash
npm test -- --no-coverage 2>&1 | head -50
npm test -- --no-coverage 2>&1 | tail -20
cat file.txt | grep "error"
```

## Detection Logic

When running commands, check the workspace context:
1. **If `Cwd` shows Windows path** (C:\, D:\, E:\) → use PowerShell
2. **If `Terminal: pwsh`** → use PowerShell
3. **If `Cwd` shows Unix path** (/home/, /Users/, /var/) → use Bash/Zsh
4. **If unsure** → ask the user's environment before running commands

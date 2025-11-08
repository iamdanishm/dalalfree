param(
    [string]$Path = ".",               # Folder to scan
    [string[]]$ExcludeDirs = @(".next", "node_modules"), # Folders to exclude
    [string]$Output = "tree.txt" # Output file
)

function Print-Tree {
    param($CurrentPath, $Level)

    # Get child directories excluding those in $ExcludeDirs
    $dirs = Get-ChildItem -Path $CurrentPath -Directory | Where-Object { $ExcludeDirs -notcontains $_.Name }

    # Get files at the current level
    $files = Get-ChildItem -Path $CurrentPath -File

    # Print directories first
    foreach ($dir in $dirs) {
        $indent = " " * ($Level * 4)
        Add-Content -Path $Output -Value ("$indent$($dir.Name)/")
        # Recurse to print nested items
        Print-Tree -CurrentPath $dir.FullName -Level ($Level + 1)
    }

    # Print files with indentation
    foreach ($file in $files) {
        $indent = " " * ($Level * 4)
        Add-Content -Path $Output -Value ("$indent$file")
    }
}

# Remove previous output if exists
Remove-Item -Path $Output -ErrorAction SilentlyContinue

# Print the root folder name explicitly (optional)
Add-Content -Path $Output -Value ("$(Split-Path -Leaf (Get-Location))`/")

# Start recursion from the specified path with level 1 (indentation)
Print-Tree -CurrentPath $Path -Level 1

Write-Host "Project tree including files saved to $Output"

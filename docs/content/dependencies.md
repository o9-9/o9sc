# System Dependencies and Prerequisites

## Required System Dependencies

Before using o99, ensure your system meets the following requirements:

### Operating System
- **Windows 10** (version 1809 or later) or **Windows 11**
- **Administrator privileges** are required for all operations
- **.NET Framework 4.8** or later (usually pre-installed on modern Windows)

### PowerShell Requirements
- **PowerShell 5.1** or later (included with Windows 10/11)
- **ExecutionPolicy** must allow script execution (o99 handles this temporarily)

### Internet Connection
- **Stable internet connection** required for:
  - Downloading Chocolatey package manager
  - Updating Winget package manager
  - Installing applications and dependencies

## Package Manager Dependencies

### Chocolatey
o99 automatically installs Chocolatey if not present. Chocolatey requires:
- **.NET Framework 4.8+**
- **PowerShell 2.0+** (PowerShell 3.0+ for better performance)
- **Windows 7+** / **Windows Server 2003+**

Installation command used by o99:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Winget
Winget is included with Windows 10 1709+ and Windows 11. o99 updates it automatically:
- **Windows Package Manager** (winget) 1.0+
- **Microsoft Store** (for automatic updates)
- **Visual C++ Redistributable** (automatically installed if needed)

## How to Install Dependencies

### Manual Dependency Installation

If you encounter issues with automatic dependency installation, follow these steps:

#### 1. Install .NET Framework
```powershell
# Download and install .NET Framework 4.8
Invoke-WebRequest -Uri "https://download.microsoft.com/download/9/4/1/941c3de1-18e1-4bb1-8e8d-8b9b9adff4c5/dotNetFx48-web.exe" -OutFile "$env:TEMP\dotNetFx48-web.exe"
Start-Process -FilePath "$env:TEMP\dotNetFx48-web.exe" -Wait
```

#### 2. Install PowerShell (if needed)
```powershell
# PowerShell 7+ (optional, recommended)
winget install Microsoft.PowerShell
```

#### 3. Update Windows
```powershell
# Ensure Windows is up to date for Winget compatibility
Start-Process "ms-settings:windowsupdate"
```

### Dependency Validation

Use these commands to check if dependencies are properly installed:

#### Check .NET Framework
```powershell
Get-ItemProperty "HKLM:SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\" -Name Release | ForEach-Object { $_.Release -ge 528040 }
```

#### Check PowerShell Version
```powershell
$PSVersionTable.PSVersion
```

#### Check Chocolatey
```powershell
choco --version
```

#### Check Winget
```powershell
winget --version
```

## Troubleshooting Dependencies

### Common Issues and Solutions

#### Chocolatey Installation Fails
```powershell
# Clear Chocolatey cache and reinstall
Remove-Item -Path "$env:ChocolateyInstall" -Recurse -Force -ErrorAction SilentlyContinue
# Then run o99 again
```

#### Winget Not Found
```powershell
# Manually install App Installer from Microsoft Store
ms-windows-store://pdp/?productid=9nblggh4nns1
# Or download directly
Invoke-WebRequest -Uri "https://aka.ms/Microsoft.VCLibs.x64.14.00.Desktop.appx" -OutFile "$env:TEMP\Microsoft.VCLibs.x64.14.00.Desktop.appx"
Add-AppxPackage -Path "$env:TEMP\Microsoft.VCLibs.x64.14.00.Desktop.appx"
```

#### PowerShell Execution Policy Issues
```powershell
# Check current policy
Get-ExecutionPolicy
# Set policy to allow scripts (temporarily)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### .NET Framework Issues
```powershell
# Repair .NET Framework
DISM /Online /Enable-Feature /FeatureName:NetFx4Extended-ASPNET45 /All
```

## Security Considerations

### Execution Policy
o99 temporarily bypasses PowerShell execution policy for its operations. This is safe because:
- Policy is only bypassed for the current process
- Scripts are downloaded from trusted sources
- Original policy is restored after execution

### Administrator Privileges
Administrator privileges are required for:
- Installing package managers (Chocolatey, Winget updates)
- Installing applications system-wide
- Modifying system settings
- Creating system restore points

### Firewall and Antivirus
Some antivirus software may flag o99 or its generated scripts:
- This is typically a false positive due to system modification capabilities
- Add exceptions for o99 and package manager directories if needed
- Temporarily disable real-time scanning during bulk installations

## Offline Installation

For systems without internet access:

### Prepare Dependencies Offline
1. Download .NET Framework installer on connected system
2. Download Chocolatey installation package
3. Download required application installers manually
4. Transfer to offline system via USB/network

### Offline Chocolatey Setup
```powershell
# Download Chocolatey.nupkg on connected system
# Transfer and install offline
choco install chocolatey --source="C:\path\to\offline\packages"
```

## Advanced Configuration

### Custom Package Sources
```powershell
# Add custom Chocolatey source
choco source add -n="custom" -s="https://custom.chocolatey.server/"
# Add custom Winget source
winget source add custom https://custom.winget.server/
```

### Proxy Configuration
```powershell
# Configure Chocolatey for proxy
choco config set proxy http://proxy.company.com:8080
choco config set proxyUser domain\username
# Configure Winget for proxy (via Windows settings)
```

This comprehensive dependency guide ensures users can successfully install and configure all necessary components for o99 to function properly.
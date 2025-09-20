# o99

[![Downloads](https://img.shields.io/github/downloads/o9-9/o99/total?style=for-the-badge)](https://github.com/o9-9/o99/releases)
[![Release](https://img.shields.io/github/v/release/o9-9/o99?style=for-the-badge&label=Latest%20release)](https://github.com/o9-9/o99/releases/latest)
[![Discussions](https://img.shields.io/badge/Join-the%20Discussion-2D9F2D?style=for-the-badge&logo=github&logoColor=white)](https://github.com/o9-9/o99/discussions)
[![Ko-Fi](https://shields.io/badge/ko--fi-Donate-13c3ff?logo=kofi&style=for-the-badge)](https://ko-fi.com/o99)

o99 is a powerful, simple to use & lightweight open-source tool designed to improve and customize your Windows experience. It offers a range of features, including debloating, privacy enhancement, performance optimization, and streamlined app installation.
<br>

![App Screenshot](/website/public/o99.webp)

## Features

### 🧹 Debloat

o99 allows you to remove any pre-installed bloatware and unnecessary component from Windows. You can uninstall Microsoft Store, OneDrive, CoPilot, debloat or remove Microsoft Edge, disable Widgets & Taskbar Widgets, disable Windows Features such as Recall or Consumer Features & many more.

### 🔒 Privacy

You can disable app access to sensitive data, prevent background syncing of themes and passwords, and stop usage tracking like activity feeds, screen recording, and location-based services. The Telemetry section allows you to shut down Microsoft’s data collection of Windows, Office, updates, search, and feedback. You can disable 3rd-party apps data collection (Adobe, VS Code, Google, Nvidia etc), disable cloud-based speech recognition, DRM connectivity, and biometric services & much more.

### ⚡ Performance

You can enable the Ultimate Performance power plan, set background services to manual startup, reduce mouse input delays, and disable features like Superfetch, HAGS, Storage Sense, Windows Search Indexing, and Hibernation. It also allows you to fine-tune security settings for better performance limiting Windows Defender’s CPU usage, disabling Core Isolation & more.

### 📦 App Installer

The Browse Apps section in o99 makes it easy to bulk install all your essential software in just a few clicks. Choose from a list of popular apps—browsers, utilities, dev tools, media players, and more, and o99 will generate a script to install them automatically using your preferred package manager: Chocolatey or Winget.

## Usage

> [!Warning]
> o99 must be run as Administrator to function properly.

### System Requirements

Before using o99, ensure your system meets the [dependency requirements](docs/content/dependencies.md):
- Windows 10 (1809+) or Windows 11
- .NET Framework 4.8+
- PowerShell 5.1+
- Administrator privileges

🖥️ **Launch Command**:

```
irm "https://o99.dev/irm" | iex
```

🖥️ **Via Winget**:

```
winget install o99
```

## Support

### 👷 Contributing

Contributions are welcome! Fork the repository and create a pull request with your changes.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

### ⭐ Star

Feel free to leave a star and help the project reach more people!

### ☕ Donate

If you find this project helpful, consider supporting it by [buying me a coffee!](https://ko-fi.com/o99)

## License

📒 This project is licensed under the GPL v3 License. See the [LICENSE](LICENSE) file for more details.

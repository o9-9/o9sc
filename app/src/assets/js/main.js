import { app } from "@tauri-apps/api";
import { dirname, join, tempDir } from "@tauri-apps/api/path";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask, open, save } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";
import { openUrl } from "@tauri-apps/plugin-opener";
import { hostname, version } from "@tauri-apps/plugin-os";
import { relaunch } from "@tauri-apps/plugin-process";
import { Command } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";

async function getChangelog() {
  const response = await fetch("https://api.github.com/repos/o9-9/o99/releases/latest");
  if (!response.ok) {
    return null;
  } else {
    const data = await response.json();
    let body = data.body.replace(
      "*The desktop app may be flagged as a threat by Windows Defender; however, this is a false positive. This occurs because the scripts you create with o99 can modify system settings. Rest assured, o99 is safe, transparent, and open-source.*",
      "",
    );
    body = body.trim();
    console.log(body);
    return body;
  }
}

// Checks if an update is available and performs it
async function checkForUpdates() {
  const changelog = await getChangelog();
  const update = await check();

  if (update) {
    let updateAsk;

    if (changelog) {
      updateAsk = await ask(changelog, {
        title: "Update Available",
        kind: "info",
        okLabel: "Update",
        cancelLabel: "Later",
      });
    } else {
      updateAsk = await ask("An update is available. Do you want to update?", {
        title: "Update Available",
        kind: "info",
        okLabel: "Update",
        cancelLabel: "Later",
      });
    }

    if (updateAsk === true) {
      await update.downloadAndInstall();
      await relaunch();
    } else {
      return;
    }
  } else {
    return;
  }
}

// Checks if an update is available and does not perform it
async function alertForUpdates() {
  const changelog = await getChangelog();
  const update = await check();

  if (update) {
    let updateAsk;

    if (changelog) {
      updateAsk = await ask(changelog, {
        title: "Update Available",
        kind: "info",
        okLabel: "Go to GitHub",
        cancelLabel: "Later",
      });
    } else {
      updateAsk = await ask("An update is available. Do you want to update?", {
        title: "Update Available",
        kind: "info",
        okLabel: "Go to GitHub",
        cancelLabel: "Later",
      });
    }

    if (updateAsk === true) {
      await openUrl("https://github.com/o9-9/o99/releases/latest");
    } else {
      return;
    }
  } else {
    return;
  }
}

async function isInstalled() {
  const tmpDir = await tempDir();

  async function checkProcess() {
    const processCheck = `([bool](Get-Process o99-portable -ErrorAction SilentlyContinue)).ToString().ToLower() | Set-Content -Path $env:TEMP\\isPortable.txt;`;
    const processShell = new Command("cmd", ["/c", "powershell", `${processCheck}`, "pause"]);
    await processShell.execute();
  }

  async function checkPath() {
    const pathCheck = `(Get-Process -Id (Get-CimInstance Win32_Process -Filter "ProcessId=$PID").ParentProcessId).Path | Set-Content -Path $env:TEMP\\o99Path.txt;`;
    const pathShell = new Command("powershell", ["-Command", pathCheck]);
    await pathShell.execute();
  }

  function cleanFiles() {
    remove(tmpDir + "isPortable.txt");
    remove(tmpDir + "o99Path.txt");
  }

  await checkProcess();
  await checkPath();

  const isPortableBool = (await readTextFile(tmpDir + "isPortable.txt")).trim() === "true";

  if (isPortableBool) {
    cleanFiles();
    alertForUpdates();
    return;
  }

  const o99Path = (await readTextFile(tmpDir + "o99Path.txt")).toLowerCase();
  const o99Dir = await dirname(o99Path);
  const uninstallPath = await join(o99Dir, "uninstall.exe");
  const uninstallExists = await exists(uninstallPath);

  if (uninstallExists) {
    cleanFiles();
    checkForUpdates();
  } else {
    cleanFiles();
    alertForUpdates();
  }
}

isInstalled();

// Check system dependencies
async function checkSystemDependencies() {
  const dependencies = {
    dotnet: false,
    powershell: false,
    chocolatey: false,
    winget: false
  };

  const results = [];

  try {
    // Check .NET Framework
    const dotnetCheck = `try {
      $release = Get-ItemProperty "HKLM:SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full\\" -Name Release -ErrorAction Stop;
      ($release.Release -ge 528040).ToString().ToLower()
    } catch {
      "false"
    } | Set-Content -Path $env:TEMP\\dotnet.txt`;
    
    const dotnetCommand = new Command("powershell", ["-Command", dotnetCheck]);
    await dotnetCommand.execute();
    
    const dotnetResult = (await readTextFile(await join(await tempDir(), "dotnet.txt"))).trim();
    dependencies.dotnet = dotnetResult === "true";
    
    // Check PowerShell version
    const psCheck = `($PSVersionTable.PSVersion.Major -ge 5).ToString().ToLower() | Set-Content -Path $env:TEMP\\ps.txt`;
    const psCommand = new Command("powershell", ["-Command", psCheck]);
    await psCommand.execute();
    
    const psResult = (await readTextFile(await join(await tempDir(), "ps.txt"))).trim();
    dependencies.powershell = psResult === "true";
    
    // Check Chocolatey
    const chocoCheck = `try {
      $null = Get-Command choco -ErrorAction Stop;
      "true"
    } catch {
      "false"
    } | Set-Content -Path $env:TEMP\\choco.txt`;
    
    const chocoCommand = new Command("powershell", ["-Command", chocoCheck]);
    await chocoCommand.execute();
    
    const chocoResult = (await readTextFile(await join(await tempDir(), "choco.txt"))).trim();
    dependencies.chocolatey = chocoResult === "true";
    
    // Check Winget
    const wingetCheck = `try {
      $null = Get-Command winget -ErrorAction Stop;
      "true"
    } catch {
      "false"
    } | Set-Content -Path $env:TEMP\\winget.txt`;
    
    const wingetCommand = new Command("powershell", ["-Command", wingetCheck]);
    await wingetCommand.execute();
    
    const wingetResult = (await readTextFile(await join(await tempDir(), "winget.txt"))).trim();
    dependencies.winget = wingetResult === "true";

    // Clean up temp files
    const tmpDir = await tempDir();
    try {
      await remove(await join(tmpDir, "dotnet.txt"));
      await remove(await join(tmpDir, "ps.txt"));
      await remove(await join(tmpDir, "choco.txt"));
      await remove(await join(tmpDir, "winget.txt"));
    } catch (e) {
      console.log("Cleanup warning:", e);
    }

  } catch (error) {
    console.error("Error checking dependencies:", error);
  }

  return dependencies;
}

// Show dependency warning if needed
async function showDependencyWarning(deps) {
  const missing = [];
  
  if (!deps.dotnet) missing.push(".NET Framework 4.8+");
  if (!deps.powershell) missing.push("PowerShell 5.1+");
  
  if (missing.length > 0) {
    const message = `Missing required dependencies: ${missing.join(", ")}\\n\\nWould you like to continue anyway? Some features may not work properly.\\n\\nFor help installing dependencies, visit the Dependencies Guide.`;
    
    const proceed = await ask(message, {
      title: "Missing Dependencies",
      kind: "warning",
      okLabel: "Continue Anyway",
      cancelLabel: "Cancel"
    });
    
    if (!proceed) {
      await openUrl("https://github.com/o9-9/o99/blob/main/docs/content/dependencies.md");
      return false;
    }
  }
  
  const packageManagers = [];
  if (!deps.chocolatey) packageManagers.push("Chocolatey");
  if (!deps.winget) packageManagers.push("Winget");
  
  if (packageManagers.length > 0) {
    const message = `Package managers not found: ${packageManagers.join(", ")}\\n\\no99 will attempt to install/update them automatically.`;
    
    await ask(message, {
      title: "Package Manager Setup",
      kind: "info",
      okLabel: "OK"
    });
  }
  
  return true;
}

// Apply Mica if OS = Windows 11
function applyMica() {
  const osVersion = version();
  const buildNumber = osVersion.split(".")[2];

  function isWindows11() {
    return buildNumber >= 22000;
  }

  if (isWindows11()) {
    getCurrentWindow().setEffects({ effects: ["mica"] });
  } else {
    document.body.style.backgroundColor = "var(--background)";
  }
}

applyMica();

// Show window manually on startup (remove this when mica bug at startup is fixed)
getCurrentWindow().show();

// Prevent context menu
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
});

// Display hostname
hostname()
  .then((nameHost) => {
    document.getElementById("hostname").textContent = nameHost;
  })
  .catch((error) => {
    document.getElementById("hostname").textContent = "github.com/o9-9";
  });

// Display app version
async function displayVersion() {
  try {
    const version = await app.getVersion();
    document.getElementById("version").textContent = `${version}`;
  } catch (error) {
    document.getElementById("version").textContent = ``;
    console.error("Failed to get app version:", error);
  }
}

displayVersion();

document.querySelector(".nav-icon").addEventListener("click", () => {
  const navbar = document.getElementById("sidebar");
  const content = document.querySelector(".content");
  const paragraphs = document.querySelectorAll(".content-entry:not(.about) p");

  if (!navbar.classList.contains("responsive")) {
    navbar.classList.add("responsive");
    content.classList.add("responsive");
    navbar.style.animation = "slide-in 0.3s ease forwards";
    paragraphs.forEach((p) => {
      p.style.display = "none";
    });
  } else {
    navbar.style.animation = "slide-out 0.3s ease forwards";
    content.classList.remove("responsive");
    paragraphs.forEach((p) => {
      p.style.display = "block";
    });
    setTimeout(() => {
      navbar.classList.remove("responsive");
      navbar.style.animation = "";
    }, 300);
  }
});

const tabs = document.querySelectorAll(".sidebar-entry");
const contents = document.querySelectorAll(".tab-content");
const title = document.getElementById("content-header"); // Select the header element for updating

// Set only the first tab and its corresponding content as active
if (tabs.length > 0 && contents.length > 0) {
  tabs[0].classList.add("active");
  contents[0].classList.add("active");
  title.textContent = tabs[0].textContent || "o99"; // Update header with the first tab's text
}

// Remove 'active' from all other content divs except the first
contents.forEach((content, index) => {
  if (index !== 0) {
    content.classList.remove("active");
  }
});

// Add click event to each tab button
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    contents[index].classList.add("active");

    title.textContent = tab.textContent;
  });
});

// Import & Export
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const checkboxes = document.querySelectorAll('input[type="checkbox"]');

exportBtn.addEventListener("click", async () => {
  let settings = {};
  checkboxes.forEach((checkbox) => {
    settings[checkbox.id] = checkbox.checked;
  });

  // Open file dialog
  try {
    const filePath = await save({
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    // Write the settings to the file
    if (filePath) {
      await writeTextFile(filePath, JSON.stringify(settings, null, 2));
      console.log("File saved successfully");
    }
  } catch (error) {
    console.error("Error saving file:", error);
  }
});

importBtn.addEventListener("click", async () => {
  // Open file dialog
  try {
    const filePath = await open({
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    // Read settings from file
    if (filePath) {
      const contents = await readTextFile(filePath);

      const settings = JSON.parse(contents);
      checkboxes.forEach((checkbox) => {
        checkbox.checked = settings[checkbox.id];
        checkbox.dispatchEvent(new Event("change"));
      });
    }
  } catch (error) {
    console.error("Error importing settings:", error);
  }
});

// Shortcuts
const windowsSettings = document.getElementById("openSettings");
const deviceManager = document.getElementById("openDeviceManager");
const controlPanel = document.getElementById("openControlPanel");
const visualEffects = document.getElementById("openVisualEffects");
const pageFile = document.getElementById("openPageFile");
const msConfig = document.getElementById("openMSConfig");

windowsSettings.addEventListener("click", () => {
  new Command("cmd", ["/c", "start", "ms-settings:"]).execute();
});
deviceManager.addEventListener("click", () => {
  new Command("cmd", ["/c", "start", "devmgmt.msc"]).execute();
});
controlPanel.addEventListener("click", () => {
  new Command("cmd", ["/c", "start", "control"]).execute();
});
visualEffects.addEventListener("click", () => {
  new Command("cmd", ["/c", "start", "SystemPropertiesPerformance"]).execute();
});
pageFile.addEventListener("click", () => {
  new Command("cmd", ["/c", "SystemPropertiesPerformance /pagefile"]).execute();
});

msConfig.addEventListener("click", () => {
  new Command("cmd", ["/c", "start", "msconfig"]).execute();
});

// MAS Checkbox
const masCheckbox = document.getElementById("installmas");
masCheckbox.addEventListener("change", () => {
  if (masCheckbox.checked) {
    document.querySelector(".mas-container").style.display = "block";
  } else {
    document.querySelector(".mas-container").style.display = "none";
  }
});

// OneDrive Checkbox
const onedriveCheckbox = document.getElementById("onedrive");
let onedriveChanging = false;

onedriveCheckbox.addEventListener("click", async (e) => {
  if (onedriveChanging) {
    onedriveChanging = false;
    return;
  }

  onedriveCheckbox.checked = false;

  if (!onedriveChanging) {
    const onedriveAsk = await ask(
      "Uninstalling OneDrive will delete all of your OneDrive files, make sure to backup if you wish to proceed. Do you want to continue?",
      {
        title: "Uninstall OneDrive",
        type: "question",
      },
    );

    if (onedriveAsk) {
      onedriveChanging = true;
      onedriveCheckbox.checked = true;
      onedriveCheckbox.dispatchEvent(new Event("change"));
    }
  }
});

// Restore Point Checkbox
const restoreCheckbox = document.getElementById("restorepoint");
restoreCheckbox.addEventListener("change", () => {
  if (restoreCheckbox.checked) {
    document.querySelector(".restore-container").style.display = "block";
  } else {
    document.querySelector(".restore-container").style.display = "none";
  }
});

// App Search Bar
document.getElementById("searchBar").addEventListener("input", () => {
  const searchValue = document.getElementById("searchBar").value.toLowerCase();
  const detailsElements = document.querySelectorAll("#install-tab details");

  detailsElements.forEach((details) => {
    const entries = [...details.querySelectorAll(".content-entry")];
    const summary = details.querySelector("summary");

    let hasMatch = false;

    entries.forEach((entry) => {
      if (!entry.isSameNode(summary)) {
        const isMatch = entry.textContent.toLowerCase().includes(searchValue);
        entry.style.display = isMatch ? "" : "none";
        hasMatch ||= isMatch;
      }
    });

    if (!searchValue) {
      details.style.display = "";
      details.open = false;
      entries.forEach((entry) => (entry.style.display = ""));
    } else {
      details.style.display = hasMatch ? "" : "none";
      details.open = hasMatch;
    }
  });
});

// Copy to clipboard button
document.getElementById("copyBtn").addEventListener("click", function () {
  var textContent = document.getElementById("code").innerText;
  navigator.clipboard.writeText(textContent);
});

// Update the indicator text when the checkbox is changed
document.querySelectorAll(".checkbox-wrapper").forEach((wrapper) => {
  const checkbox = wrapper.querySelector('input[type="checkbox"]');
  const indicator = wrapper.querySelector(".indicator");

  checkbox.addEventListener("change", () => {
    indicator.textContent = checkbox.checked ? "On" : "Off";
  });
});

document.getElementById("runBtn").addEventListener("click", async function () {
  // Check dependencies before proceeding
  console.log("Checking system dependencies...");
  const dependencies = await checkSystemDependencies();
  const canProceed = await showDependencyWarning(dependencies);
  
  if (!canProceed) {
    return; // User chose not to continue
  }

  // Ask for restore point
  if (!restoreCheckbox.checked) {
    let restoreAsk = await ask("Do you want to create a restore point?", {
      title: "Restore Point",
    });
    console.log("Restore Point: " + restoreAsk);

    if (restoreAsk === true) {
      document.querySelector(".restore-container").style.display = "block";
    } else {
      document.querySelector(".restore-container").style.display = "none";
    }
  }

  let textContent = document.getElementById("code").innerText;

  // Convert LF to CRLF
  textContent = textContent.replace(/\n/g, "\r\n");

  try {
    // Get the TEMP directory path
    const tmpDir = await tempDir();
    const dirPath = await join(tmpDir, "o99");
    const filePath = await join(dirPath, "o99.bat");

    // Create the directory
    await mkdir(dirPath, { recursive: true });

    // Write the script
    await writeTextFile(filePath, textContent);

    // Execute the script
    const command = new Command("cmd", ["/c", "start", "cmd", "/k", filePath]);
    command
      .spawn()
      .then(() => console.log("Script executed successfully"))
      .catch((error) => console.error("Error executing script:", error));
  } catch (error) {
    console.error("Error:", error);
  }
});

# 🚀 How to Run NodeForge V5.1.0

## Quick Start

### **Option 1: Double-Click to Run (Easiest)**

Simply double-click one of these batch files in the project folder:

- **`run.bat`** - Run the application immediately (recommended for first-time use)
- **`start.bat`** - Interactive menu with multiple options

---

## 📋 Prerequisites

Before running the app, make sure you have:

1. **Node.js installed** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open Command Prompt and type `node --version`

2. **npm installed** (comes with Node.js)
   - Verify installation: Type `npm --version`

If you don't have these installed, the batch scripts will warn you and exit.

---

## 🎯 Running the Application

### **Method 1: Using run.bat (Recommended)**

This is the easiest way to get started:

1. Open the project folder: `g:\Latest Working Projects\Nodeforge V 5.1.0\Draw.io\`
2. **Double-click `run.bat`**
3. Wait for the build to complete (~30-60 seconds on first run)
4. The NodeForge application will launch automatically

**What happens automatically:**
- ✓ Checks Node.js and npm installation
- ✓ Installs missing dependencies (only first time)
- ✓ Compiles TypeScript code
- ✓ Bundles React code with Vite
- ✓ Launches the Electron application
- ✓ Shows helpful status messages

---

### **Method 2: Using start.bat (Interactive Menu)**

For a menu-driven interface:

1. **Double-click `start.bat`**
2. Choose from the options:
   - **[1] Run Application** - Start the app
   - **[2] Build Project** - Compile code only
   - **[3] Create Installer** - Generate .exe file
   - **[4] Install Dependencies** - Manual npm install
   - **[5] Open in Explorer** - View project files
   - **[6] Exit** - Close menu

---

### **Method 3: Command Line (Manual)**

Open Command Prompt or PowerShell in the project folder:

```bash
# First time only: Install dependencies
npm install

# Run the application
npm run electron:dev
```

---

## 🛠️ Available Commands

| Command | Batch File | Purpose |
|---------|-----------|---------|
| `npm run dev` | - | Start web development server (Vite) |
| `npm run build` | `build.bat` | Compile TypeScript & bundle with Vite |
| `npm run electron:dev` | `run.bat` | Build and run Electron app |
| `npm run package` | `package.bat` | Create Windows installer (.exe) |

---

## 📦 Creating a Standalone Installer

To create a Windows installer that you can share or install on other computers:

### **Option 1: Using package.bat**
```bash
Double-click package.bat
```

### **Option 2: Command Line**
```bash
npm run package
```

**Result:**
- Creates `dist/NodeForge-1.0.0.exe` installer
- Can be installed on any Windows computer
- No Node.js required to run the installed app

---

## ⚠️ Troubleshooting

### **Issue: "Node.js is not installed"**
- **Solution:** Install Node.js from https://nodejs.org/ (choose LTS version)
- Restart your computer after installation
- Try running the batch file again

### **Issue: "npm: command not found"**
- **Solution:** Node.js wasn't installed correctly
- Uninstall and reinstall Node.js
- Make sure to restart your computer

### **Issue: "Permission denied" or "cannot execute"**
- **Solution:** Windows blocked script execution
- Right-click the batch file → Properties → Unblock → Apply → OK
- Then double-click to run

### **Issue: App starts but shows blank white screen**
- Wait 10-30 seconds for the first load (Vite is bundling)
- Check browser console for errors (Ctrl+Shift+I in the app)
- Restart the application

### **Issue: Port 5173 is already in use**
- Another app is using the Vite dev server port
- Close other Node.js applications running in the terminal
- Or manually kill the process using that port

---

## 📂 Project Structure After Running

When you run the app for the first time, these folders are created:

```
Draw.io/
├── node_modules/        ← Dependencies (created by npm install)
├── dist/                ← Production build output
│   ├── index.html
│   ├── assets/
│   └── NodeForge-*.exe  ← Installer (after npm run package)
│
├── dist-electron/       ← Electron bundles
│   ├── main.js
│   └── preload.js
│
└── src/                 ← Source code (unchanged)
```

---

## 🎨 Using the Application

Once NodeForge opens:

1. **Create a new diagram** - Click "New Diagram"
2. **Drag shapes** from the left sidebar onto the canvas
3. **Connect shapes** - Drag from anchor points
4. **Save projects** - Ctrl+S or File → Save
5. **Export diagrams** - Ctrl+E or File → Export (PNG/SVG/PDF)

---

## 🔧 Development Mode Tips

When running with `run.bat` (development mode):

- **Hot Reload:** Changes to React code are reflected automatically (no restart needed)
- **DevTools:** Press `Ctrl+Shift+I` to open developer tools
- **Console:** Check the console for error messages and logs
- **Stop App:** Close the window or press `Ctrl+C` in the terminal

---

## 📝 First Run Checklist

- [ ] Node.js and npm installed and in PATH
- [ ] Project folder accessible at `g:\Latest Working Projects\Nodeforge V 5.1.0\Draw.io\`
- [ ] Double-clicked `run.bat` (or `start.bat`)
- [ ] Waited for initial build (~30-60 seconds)
- [ ] NodeForge application window appeared
- [ ] Can create and save diagrams

---

## 🆘 Getting Help

If you encounter issues:

1. **Check error messages** in the terminal window
2. **Delete node_modules** folder and run `npm install` again
3. **Update Node.js** to the latest LTS version
4. **Check firewall** settings if app won't start
5. **Restart your computer** and try again

---

## 🎯 Next Steps

After successfully running the app:

1. **Explore the Features**
   - Try different shape tools
   - Test connectors and routing
   - Export a diagram in different formats

2. **Customize**
   - Adjust grid settings
   - Change theme (light/dark mode)
   - Configure shortcut keys

3. **Create an Installer** (optional)
   - Run `package.bat` to create a `.exe` file
   - Share with others or install on other computers

---

**Enjoy using NodeForge! 🎉**

For more information, see:
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- [FIXES_APPLIED.md](FIXES_APPLIED.md)
- [electron-builder.yml](electron-builder.yml) - Installer configuration

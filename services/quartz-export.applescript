(*
  Quartz Export Automation for Safari
  - Navigates to /cv
  - Waits for the page to clean itself
  - Uses Safari's "Export as PDF…" menu
  - Saves the PDF to Desktop as "CV.pdf"

  Requirements:
  - System Settings → Privacy & Security:
    * Accessibility: allow "osascript"
    * Automation: allow "osascript" to control Safari and System Events
  - Safari must be installed and accessible as "Safari"
*)


-- Config (defaults)
set targetURL to "http://localhost:4321/cv"
set outputFilename to "CV.pdf"
set saveFolderPOSIX to "/Users/amanullah/Git Repos/amanssur.com/public/docs/"
set initialDelaySeconds to 3 -- wait for /cv to load and cleanup script to auto-run

-- Environment variable overrides (optional)
try
  set envURL to system attribute "QUARTZ_URL"
  if envURL is not missing value and envURL is not "" then set targetURL to envURL
end try

try
  set envOutDir to system attribute "QUARTZ_OUT_DIR"
  if envOutDir is not missing value and envOutDir is not "" then set saveFolderPOSIX to envOutDir
end try

try
  set envOutFile to system attribute "QUARTZ_OUT_FILE"
  if envOutFile is not missing value and envOutFile is not "" then set outputFilename to envOutFile
end try

try
  set envDelay to system attribute "QUARTZ_DELAY"
  if envDelay is not missing value and envDelay is not "" then set initialDelaySeconds to envDelay as number
end try

-- Normalize folder path to end with a slash
if (saveFolderPOSIX is not "") then
  try
    if (text -1 of saveFolderPOSIX) is not "/" then set saveFolderPOSIX to saveFolderPOSIX & "/"
  end try
end if

-- Ensure filename ends with .pdf (case-insensitive)
ignoring case
  if outputFilename does not end with ".pdf" then set outputFilename to outputFilename & ".pdf"
end ignoring

-- Helper to click Export menu (EN only)
on clickExportPDFMenu()
  tell application "System Events"
    tell process "Safari"
      set frontmost to true
      try
        click menu item ("Export as PDF" & character id 8230) of menu "File" of menu bar 1
        return true
      end try
    end tell
  end tell
  return false
end clickExportPDFMenu

tell application "Safari"
  activate
  open location targetURL
end tell

-- Wait for the page to load and cleanup script to auto-run
delay initialDelaySeconds

-- Trigger Export as PDF… menu
set menuClicked to clickExportPDFMenu()
if menuClicked is false then
  display dialog "Could not find 'Export as PDF…' in Safari's File menu." buttons {"OK"} default button 1 with icon caution giving up after 5
  return
end if

delay 0.6

-- Drive the Save dialog (target UI elements directly)
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    set w to window 1

    -- Wait for the Save sheet to attach to the window
    set tries to 0
    repeat until (exists sheet 1 of w) or tries > 100
      delay 0.05
      set tries to tries + 1
    end repeat
    if not (exists sheet 1 of w) then return
    set sh to sheet 1 of w

    -- Go to Folder (Cmd+Shift+G), type destination path, hit Return
    keystroke "G" using {command down, shift down}
    delay 0.2
    keystroke saveFolderPOSIX
    key code 36 -- Return
    delay 0.3

    -- Overwrite filename explicitly (don’t rely on keyboard focus)
    try
      set value of text field 1 of sh to outputFilename
    on error
      -- Fallback: keystroke if direct set fails
      keystroke outputFilename
    end try
    delay 0.2

    -- Click Save explicitly (fallback to Return if button not found)
    try
      click button "Save" of sh
    on error
      key code 36
    end try

    -- If a Replace? confirmation sheet appears, click Replace
    set tries to 0
    repeat while (exists sheet 1 of w) and tries < 60
      try
        click button "Replace" of sheet 1 of w
        exit repeat
      end try
      delay 0.1
      set tries to tries + 1
    end repeat
  end tell
end tell

return
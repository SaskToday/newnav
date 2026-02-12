# Debugging Navigation Loading Issues

## The Problem

Nav loads on first page but disappears on subsequent pages. No console errors.

## Root Cause Analysis

The navigation script checks for a `<header>` element:
```javascript
const targetHeader = document.querySelector('header');
if (targetHeader) {
    // Insert nav
}
```

If `targetHeader` is `null`, the nav won't be inserted.

## Debugging Steps

### 1. Check if Header Exists

On a page where nav disappears, open console and run:
```javascript
document.querySelector('header')
```

**Expected:** Should return the header element
**If null:** That's the problem - header doesn't exist or isn't loaded yet

### 2. Check Script Loading

In console, check:
```javascript
window.navVersion
```

**Expected:** Should show version string (e.g., "2024-12-19-d0258e6")
**If undefined:** Script didn't load or execute

### 3. Check Timing

The script uses `DOMContentLoaded`, but if header is added dynamically, it might not exist yet.

### 4. Check for Duplicate Nav

Some pages might already have nav HTML, causing conflicts:
```javascript
document.querySelector('#village-nav-container')
```

**Expected:** Should return one element (or null if not inserted)
**If multiple:** Duplicate nav containers exist

## Solutions

### Solution 1: Wait for Header (Recommended)

Modify script to wait for header if it doesn't exist immediately.

### Solution 2: Check Before Inserting

Check if nav already exists before inserting.

### Solution 3: Use MutationObserver

Watch for header element to be added dynamically.

### Solution 4: Fallback Insertion Point

If no header, insert into body or another element.


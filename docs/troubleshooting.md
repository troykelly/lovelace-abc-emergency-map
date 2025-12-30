# Troubleshooting Guide

Common issues and their solutions for the ABC Emergency Map Card.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Display Issues](#display-issues)
- [Performance Issues](#performance-issues)
- [Integration Issues](#integration-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### Card Not Appearing in Lovelace

**Symptoms:**
- Card doesn't show in the "Add Card" dialog
- "Custom element doesn't exist" error

**Solutions:**

1. **Refresh your browser**
   - Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - This clears cached JavaScript

2. **Verify resource is loaded**
   - Go to **Settings** > **Dashboards** > **Resources**
   - Check that `abc-emergency-map-card.js` is listed
   - Verify the URL is correct

3. **Check HACS installation**
   - Open HACS > Frontend
   - Verify "ABC Emergency Map Card" shows as installed
   - Try reinstalling if issues persist

4. **Check browser console**
   - Press `F12` to open Developer Tools
   - Look for errors in the Console tab
   - Common errors:
     - `404 Not Found` - Resource URL incorrect
     - `SyntaxError` - Corrupted download

### "Custom element doesn't exist: abc-emergency-map-card"

**Cause:** The JavaScript module hasn't loaded.

**Solutions:**

1. **Check resource URL:**
   ```yaml
   # Correct format
   resources:
     - url: /hacsfiles/abc-emergency-map-card/abc-emergency-map-card.js
       type: module
   ```

2. **Clear browser cache completely:**
   - Chrome: Settings > Privacy > Clear browsing data > Cached images and files

3. **Restart Home Assistant:**
   - Sometimes required after HACS installations

---

## Configuration Issues

### Map Shows But No Polygons

**Symptoms:**
- Map loads correctly
- No incident polygons visible
- Badge shows "0"

**Possible Causes:**

1. **No active incidents (good news!)**
   - Check [ABC Emergency](https://www.abc.net.au/emergency) for current incidents
   - If there are no incidents, the map will be empty

2. **ABC Emergency Integration not installed**
   - Install from: https://github.com/troykelly/homeassistant-abcemergency
   - Configure the integration after installation

3. **Wrong entity configuration**
   - Check that entities exist in Developer Tools > States
   - Verify entity IDs are correct

4. **`geo_location_sources` misconfigured**
   ```yaml
   # Correct format
   geo_location_sources:
     - sensor.abc_emergency_auremer_incidents_total
   ```

### Map is Blank/Grey

**Symptoms:**
- Card appears but map is blank
- Grey/white area where map should be

**Possible Causes:**

1. **Tile provider issues**
   ```yaml
   # Try default provider
   tile_provider: osm
   ```

2. **API key missing (Mapbox)**
   ```yaml
   tile_provider: mapbox
   api_key: pk.your_valid_mapbox_key  # Required!
   ```

3. **Network/firewall blocking tiles**
   - Check if you can access tile URLs directly
   - Corporate firewalls may block OpenStreetMap

4. **Custom tile URL incorrect**
   ```yaml
   # Verify URL format
   tile_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
   ```

### Wrong Location Displayed

**Symptoms:**
- Map shows unexpected area
- Entities not visible

**Solutions:**

1. **Set explicit center/zoom:**
   ```yaml
   default_zoom: 10
   auto_fit: false
   ```

2. **Check entity coordinates:**
   - Developer Tools > States
   - Verify latitude/longitude are correct

3. **Disable auto-fit temporarily:**
   ```yaml
   auto_fit: false
   ```

---

## Display Issues

### Dark Mode Not Working

**Symptoms:**
- Map stays light when HA is in dark mode
- Incorrect theme colors

**Solutions:**

1. **Check `dark_mode` setting:**
   ```yaml
   dark_mode: auto  # Should detect automatically
   ```

2. **Use provider with dark support:**
   ```yaml
   tile_provider: cartodb  # Has dark variant
   dark_mode: auto
   ```

3. **Force dark mode:**
   ```yaml
   dark_mode: dark
   ```

### Zones Not Showing

**Symptoms:**
- Zones exist in HA but not on map

**Solutions:**

1. **Enable zones:**
   ```yaml
   show_zones: true
   ```

2. **Check zone configuration:**
   - Developer Tools > States > zone.*
   - Verify zones have latitude, longitude, and radius

3. **Zoom out:**
   - Zones may be outside current view
   - Enable auto-fit: `auto_fit: true`

### Badge Not Displaying

**Symptoms:**
- No badge visible on map

**Solutions:**

1. **Enable badge:**
   ```yaml
   show_badge: true
   ```

2. **No incidents:**
   - Badge may hide when count is 0
   - Verify incidents exist

3. **Check position:**
   ```yaml
   badge_position: top-right  # Try different positions
   ```

### Animations Not Working

**Symptoms:**
- No pulse effects on new incidents
- No transition animations

**Solutions:**

1. **Enable animations:**
   ```yaml
   animations_enabled: true
   geometry_transitions: true
   ```

2. **Check browser settings:**
   - Some browsers/OS have "reduce motion" enabled
   - The card respects `prefers-reduced-motion`

3. **Verify incident is "new":**
   - Only incidents < 5 minutes old animate

---

## Performance Issues

### Map is Slow/Laggy

**Symptoms:**
- Slow pan/zoom
- Delayed updates
- Browser becomes unresponsive

**Solutions:**

1. **Reduce history window:**
   ```yaml
   hours_to_show: 12  # Reduce from 24
   show_history: false  # Disable if not needed
   ```

2. **Limit entities:**
   ```yaml
   history_entities:
     - person.john  # Only specific entities
   ```

3. **Disable animations:**
   ```yaml
   animations_enabled: false
   geometry_transitions: false
   ```

4. **Use simpler tiles:**
   ```yaml
   tile_provider: osm  # Lighter than Mapbox
   ```

### High Memory Usage

**Symptoms:**
- Browser tab uses excessive memory
- Page crashes on mobile

**Solutions:**

1. **Reduce history:**
   ```yaml
   hours_to_show: 6
   show_history: false
   ```

2. **Limit incident sources:**
   ```yaml
   geo_location_sources:
     - sensor.abc_emergency_auremer_emergency_warnings  # Only high priority
   ```

---

## Integration Issues

### Entity Not Updating

**Symptoms:**
- Map shows stale data
- Incidents don't update

**Solutions:**

1. **Check ABC Emergency Integration:**
   - Developer Tools > States
   - Verify geo_location entities are updating

2. **Restart integration:**
   - Settings > Integrations > ABC Emergency > Reload

3. **Check WebSocket connection:**
   - Browser console for connection errors

### Entity ID Mismatch

**Symptoms:**
- Sensors report entities that don't exist
- `geo_location_sources` doesn't find entities

**Known Issue:** Entity IDs generated by sensors may not match actual entity IDs.

**Workaround:**
- Use explicit entity configuration instead of `geo_location_sources`
- Check actual entity IDs in Developer Tools > States

---

## Browser Console Debugging

### How to Access

1. Press `F12` to open Developer Tools
2. Click "Console" tab
3. Filter by "abc-emergency" if available

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Not Found` | Resource URL wrong | Fix URL in Resources |
| `Uncaught TypeError` | API mismatch | Update card to latest |
| `Failed to fetch` | Network issue | Check internet/firewall |
| `Invalid configuration` | YAML error | Validate configuration |

### Getting Debug Information

For bug reports, include:
1. Browser console errors
2. Card configuration (YAML)
3. Home Assistant version
4. Card version
5. Screenshot of issue

---

## Getting Help

### Before Reporting an Issue

1. **Update to latest version** - Many issues are fixed in updates
2. **Check existing issues** - Your problem may already be reported
3. **Try minimal configuration** - Isolate the issue

### Reporting an Issue

File issues at: https://github.com/troykelly/lovelace-abc-emergency-map/issues

Include:
- Card version
- Home Assistant version
- Browser and version
- Configuration (YAML)
- Console errors
- Steps to reproduce

### Community Help

- [Home Assistant Community](https://community.home-assistant.io/)
- [GitHub Discussions](https://github.com/troykelly/lovelace-abc-emergency-map/discussions)

---

## See Also

- [Getting Started](getting-started.md) - Installation guide
- [Configuration](configuration.md) - Configuration reference
- [Features](features.md) - Feature documentation

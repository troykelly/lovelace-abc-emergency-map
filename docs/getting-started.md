# Getting Started

Get the ABC Emergency Map Card up and running in under 5 minutes.

## Prerequisites

Before installing this card, ensure you have:

1. **Home Assistant 2024.1 or newer**
2. **[ABC Emergency Integration](https://github.com/troykelly/homeassistant-abcemergency)** installed and configured
3. **HACS** (Home Assistant Community Store) - recommended for easy installation

> **Note:** The ABC Emergency Integration provides the incident data that this card displays. Install it first before proceeding.

---

## Installation

### Option 1: HACS (Recommended)

1. Open **HACS** in your Home Assistant sidebar
2. Click on **Frontend**
3. Click the **three dots** menu (top right) and select **Custom repositories**
4. Add the repository:
   - **Repository:** `https://github.com/troykelly/lovelace-abc-emergency-map`
   - **Category:** `Lovelace`
5. Click **Add**
6. Search for **ABC Emergency Map Card** in HACS
7. Click **Install**
8. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)

### Option 2: Manual Installation

1. Download `abc-emergency-map-card.js` from the [latest release](https://github.com/troykelly/lovelace-abc-emergency-map/releases)
2. Copy the file to your Home Assistant config directory:
   ```
   config/www/community/abc-emergency-map-card/abc-emergency-map-card.js
   ```
3. Add the resource to your Lovelace configuration:

   **Via UI:**
   - Go to **Settings** > **Dashboards**
   - Click **three dots** menu > **Resources**
   - Click **Add Resource**
   - URL: `/local/community/abc-emergency-map-card/abc-emergency-map-card.js`
   - Type: `JavaScript Module`

   **Via YAML:**
   ```yaml
   resources:
     - url: /local/community/abc-emergency-map-card/abc-emergency-map-card.js
       type: module
   ```

4. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)

---

## Adding the Card to Your Dashboard

### Using the Visual Editor

1. Go to your dashboard
2. Click the **three dots** menu (top right)
3. Click **Edit Dashboard**
4. Click **Add Card**
5. Search for **ABC Emergency Map Card**
6. Configure using the visual editor

### Using YAML

1. Go to your dashboard
2. Click the **three dots** menu (top right)
3. Click **Edit Dashboard**
4. Click **Add Card**
5. Click **Manual** at the bottom
6. Enter:

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
```

---

## Basic Configuration

The simplest configuration just requires the card type:

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
```

This will:
- Display all ABC Emergency incidents as polygons
- Show the Australian Warning System colors
- Auto-fit the map to show all incidents
- Enable animations for new/updated incidents

### Adding Entity Tracking

To also show people or devices on the map:

```yaml
type: custom:abc-emergency-map-card
title: Emergency Map
entities:
  - person.john
  - person.jane
  - device_tracker.phone
```

### Filtering Incidents by Type

Use `geo_location_sources` to show specific incident types:

```yaml
type: custom:abc-emergency-map-card
title: Bushfires Only
geo_location_sources:
  - sensor.abc_emergency_auremer_bushfires
```

Available sensors from ABC Emergency Integration:
- `sensor.abc_emergency_*_incidents_total` - All incidents
- `sensor.abc_emergency_*_bushfires` - Bushfire incidents only
- `sensor.abc_emergency_*_floods` - Flood incidents only
- `sensor.abc_emergency_*_storms` - Storm incidents only
- `sensor.abc_emergency_*_emergency_warnings` - Emergency Warning level only
- `sensor.abc_emergency_*_watch_and_acts` - Watch and Act level only
- `sensor.abc_emergency_*_advices` - Advice level only

---

## Verifying It Works

### When There Are No Incidents

If there are no current emergency incidents (which is good news!), you'll see:
- An empty map centered on your configured location
- A badge showing "0" incidents
- Any configured entities (people, devices) displayed as markers

### When There Are Incidents

When incidents are active, you'll see:
- Colored polygons showing incident boundaries
- Colors matching the Australian Warning System (red = emergency, orange = watch and act, etc.)
- Pulse animations on new incidents
- A badge showing the incident count

### Troubleshooting

If the card doesn't appear:
1. **Clear your browser cache** (Ctrl+F5)
2. **Check the browser console** (F12) for errors
3. **Verify the resource is loaded** in Settings > Dashboards > Resources
4. **Ensure ABC Emergency Integration** is installed and working

See [Troubleshooting Guide](troubleshooting.md) for more help.

---

## Next Steps

Now that you have the card working:

- **[Configuration Reference](configuration.md)** - Explore all 40+ configuration options
- **[Features Guide](features.md)** - Learn about all card features
- **[Example Configurations](examples/)** - Copy-paste examples for common use cases
- **[Australian Warning System](australian-warning-system.md)** - Understand alert level colors

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/troykelly/lovelace-abc-emergency-map/issues)
- **Discussions:** [GitHub Discussions](https://github.com/troykelly/lovelace-abc-emergency-map/discussions)
- **ABC Emergency Integration:** [Integration Repository](https://github.com/troykelly/homeassistant-abcemergency)

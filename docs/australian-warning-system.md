# Australian Warning System

The ABC Emergency Map Card uses the official Australian Warning System (AWS) color scheme to display emergency incident severity.

---

## Overview

The Australian Warning System provides a nationally consistent approach to emergency warnings across all hazards. It uses a simple, recognizable system of colors and icons to help Australians understand the level of threat and take appropriate action.

---

## Alert Levels

### Emergency Warning (Extreme)

<table>
<tr>
<td width="100" style="background-color: #cc0000; color: white; text-align: center; font-weight: bold; padding: 20px;">
RED<br>#cc0000
</td>
<td>

**You are in immediate danger and need to take action to survive.**

This is the highest level of warning. Conditions are occurring or about to occur that will be life-threatening.

**What to do:**
- Follow your emergency plan NOW
- It may be too late to leave - seek shelter immediately
- Protect yourself and help others if safe to do so

**Visual on map:** Red polygon with persistent pulse animation

</td>
</tr>
</table>

### Watch and Act (Severe)

<table>
<tr>
<td width="100" style="background-color: #ff6600; color: white; text-align: center; font-weight: bold; padding: 20px;">
ORANGE<br>#ff6600
</td>
<td>

**There is a heightened level of threat. Conditions are changing and you need to start taking action now.**

This level indicates conditions are worsening. You need to take action to protect yourself and your family.

**What to do:**
- Activate your emergency plan
- Prepare to leave or prepare to shelter
- Keep monitoring official information

**Visual on map:** Orange polygon with pulse animation for new incidents

</td>
</tr>
</table>

### Advice (Moderate)

<table>
<tr>
<td width="100" style="background-color: #ffcc00; color: black; text-align: center; font-weight: bold; padding: 20px;">
YELLOW<br>#ffcc00
</td>
<td>

**An incident is occurring. Stay informed and monitor conditions.**

This is the initial warning level. While there's no immediate threat to life, you should be aware of the situation.

**What to do:**
- Stay informed via official channels
- Review your emergency plan
- Prepare to take action if situation escalates

**Visual on map:** Yellow polygon, standard display

</td>
</tr>
</table>

### Information (Minor)

<table>
<tr>
<td width="100" style="background-color: #3366cc; color: white; text-align: center; font-weight: bold; padding: 20px;">
BLUE<br>#3366cc
</td>
<td>

**General information about an event or incident.**

This level provides information about incidents that may be of interest but don't pose an immediate threat.

**What to do:**
- Be aware of the situation
- No specific action required
- Continue normal activities while staying informed

**Visual on map:** Blue polygon, standard display

</td>
</tr>
</table>

---

## Color Values

For reference, these are the exact color values used:

| Level | Hex Code | RGB | CSS Variable |
|-------|----------|-----|--------------|
| Emergency Warning | `#cc0000` | rgb(204, 0, 0) | `--alert-extreme` |
| Watch and Act | `#ff6600` | rgb(255, 102, 0) | `--alert-severe` |
| Advice | `#ffcc00` | rgb(255, 204, 0) | `--alert-moderate` |
| Information | `#3366cc` | rgb(51, 102, 204) | `--alert-minor` |

---

## Visual Hierarchy

The card uses visual hierarchy to ensure the most critical information is always visible:

### Z-Ordering

Polygons are layered by severity:
1. **Bottom:** Information (blue) - least critical
2. **Layer 2:** Advice (yellow)
3. **Layer 3:** Watch and Act (orange)
4. **Top:** Emergency Warning (red) - most critical

This ensures Emergency Warnings are never hidden behind lower-severity incidents.

### Animations

| Level | Animation | Duration |
|-------|-----------|----------|
| Emergency Warning | Persistent pulse | Continuous |
| Watch and Act | Pulse on new | 3 cycles |
| Advice | None | - |
| Information | None | - |

---

## Accessibility Considerations

### Color Blindness

The AWS colors were chosen to be distinguishable for most forms of color blindness. However, the card also uses:

- **Pattern differences** - Emergency warnings use persistent animation
- **Text labels** - Popups clearly state the warning level
- **Spatial hierarchy** - More severe incidents render on top

### Contrast Ratios

| Level | Background | Foreground | Ratio |
|-------|------------|------------|-------|
| Emergency Warning | #cc0000 | White | 5.9:1 |
| Watch and Act | #ff6600 | White | 3.4:1* |
| Advice | #ffcc00 | Black | 11.2:1 |
| Information | #3366cc | White | 4.6:1 |

*Watch and Act uses enhanced visual indicators to compensate.

---

## Important Safety Notice

> **This card is for informational purposes only.**
>
> - Always follow official emergency services advice
> - Do not rely solely on this card for emergency decisions
> - If you are in danger, call **000** immediately
> - For official emergency information, visit [ABC Emergency](https://www.abc.net.au/emergency)

---

## Official Resources

### National
- [Australian Warning System](https://www.aidr.org.au/programs/australian-warning-system/) - Official information
- [ABC Emergency](https://www.abc.net.au/emergency) - National emergency coverage

### State Emergency Services
- **NSW:** [NSW SES](https://www.ses.nsw.gov.au/) | [NSW RFS](https://www.rfs.nsw.gov.au/)
- **VIC:** [Emergency Victoria](https://www.emergency.vic.gov.au/)
- **QLD:** [Queensland Fire and Emergency](https://www.qfes.qld.gov.au/)
- **SA:** [SA Country Fire Service](https://www.cfs.sa.gov.au/)
- **WA:** [DFES WA](https://www.dfes.wa.gov.au/)
- **TAS:** [Tasmania Fire Service](https://www.fire.tas.gov.au/)
- **NT:** [NT Emergency Services](https://pfes.nt.gov.au/)
- **ACT:** [ACT Emergency Services](https://esa.act.gov.au/)

---

## See Also

- [Features](features.md) - All card features
- [Configuration](configuration.md) - Configuration options
- [Generic GeoJSON](generic-geojson.md) - Using with other data sources

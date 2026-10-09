function colorValues(raw) {
  var values = ({})
  var lines = String(raw || "").split("\n")
  for (var i = 0; i < lines.length; i++) {
    var match = lines[i].match(/^\s*([A-Za-z0-9_-]+)\s*=\s*["']?(#[0-9A-Fa-f]{6})(?:["']?\s*(?:#.*)?)?$/)
    if (match) values[String(match[1]).toLowerCase()] = match[2].toUpperCase()
  }
  return values
}

function channel(value) {
  var normalized = value / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

function luminance(color) {
  var hex = String(color || "").replace("#", "")
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return -1
  return 0.2126 * channel(parseInt(hex.slice(0, 2), 16))
    + 0.7152 * channel(parseInt(hex.slice(2, 4), 16))
    + 0.0722 * channel(parseInt(hex.slice(4, 6), 16))
}

function contrast(left, right) {
  var first = luminance(left)
  var second = luminance(right)
  if (first < 0 || second < 0) return 0
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

function addVisible(palette, seen, color, background, minimumContrast) {
  var normalized = String(color || "").toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(normalized) || seen[normalized]) return
  if (contrast(normalized, background) < minimumContrast) return
  palette.push(normalized)
  seen[normalized] = true
}

function fromOmarchyColors(raw) {
  var values = colorValues(raw)
  var background = values.background || values.color0
  if (!background) return []

  var palette = []
  var seen = ({})
  var minimumContrast = 2.25

  // Cover the six ANSI hues once. For each hue, use whichever of the normal
  // or bright variant reads most clearly against the terminal background.
  var ansiNames = ["red", "green", "yellow", "blue", "magenta", "cyan"]
  for (var index = 1; index <= 6; index++) {
    var name = ansiNames[index - 1]
    var normal = values["color" + index] || values[name]
    var bright = values["color" + (index + 8)] || values["bright_" + name]
    var selected = contrast(bright, background) > contrast(normal, background) ? bright : normal
    addVisible(palette, seen, selected, background, minimumContrast)
  }

  // Sparse custom palettes sometimes define only a few usable ANSI hues.
  // Neutral foreground and accent colors provide enough variation without
  // admitting colors that disappear into the terminal background.
  if (palette.length < 4) {
    addVisible(palette, seen, values.foreground, background, minimumContrast)
    addVisible(palette, seen, values.accent, background, minimumContrast)
    addVisible(palette, seen, values.color15, background, minimumContrast)
    addVisible(palette, seen, values.color7, background, minimumContrast)
  }

  return palette.length >= 3 ? palette : []
}

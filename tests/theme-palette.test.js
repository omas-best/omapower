const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")

const source = fs.readFileSync(__dirname + "/../ThemePalette.js", "utf8")
const palette = {}
vm.createContext(palette)
vm.runInContext(source, palette)

const darkTheme = `
background = "#101010"
foreground = "#f0f0f0"
accent = "#55aaff"
color1 = "#700000"
color2 = "#007000"
color3 = "#707000"
color4 = "#000070"
color5 = "#700070"
color6 = "#007070"
color9 = "#ff5555"
color10 = "#55ff55"
color11 = "#ffff55"
color12 = "#5555ff"
color13 = "#ff55ff"
color14 = "#55ffff"
`

assert.deepEqual(
  Array.from(palette.fromOmarchyColors(darkTheme)),
  ["#FF5555", "#55FF55", "#FFFF55", "#5555FF", "#FF55FF", "#55FFFF"],
  "dark themes should prefer the visible bright ANSI variants"
)

const lightTheme = darkTheme
  .replace('#101010', '#f8f8f8')
  .replace('#f0f0f0', '#101010')

assert.deepEqual(
  Array.from(palette.fromOmarchyColors(lightTheme)),
  ["#700000", "#007000", "#707000", "#000070", "#700070", "#007070"],
  "light themes should prefer the visible normal ANSI variants"
)

const namedTheme = `
background = "#101010"
red = "#ff5555"
green = "#55ff55"
yellow = "#ffff55"
blue = "#5555ff"
magenta = "#ff55ff"
cyan = "#55ffff"
bright_red = "#ff7777"
bright_green = "#77ff77"
bright_yellow = "#ffff77"
bright_blue = "#7777ff"
bright_magenta = "#ff77ff"
bright_cyan = "#77ffff"
`

assert.deepEqual(
  Array.from(palette.fromOmarchyColors(namedTheme)),
  ["#FF7777", "#77FF77", "#FFFF77", "#7777FF", "#FF77FF", "#77FFFF"],
  "current Omarchy named ANSI colors should be supported"
)

assert.deepEqual(Array.from(palette.fromOmarchyColors("not toml")), [], "invalid input should request fallback")
assert.deepEqual(
  Array.from(palette.fromOmarchyColors('background = "#111111"\ncolor1 = "#121212"')),
  [],
  "a sparse invisible palette should request fallback"
)

console.log("theme palette tests passed")

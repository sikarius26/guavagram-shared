// Tailwind preset shared between guavagram/ (public) and guavagram-admin/.
// Both apps' tailwind.config.js do:
//   presets: [require('@guava/guavagram-shared/tailwind-preset')]
// and include this package's source in their `content` array so classes
// used only inside shared components aren't purged.
//
// Phase 0 = empty placeholder. Phase 1 will populate it with the shared
// theme tokens (colors, fonts, radii) currently duplicated in each app's
// tailwind.config.js.
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [],
}

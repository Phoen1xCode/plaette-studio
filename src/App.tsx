import AppToaster from "@/components/layout/AppToaster";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ComponentPreview from "@/components/preview/ComponentPreview";
import HeroSection from "@/components/sections/HeroSection";
import MethodSection from "@/components/sections/MethodSection";
import ExportDialog from "@/components/studio/ExportDialog";
import PaletteWorkspace from "@/components/studio/PaletteWorkspace";
import StudioControls from "@/components/studio/StudioControls";
import StudioHighlights from "@/components/studio/StudioHighlights";
import { usePaletteStudio } from "@/hooks/usePaletteStudio";

export default function App() {
  const studio = usePaletteStudio();

  return (
    <>
      <SiteHeader />
      <main id="top">
        <HeroSection colors={studio.theme.light} />
        <section className="studio" id="studio" aria-label="Palette studio">
          <StudioControls
            primary={studio.primary}
            input={studio.input}
            error={studio.error}
            mode={studio.mode}
            neutral={studio.neutral}
            onColorChange={studio.updateColor}
            onModeChange={studio.setMode}
            onNeutralChange={studio.changeNeutral}
          />
          <PaletteWorkspace
            colors={studio.colors}
            neutrals={studio.neutrals}
            mode={studio.mode}
            neutral={studio.neutral}
            family={studio.family}
            selected={studio.selected}
            copied={studio.copied}
            onSelect={studio.selectShade}
            onCopy={(color) => void studio.copy(color)}
            onExport={() => studio.setExportOpen(true)}
          />
        </section>
        <StudioHighlights />
        <ComponentPreview
          theme={studio.theme}
          mode={studio.mode}
          notify={studio.notify}
        />
        <MethodSection />
        <SiteFooter />
      </main>
      <ExportDialog
        theme={studio.theme}
        open={studio.exportOpen}
        onClose={() => studio.setExportOpen(false)}
        copy={(text, label) => void studio.copy(text, label)}
        notify={studio.notify}
      />
      <AppToaster />
    </>
  );
}

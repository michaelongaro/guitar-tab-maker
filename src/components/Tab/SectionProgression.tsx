import { useState, useEffect } from "react";
import { useTabStore } from "~/stores/TabStore";
import { shallow } from "zustand/shallow";
import { Button } from "../ui/button";
import { BsArrowRightShort } from "react-icons/bs";

function SectionProgression() {
  const [aboveMediumViewportWidth, setAboveMediumViewportWidth] =
    useState(false);

  const {
    editing,
    tabData,
    sectionProgression,
    setSectionProgression,
    setShowSectionProgressionModal,
  } = useTabStore(
    (state) => ({
      editing: state.editing,
      tabData: state.tabData,
      sectionProgression: state.sectionProgression,
      setSectionProgression: state.setSectionProgression,
      setShowSectionProgressionModal: state.setShowSectionProgressionModal,
    }),
    shallow
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setAboveMediumViewportWidth(true);
      } else {
        setAboveMediumViewportWidth(false);
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        minWidth: aboveMediumViewportWidth
          ? sectionProgression.length === 0
            ? "450px"
            : "500px"
          : "300px",
      }}
      className="lightGlassmorphic baseVertFlex mb-4 mt-4
        max-w-[75%] gap-4 rounded-md p-4 md:m-0 md:!items-start"
    >
      <p className="text-lg font-semibold text-pink-50">
        {sectionProgression.length === 0
          ? "No section progression specified"
          : "Section progression"}
      </p>

      {sectionProgression.length > 0 && (
        <div className="baseVertFlex !items-start gap-2 md:flex-row">
          {sectionProgression.map((section) => (
            <div key={section.id} className="baseFlex gap-2">
              <p className="font-semibold">{section.title}</p>
              <p>x{section.repetitions}</p>

              {section.index !== sectionProgression.length - 1 && (
                <BsArrowRightShort className="h-6 w-8 text-pink-50" />
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Button
          size={"sm"}
          className="block md:hidden"
          onClick={() => setShowSectionProgressionModal(true)}
        >
          {sectionProgression.length === 0 ? "Add one" : "Edit"}
        </Button>
      )}

      {editing && (
        <Button
          size={"sm"}
          className="absolute right-3 top-3 hidden md:block"
          onClick={() => setShowSectionProgressionModal(true)}
        >
          {sectionProgression.length === 0 ? "Add one" : "Edit"}
        </Button>
      )}
    </div>
  );
}

export default SectionProgression;
